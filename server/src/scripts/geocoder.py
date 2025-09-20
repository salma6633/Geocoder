# Import necessary libraries
import os
import json
import joblib
import numpy as np
import pandas as pd
import faiss
import re
from typing import Dict, List, Tuple, Optional
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import StandardScaler
from rapidfuzz import fuzz, process as rapid_process
import jellyfish
from math import radians, sin, cos, asin, sqrt
import xgboost as xgb
import warnings
warnings.filterwarnings('ignore')

# Mount Google Drive (if models are stored there, optional for local runs)
# drive.mount("/content/drive", force_remount=True)

# Define the models directory path
models_dir = r"C:\Users\salma\Downloads\Etijahat-main (1)\Etijahat-main\server\models"

# Install necessary dependencies (uncomment if needed)
# !pip install -q numpy pandas joblib faiss-cpu sentence-transformers scikit-learn rapidfuzz jellyfish xgboost python-Levenshtein

# Define EnhancedXGBoostGeocoder class
class EnhancedXGBoostGeocoder:
    def __init__(self):
        self.lat_model = None
        self.lon_model = None

    def train(self, X_train, y_train, X_val=None, y_val=None, weights_train=None):
        print("Training Enhanced XGBoost Geocoder...")
        params = {
            'objective': 'reg:squarederror',
            'n_estimators': 800,
            'max_depth': 6,
            'learning_rate': 0.1,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'tree_method': 'hist',
            'random_state': 42
        }
        self.lat_model = xgb.XGBRegressor(**params)
        self.lon_model = xgb.XGBRegressor(**params)
        self.lat_model.fit(X_train, y_train[:, 0], sample_weight=weights_train)
        self.lon_model.fit(X_train, y_train[:, 1], sample_weight=weights_train)
        if X_val is not None and y_val is not None:
            print("Evaluating on validation set...")
            val_pred = self.predict(X_val)
            from sklearn.metrics import mean_squared_error
            mse_lat = mean_squared_error(y_val[:, 0], val_pred[:, 0])
            mse_lon = mean_squared_error(y_val[:, 1], val_pred[:, 1])
            print(f"Validation MSE - Latitude: {mse_lat:.6f}, Longitude: {mse_lon:.6f}")
        return self

    def predict(self, X):
        lat_pred = self.lat_model.predict(X)
        lon_pred = self.lon_model.predict(X)
        return np.column_stack((lat_pred, lon_pred))

