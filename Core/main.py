# import ijson
# import csv
# from datetime import datetime, timezone, timedelta

# input_file_path = "orders.json"
# output_file_path = "training_data.csv"

# kuwait_tz = timezone(timedelta(hours=3))

# with open(input_file_path, 'r', encoding='utf-8') as input_file, \
#      open(output_file_path, 'w', newline='', encoding='utf-8') as output_file:

#     writer = csv.DictWriter(output_file, fieldnames=[
#         "pickup_lat", "pickup_lon", "drop_lat", "drop_lon",
#         "pickup_time", "dropoff_time", "day_of_week", "hour_of_day"
#     ])
#     writer.writeheader()

#     orders = ijson.items(input_file, 'item')
#     for order in orders:
#         try:
#             if order.get("country") != "Kuwait" or order.get("orderStatus") != "completed":
#                 continue

#             pickup = order.get("pickupLocation", {})
#             drop = order.get("destination", {}).get("address", {}).get("location", {})
#             status_log = order.get("orderStatusLog", [])

#             pickup_time_str = next((s.get("createdAt", {}).get("$date") for s in status_log if s.get("status") == "en_route"), None)
#             drop_time_str = next((s.get("createdAt", {}).get("$date") for s in status_log if s.get("status") == "completed"), None)

#             if not pickup_time_str or not drop_time_str:
#                 continue

#             pickup_time_utc = datetime.fromisoformat(pickup_time_str.replace("Z", "+00:00"))
#             drop_time_utc = datetime.fromisoformat(drop_time_str.replace("Z", "+00:00"))

#             duration = (drop_time_utc - pickup_time_utc).total_seconds()
#             if duration > 18000 or duration <= 0:
#                 continue

#             # Convert both times to Kuwait timezone
#             pickup_time = pickup_time_utc.astimezone(kuwait_tz)
#             drop_time = drop_time_utc.astimezone(kuwait_tz)

#             writer.writerow({
#                 "pickup_lat": pickup.get("latitude"),
#                 "pickup_lon": pickup.get("longitude"),
#                 "drop_lat": drop.get("latitude"),
#                 "drop_lon": drop.get("longitude"),
#                 "pickup_time": pickup_time.isoformat(),
#                 "dropoff_time": drop_time.isoformat(),
#                 "day_of_week": pickup_time.strftime("%A"),
#                 "hour_of_day": pickup_time.hour
#             })
#         except Exception:
#             continue


# import csv
# from datetime import datetime

# def is_valid_lat_lon(lat, lon):
#     try:
#         lat = float(lat)
#         lon = float(lon)
#         return -90 <= lat <= 90 and -180 <= lon <= 180
#     except:
#         return False

# def is_valid_datetime(dt_str):
#     try:
#         datetime.fromisoformat(dt_str)
#         return True
#     except:
#         return False

# input_file_path = 'training_data.csv'
# output_file_path = 'filtered_training_data.csv'

# row_count = 0
# with open(input_file_path, 'r', encoding='utf-8') as infile, \
#      open(output_file_path, 'w', newline='', encoding='utf-8') as outfile:
    
#     reader = csv.DictReader(infile)
#     writer = csv.DictWriter(outfile, fieldnames=reader.fieldnames)
#     writer.writeheader()

#     for row in reader:
#         lat_ok = is_valid_lat_lon(row['pickup_lat'], row['pickup_lon']) and is_valid_lat_lon(row['drop_lat'], row['drop_lon'])
#         time_ok = is_valid_datetime(row['pickup_time']) and is_valid_datetime(row['dropoff_time'])

#         if lat_ok and time_ok:
#             writer.writerow(row)
#             row_count += 1

# print(f"✅ Total valid rows written to '{output_file_path}': {row_count}")


import pandas as pd
from sklearn.model_selection import train_test_split

# Load the cleaned dataset
df = pd.read_csv("filtered_training_data.csv")

# Split into 80% training and 20% testing
train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)

# Save the splits
train_df.to_csv("train.csv", index=False)
test_df.to_csv("test.csv", index=False)

# Print summary
print(f"✅ Training set: {len(train_df)} rows")
print(f"✅ Testing set: {len(test_df)} rows")