# Define HybridXGBFAISSGeocoder class
class HybridXGBFAISSGeocoder:
    def __init__(self, k_neighbors=3, models_dir=models_dir):
        self.xgb_geocoder = EnhancedXGBoostGeocoder()
        self.faiss_lat_index = None
        self.faiss_lon_index = None
        self.residuals = None
        self.k = k_neighbors
        self.X_train_ref = None
        self.weights_train = None
        self.distance_weighting = 'inverse_squared'
        self.residual_cap = 0.01
        self.models_dir = models_dir

    def train(self, X_train, y_train, X_val=None, y_val=None, weights_train=None):
        print("🔥 Training Hybrid XGBoost + FAISS model...")
        self.xgb_geocoder.train(X_train, y_train, X_val, y_val, weights_train=weights_train)
        xgb_pred = self.xgb_geocoder.predict(X_train)
        self.residuals = y_train - xgb_pred
        self.weights_train = weights_train
        d = X_train.shape[1]
        X_train_f32 = X_train.astype(np.float32)
        self.faiss_lat_index = faiss.IndexFlatL2(d)
        self.faiss_lon_index = faiss.IndexFlatL2(d)
        self.faiss_lat_index.add(X_train_f32)
        self.faiss_lon_index.add(X_train_f32)
        self.X_train_ref = X_train_f32
        os.makedirs(self.models_dir, exist_ok=True)
        faiss.write_index(self.faiss_lat_index, os.path.join(self.models_dir, 'faiss_lat_index.index'))
        faiss.write_index(self.faiss_lon_index, os.path.join(self.models_dir, 'faiss_lon_index.index'))
        np.save(os.path.join(self.models_dir, 'X_train_ref.npy'), X_train_f32)
        np.save(os.path.join(self.models_dir, 'residuals.npy'), self.residuals)
        if self.weights_train is not None:
            np.save(os.path.join(self.models_dir, 'sample_weights.npy'), self.weights_train)
        print(f"✅ FAISS indexes built with {len(X_train)} reference points")
        return self

    def load_artifacts(self):
        self.faiss_lat_index = faiss.read_index(os.path.join(self.models_dir, 'faiss_lat_index.index'))
        self.faiss_lon_index = faiss.read_index(os.path.join(self.models_dir, 'faiss_lon_index.index'))
        self.X_train_ref = np.load(os.path.join(self.models_dir, 'X_train_ref.npy'))
        self.residuals = np.load(os.path.join(self.models_dir, 'residuals.npy'))
        weights_path = os.path.join(self.models_dir, 'sample_weights.npy')
        if os.path.exists(weights_path):
            self.weights_train = np.load(weights_path)
        else:
            self.weights_train = None

    def predict(self, X):
        if self.xgb_geocoder.lat_model is None or self.xgb_geocoder.lon_model is None:
            raise ValueError("Models not trained yet. Call train() first.")
        if self.faiss_lat_index is None:
            self.load_artifacts()
        xgb_pred = self.xgb_geocoder.predict(X)
        X_f32 = X.astype(np.float32)
        dist_lat, idx_lat = self.faiss_lat_index.search(X_f32, self.k)
        dist_lon, idx_lon = self.faiss_lon_index.search(X_f32, self.k)
        eps = 1e-8
        weights_lat = 1 / (dist_lat + eps)
        weights_lon = 1 / (dist_lon + eps)
        weights_lat /= weights_lat.sum(axis=1, keepdims=True)
        weights_lon /= weights_lon.sum(axis=1, keepdims=True)
        if self.weights_train is not None:
            weights_lat = weights_lat * self.weights_train[idx_lat]
            weights_lon = weights_lon * self.weights_train[idx_lon]
            weights_lat /= weights_lat.sum(axis=1, keepdims=True)
            weights_lon /= weights_lon.sum(axis=1, keepdims=True)
        correction_lat = (weights_lat * self.residuals[idx_lat, 0]).sum(axis=1)
        correction_lon = (weights_lon * self.residuals[idx_lon, 1]).sum(axis=1)
        final_pred = xgb_pred + np.column_stack((correction_lat, correction_lon))
        return final_pred

# Define FixedHybridGeocoder class
class FixedHybridGeocoder:
    def __init__(self, models_dir: str = models_dir):
        self.models_dir = models_dir
        self.artifacts = {}
        self.is_loaded = False
        self.kuwait_governorates = {}
        self.abbreviation_map = {}
        self.common_typos = {}
        self.all_kuwait_areas = []
        self.typo_patterns = []
        self.kuwait_bounds = {
            'lat_min': 28.524574,
            'lat_max': 30.103532,
            'lon_min': 46.552695,
            'lon_max': 48.416094
        }
        self.kuwait_center = {
            'latitude': 29.3759,
            'longitude': 47.9774
        }
        self.area_similarity_cache = {}
        self.embedding_cache = {}
        self.load_artifacts()

    def load_artifacts(self):
        try:
            self.artifacts['feature_scaler'] = joblib.load(os.path.join(self.models_dir, 'feature_scaler.pkl'))
            self.artifacts['tfidf_vectorizer'] = joblib.load(os.path.join(self.models_dir, 'tfidf_vectorizer.pkl'))
            self.artifacts['manual_feature_columns'] = joblib.load(os.path.join(self.models_dir, 'manual_feature_columns.pkl'))
            sentence_embedder_path = os.path.join(self.models_dir, 'sentence_embedder')
            if os.path.exists(sentence_embedder_path):
                self.artifacts['sentence_embedder'] = SentenceTransformer(sentence_embedder_path)
            else:
                raise FileNotFoundError(f"Sentence embedder not found in {sentence_embedder_path}")
            self.artifacts['geo_stats'] = joblib.load(os.path.join(self.models_dir, 'geo_stats.pkl'))
            with open(os.path.join(self.models_dir, 'address_normalization_dicts.json'), 'r', encoding='utf-8') as f:
                address_dicts = json.load(f)
            self.kuwait_governorates = address_dicts['kuwait_governorates']
            self.abbreviation_map = address_dicts['abbreviation_map']
            self.common_typos = address_dicts['common_typos']
            if 'sharq' in self.abbreviation_map:
                del self.abbreviation_map['sharq']
            if 'sharq' in self.common_typos:
                self.common_typos['sharq'] = 'sharq'
            self.common_typos = {k: v for k, v in self.common_typos.items() if len(k) > 1}
            self.all_kuwait_areas = [area for gov_areas in self.kuwait_governorates.values() for area in gov_areas]
            self.all_kuwait_areas.extend([correct for typo, correct in self.common_typos.items() if correct not in self.all_kuwait_areas])
            self.all_kuwait_areas = list(set(self.normalize_text(area) for area in self.all_kuwait_areas))
            self.typo_patterns = [(re.compile(rf"\\b{re.escape(typo)}\\b", re.IGNORECASE), correct) for typo, correct in sorted(self.common_typos.items(), key=lambda x: len(x[0]), reverse=True)]
            with open(os.path.join(self.models_dir, 'training_metadata.json'), 'r') as f:
                self.artifacts['metadata'] = json.load(f)
            self.artifacts['hybrid_model'] = joblib.load(os.path.join(self.models_dir, 'hybrid_xgbfaiss_geocoder.pkl'))
            self._validate_loaded_components()
            self.is_loaded = True
        except Exception as e:
            raise RuntimeError(f"Failed to load artifacts: {e}")

    def _validate_loaded_components(self):
        expected_dims = self.artifacts['metadata']['feature_dimensions']
        actual_dims = self.artifacts['hybrid_model'].xgb_geocoder.lat_model.n_features_in_
        if expected_dims != actual_dims:
            raise ValueError(f"Feature dimension mismatch: expected {expected_dims}, got {actual_dims}")

    def normalize_text(self, text: str) -> str:
        if not text or pd.isna(text):
            return ""
        text = str(text).strip().lower()
        translation_table = str.maketrans("٠١٢٣٤٥٦٧٨٩إأآاىئءؤ", "0123456789اااايءءء")
        text = text.translate(translation_table)
        text = re.sub(r"[^\w\s\d\u0600-\u06FF]", " ", text)
        words = text.split()
        text = " ".join(self.abbreviation_map.get(word, self.common_typos.get(word, word)) for word in words)
        return text

    def validate_kuwaiti_block(self, block: str) -> bool:
        if not block or pd.isna(block):
            return False
        return bool(re.fullmatch(r"^\d{1,3}[a-zA-Z]?$", str(block).strip()))

    def validate_kuwaiti_street(self, street: str) -> bool:
        if not street or pd.isna(street):
            return False
        street = self.normalize_text(street)
        return bool(re.fullmatch(
            r"^(?:street|avenue|road|lane|crescent|شارع|جادة|طريق|حارة|هلال)?\s*[\d\w\s\-]+$",
            street, re.IGNORECASE
        )) and len(street) <= 100

    def categorize_street(self, street: str) -> str:
        street = self.normalize_text(street)
        if street == "unknown" or not street:
            return "unknown"
        if re.match(r"^(?:street|avenue|road|lane|crescent|شارع|جادة|طريق|حارة|هلال)?\s*\d+$", street, re.IGNORECASE):
            return "numbered"
        if re.match(r"^(?:street|avenue|road|lane|crescent|شارع|جادة|طريق|حارة|هلال)?\s*[\w\s\-]+$", street, re.IGNORECASE):
            return "named"
        return "unknown"

    def parse_address_robust(self, address: str) -> Dict:
        if not address or not isinstance(address, str):
            return {
                'country': 'kuwait', 'area': 'unknown', 'block': 'unknown', 'street': 'unknown',
                'buildingNumber': '', 'apartment': '', 'floor': ''
            }
        normalized_address = self.normalize_text(address)
        result = {
            'country': 'kuwait', 'area': 'unknown', 'block': 'unknown', 'street': 'unknown',
            'buildingNumber': '', 'apartment': '', 'floor': ''
        }
        area_found = self.extract_area_advanced(normalized_address)
        if area_found != 'unknown':
            result['area'] = area_found
        block_found = self.extract_block_robust(normalized_address)
        if block_found != 'unknown':
            result['block'] = block_found
        street_found = self.extract_street_robust(normalized_address)
        if street_found != 'unknown':
            result['street'] = street_found
        result.update(self.extract_other_components(normalized_address))
        return result

    def extract_area_advanced(self, text: str) -> str:
        text = self.normalize_text(text)
        text_words = set(text.split())
        candidates = []
        phonetic_areas = {jellyfish.nysiis(area): area for area in self.all_kuwait_areas}
        text_phonetic = jellyfish.nysiis(text)
        for area in self.all_kuwait_areas:
            area_norm = self.normalize_text(area)
            area_words = set(area_norm.split())
            if not area_words:
                continue
            score = len(text_words & area_words) / len(area_words)
            position = text.find(area_norm)
            if score >= 0.5 and position != -1:
                penalty = 0.1 if len(area_words) > 1 else 0.0
                candidates.append((area_norm, score - penalty, position, len(area_words)))
        if text_phonetic in phonetic_areas:
            phonetic_match = phonetic_areas[text_phonetic]
            candidates.append((phonetic_match, 0.9, 0, 1))
        best_match = 'unknown'
        if candidates:
            candidates.sort(key=lambda x: (-x[1], x[2], x[3]))
            best_match = candidates[0][0]
        if best_match == 'unknown':
            kuwait_city_norm = self.normalize_text('kuwait city')
            if kuwait_city_norm in text and 'sharq' not in text and 'mubarak' not in text.lower():
                best_match = kuwait_city_norm
        if best_match == 'unknown':
            matches = rapid_process.extract(text, self.all_kuwait_areas, scorer=fuzz.token_sort_ratio, limit=1)
            if matches and matches[0][1] >= 70:
                best_match = self.normalize_text(matches[0][0])
        return best_match

    def extract_block_robust(self, text: str) -> str:
        text = self.normalize_text(text)
        patterns = [
            r'block\s+(\d{1,3}[a-zA-Z]?)',
            r'blk\s+(\d{1,3}[a-zA-Z]?)',
            r'b\s+(\d{1,3}[a-zA-Z]?)',
            r'(\d{1,3}[a-zA-Z]?)\s*(?:street|st|avenue|ave|road|rd|lane|ln|crescent|cr|شارع|جادة|طريق|حارة|هلال)'
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match and self.validate_kuwaiti_block(match.group(1)):
                return match.group(1)
        return 'unknown'

    def extract_street_robust(self, text: str) -> str:
        text = self.normalize_text(text)
        patterns = [
            r'(?:street|avenue|road|lane|crescent|شارع|جادة|طريق|حارة|هلال)\s+([\w\s\-]+?)(?=\s*(?:block|building\s+\d+|floor|apartment|apt|\d+\s*$|$))',
            r'(?:st|ave|rd|ln|cr)\s+([\w\s\-]+?)(?=\s*(?:block|building\s+\d+|floor|apartment|apt|\d+\s*$|$))',
            r'([\w\s\-]+?)\s+(?:street|avenue|road|lane|crescent|st|ave|rd|ln|cr|شارع|جادة|طريق|حارة|هلال)(?=\s*(?:block|building\s+\d+|floor|apartment|apt|\d+\s*$|$))'
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                street = match.group(1).strip()
                if (self.validate_kuwaiti_street(street) and
                    not any(area in self.normalize_text(street) for area in self.all_kuwait_areas) and
                    not any(kw in street.lower() for kw in ['block', 'building', 'floor', 'apartment', 'apt'])):
                    return street
        words = text.split()
        street_keywords = ['street', 'avenue', 'road', 'lane', 'crescent', 'شارع', 'جادة', 'طريق', 'حارة', 'هلال', 'st', 'ave', 'rd', 'ln', 'cr']
        for i, word in enumerate(words):
            if word.lower() in street_keywords:
                street_words_after = []
                for j in range(i + 1, len(words)):
                    next_word = words[j].lower()
                    if (next_word in ['block', 'building', 'floor', 'apartment', 'apt'] or
                        re.match(r'^\d+$', next_word) or
                        self.normalize_text(next_word) in self.all_kuwait_areas):
                        break
                    street_words_after.append(words[j])
                street_words_before = []
                for j in range(i - 1, -1, -1):
                    prev_word = words[j].lower()
                    if j - 1 >= 0 and words[j - 1].lower() == 'block' and bool(re.fullmatch(r"^\d{1,3}[a-zA-Z]?$", prev_word)):
                        break
                    if (prev_word in ['block', 'building', 'floor', 'apartment', 'apt'] or
                        self.normalize_text(prev_word) in self.all_kuwait_areas):
                        break
                    street_words_before.insert(0, words[j])
                street = ' '.join(street_words_before + street_words_after).strip()
                if (street and self.validate_kuwaiti_street(street) and
                    not any(area in self.normalize_text(street) for area in self.all_kuwait_areas) and
                    not any(kw in street.lower() for kw in ['block', 'building', 'floor', 'apartment', 'apt'])):
                    return street
        return 'unknown'

    def extract_other_components(self, text: str) -> Dict:
        components = {}
        text = self.normalize_text(text)
        building_match = re.search(r'building\s+(\d+)|(\d+)\s*$', text, re.IGNORECASE)
        if building_match:
            components['buildingNumber'] = building_match.group(1) or building_match.group(2)
        floor_match = re.search(r'floor\s+(\d+)', text, re.IGNORECASE)
        if floor_match:
            components['floor'] = floor_match.group(1)
        apt_match = re.search(r'(?:apt|apartment)\s+(\w+)', text, re.IGNORECASE)
        if apt_match:
            components['apartment'] = apt_match.group(1)
        return components

    def get_governorate(self, area: str) -> str:
        area_norm = self.normalize_text(area)
        for gov, areas in self.kuwait_governorates.items():
            if any(area_norm == self.normalize_text(a) for a in areas):
                return gov
        return "unknown"

    def create_features_with_proper_fallbacks(self, addresses: List[str]) -> Tuple[np.ndarray, pd.DataFrame]:
        parsed_data = []
        for address in addresses:
            parsed = self.parse_address_robust(address)
            normalized_address = self.normalize_text(address)
            normalized_address = re.sub(r'\bbuilding\s+\d+\b', '', normalized_address, flags=re.IGNORECASE).strip()
            parsed['input_text'] = normalized_address
            parsed['governorate'] = self.get_governorate(parsed['area'])
            parsed['city'] = parsed['area']
            parsed['area_normalized'] = self.normalize_text(parsed['area'])
            area_key = (parsed['area_normalized'], tuple(self.all_kuwait_areas))
            if area_key in self.area_similarity_cache:
                parsed['area_similarity'] = self.area_similarity_cache[area_key]
            else:
                parsed['area_similarity'] = rapid_process.extractOne(
                    parsed['area_normalized'], self.all_kuwait_areas, scorer=fuzz.token_sort_ratio
                )[1] / 100.0 if parsed['area'] != 'unknown' else 0.0
                self.area_similarity_cache[area_key] = parsed['area_similarity']
            parsed_data.append(parsed)
        df = pd.DataFrame(parsed_data)
        df['block_num'] = pd.to_numeric(df['block'].str.extract(r'(\d+)', expand=False), errors='coerce').fillna(-1)
        df['building_num'] = pd.to_numeric(df['buildingNumber'].astype(str).str.extract(r'(\d+)', expand=False), errors='coerce').fillna(-1) * 0.1
        df['floor_num'] = pd.to_numeric(df['floor'].astype(str).str.extract(r'(\d+)', expand=False), errors='coerce').fillna(-1)
        df['has_block'] = (df['block_num'] >= 0).astype(int)
        df['has_building'] = (df['building_num'] >= 0).astype(int)
        df['has_apartment'] = df['apartment'].notna().astype(int)
        df['has_floor'] = (df['floor_num'] >= 0).astype(int)
        df['has_street_num'] = df['street'].str.extract(r'(\d+)$').notna().astype(int)
        df['street_type'] = df['street'].apply(self.categorize_street)
        df['area_block'] = df['area_normalized'].astype(str) + '_' + df['block'].astype(str)
        df['block_street'] = df['block'].astype(str) + '_' + df['street'].astype(str)
        geo_stats = self.artifacts['geo_stats']
        for col in ['country', 'area', 'city', 'governorate', 'area_block', 'block_street']:
            df[col] = df[col].fillna('unknown')
            col_lat_mean = geo_stats.get(f'{col}_lat_mean', {}).get('mean', {})
            col_lon_mean = geo_stats.get(f'{col}_lon_mean', {}).get('mean', {})
            col_lat_std = geo_stats.get(f'{col}_lat_std', {}).get('std', {})
            col_lon_std = geo_stats.get(f'{col}_lon_std', {}).get('std', {})
            df[f'{col}_lat_mean'] = df[col].map(col_lat_mean).fillna(
                df['governorate'].map(geo_stats.get('governorate_lat_mean', {}).get('mean', {})).fillna(self.kuwait_center['latitude'])
            )
            df[f'{col}_lon_mean'] = df[col].map(col_lon_mean).fillna(
                df['governorate'].map(geo_stats.get('governorate_lon_mean', {}).get('mean', {})).fillna(self.kuwait_center['longitude'])
            )
            df[f'{col}_lat_std'] = df[col].map(col_lat_std).fillna(0.01)
            df[f'{col}_lon_std'] = df[col].map(col_lon_std).fillna(0.01)
        tfidf_features = self.artifacts['tfidf_vectorizer'].transform(df['input_text'].fillna(""))
        tfidf_df = pd.DataFrame(tfidf_features.toarray(), columns=[f'tfidf_{i}' for i in range(tfidf_features.shape[1])], index=df.index)
        df = pd.concat([df, tfidf_df], axis=1)
        address_embeddings = []
        texts_to_encode = []
        indices_to_encode = []
        for i, text in enumerate(df['input_text'].tolist()):
            if text in self.embedding_cache:
                address_embeddings.append(self.embedding_cache[text])
            else:
                texts_to_encode.append(text)
                indices_to_encode.append(i)
        if texts_to_encode:
            new_embeddings = self.artifacts['sentence_embedder'].encode(
                texts_to_encode, batch_size=64, show_progress_bar=False
            )
            for idx, text, emb in zip(indices_to_encode, texts_to_encode, new_embeddings):
                self.embedding_cache[text] = emb
                address_embeddings.insert(idx, emb)
        address_embeddings = np.array(address_embeddings)
        manual_feature_cols = self.artifacts['manual_feature_columns']
        for col in manual_feature_cols:
            if col not in df.columns:
                if 'tfidf_' in col:
                    df[col] = 0.0
                elif 'lat_mean' in col:
                    df[col] = self.kuwait_center['latitude']
                elif 'lon_mean' in col:
                    df[col] = self.kuwait_center['longitude']
                elif '_std' in col:
                    df[col] = 0.01
                else:
                    df[col] = 0
        manual_features = df[manual_feature_cols].fillna(0).values
        X = np.hstack([address_embeddings, manual_features])
        return X, df

    def predict_coordinates_hybrid(self, addresses: List[str]) -> List[Dict]:
        try:
            X, df = self.create_features_with_proper_fallbacks(addresses)
            X_scaled = self.artifacts['feature_scaler'].transform(X)
            predictions = self.artifacts['hybrid_model'].predict(X_scaled)
            results = []
            for i, (address, (lat, lon)) in enumerate(zip(addresses, predictions)):
                is_valid = self.validate_coordinates(lat, lon)
                area_similarity = df.iloc[i]['area_similarity']
                has_block = df.iloc[i]['has_block']
                has_street_num = df.iloc[i]['has_street_num']
                is_named_street = df.iloc[i]['street_type'] == 'named'
                area_penalty = 0.8 if df.iloc[i]['area'] == 'unknown' else 1.0
                street_penalty = 0.8 if df.iloc[i]['street'] == 'unknown' else 0.9 if is_named_street else 1.0
                confidence = (area_similarity * 0.4 + 0.4 * has_block + 0.2 * (has_street_num or is_named_street)) * area_penalty * street_penalty
                status = "hybrid_predicted"
                area_lat_mean = df.iloc[i]['area_lat_mean']
                area_lon_mean = df.iloc[i]['area_lon_mean']
                area_lat_std = df.iloc[i]['area_lat_std']
                area_lon_std = df.iloc[i]['area_lon_std']
                lat_deviation = abs(lat - area_lat_mean) / area_lat_std if area_lat_std > 0 else 0
                lon_deviation = abs(lon - area_lon_mean) / area_lon_std if area_lon_std > 0 else 0
                deviation_threshold = 3.0
                if (not is_valid or confidence < 0.5 or lat_deviation > deviation_threshold or lon_deviation > deviation_threshold):
                    lat = area_lat_mean
                    lon = area_lon_mean
                    if self.validate_coordinates(lat, lon):
                        status = "area_fallback"
                        confidence = 0.4
                    else:
                        lat = df.iloc[i]['governorate_lat_mean']
                        lon = df.iloc[i]['governorate_lon_mean']
                        status = "governorate_fallback"
                        confidence = 0.2
                confidence_str = "high" if confidence >= 0.7 else "medium" if confidence >= 0.4 else "low"
                results.append({
                    'input': address,
                    'parsed_area': df.iloc[i]['area'],
                    'parsed_block': df.iloc[i]['block'],
                    'parsed_street': df.iloc[i]['street'],
                    'parsed_buildingNumber': df.iloc[i]['buildingNumber'],
                    'parsed_governorate': df.iloc[i]['governorate'],
                    'latitude': float(lat),
                    'longitude': float(lon),
                    'status': status,
                    'confidence': confidence_str
                })
            return results
        except Exception as e:
            return [{
                'input': address,
                'parsed_area': 'unknown',
                'parsed_block': 'unknown',
                'parsed_street': 'unknown',
                'parsed_buildingNumber': '',
                'parsed_governorate': 'unknown',
                'latitude': self.kuwait_center['latitude'],
                'longitude': self.kuwait_center['longitude'],
                'status': 'error_fallback',
                'confidence': 'low',
                'error': str(e)
            } for address in addresses]

    def validate_coordinates(self, lat: float, lon: float) -> bool:
        try:
            lat, lon = float(lat), float(lon)
            return (self.kuwait_bounds['lat_min'] - 0.02 <= lat <= self.kuwait_bounds['lat_max'] + 0.02 and
                    self.kuwait_bounds['lon_min'] - 0.02 <= lon <= self.kuwait_bounds['lon_max'] + 0.02)
        except (TypeError, ValueError):
            return False

def haversine_distance(lat1: np.ndarray, lon1: np.ndarray, lat2: np.ndarray, lon2: np.ndarray) -> np.ndarray:
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
    return 6371000 * 2 * np.arcsin(np.sqrt(a))

def test_fixed_hybrid_geocoder():
    geocoder = FixedHybridGeocoder(models_dir=models_dir)
    test_addresses = [
        "Salmiya, Block 1, Street 1",
        "Mubarak Al-Kabeer, Block 2, St 34",
        "Hawalli, Block 4, tunis street",
        "Mishref, Block 4, Street 2",
        "Salmiya, Block 12, Street 2",
        "Hawalli, Beirut Street, Commercial Bank of Kuwait",
        "Hawalli , Block 4 , tunis street, Hawalli Park",
        "Salwa Block 11 street 10",
        "Salmiya, Block 4, Street 2, building 14",
        "Salmiya, Block 7, street 77,bldg 12",
        "Salmiya, Block 10, Street 10, bldg 57",
        "Salmiya, Block 10, bldg 57",
        "Sabahiya, Block 4, 9 street,building 220",
        "Zahra, Block 3, St 310,building 5",
        "Rawda, Block 5, St 50, 12",
        "Mubarak Al-Kabeer, Block 5, St 23, 9"
    ]
    ground_truth = np.array([
        (29.3492824, 48.0953218),
        (29.1924, 48.0774),
        (29.341525, 48.019292),
        (29.2779, 48.0690),
        (29.3246, 48.0568),
        (29.335272277402016, 48.016834684876756),
        (29.34037499802647, 48.02221585684463),
        (29.284326847832105, 48.08411563806048),
        (29.341837, 48.081363),
        (29.33749, 48.0638),
        (29.327933375139658, 48.06915761997239),
        (29.327933375139658, 48.06915761997239),
        (29.113487, 48.112334),
        (29.2803, 47.9899),
        (29.3302,47.994),
        (29.189831,48.085122)
    ])
    results = geocoder.predict_coordinates_hybrid(test_addresses)
    latitudes = np.array([r['latitude'] for r in results])
    longitudes = np.array([r['longitude'] for r in results])
    distances = haversine_distance(latitudes, longitudes, ground_truth[:, 0], ground_truth[:, 1])
    for i, (result, distance) in enumerate(zip(results, distances), 1):
        print(f"{i:2d}. Input: {result['input']}")
        print(f"    Coordinates: ({result['latitude']:.6f}, {result['longitude']:.6f})")
        print(f"    Confidence: {result['confidence']}")
        print(f"    Distance Error: {distance:.1f} m")
        if i < len(results):
            print("\n" + "="*60)
    return results, distances

if __name__ == "__main__":
    test_results, test_distances = test_fixed_hybrid_geocoder()