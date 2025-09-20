import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { predictEta, predictCombined, predictDistance, formatApiError } from '../../api/publicApi';
import './Sandbox.scss';

// Icons
const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5v14l11-7L8 5z" fill="currentColor"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="currentColor"/>
  </svg>
);

const RouteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 15.18V7c0-2.21-1.79-4-4-4s-4 1.79-4 4v10c0 1.1-.9 2-2 2s-2-.9-2-2V8.82C8.16 8.4 9 7.3 9 6c0-1.66-1.34-3-3-3S3 4.34 3 6c0 1.3.84 2.4 2 2.82V17c0 2.21 1.79 4 4 4s4-1.79 4-4V7c0-1.1.9-2 2-2s2 .9 2 2v8.18c-1.16.41-2 1.51-2 2.82 0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.3-.84-2.4-2-2.82zM6 7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="currentColor"/>
  </svg>
);

const CombinedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 20.41L18.41 19 15 15.59 13.59 17 17 20.41zM7.5 8H11v5.59L5.59 19 7 20.41l6-6V8h3.5L12 3.5 7.5 8z" fill="currentColor"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
  </svg>
);

const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="currentColor"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
  </svg>
);

const AddressIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/>
  </svg>
);

// Default request bodies for coordinates mode
const defaultCoordinateBodies = {
  eta: {
    pickup_lat: 29.295167895123434,
    pickup_lon: 47.90952491776944,
    drop_lat: 29.3041,
    drop_lon: 48.0764,
    pickup_time_utc: new Date().toISOString()
  },
  distance: {
    pickup_lat: 29.295167895123434,
    pickup_lon: 47.90952491776944,
    drop_lat: 29.3041,
    drop_lon: 48.0764
  },
  combined: {
    pickup_lat: 29.295167895123434,
    pickup_lon: 47.90952491776944,
    drop_lat: 29.3041,
    drop_lon: 48.0764,
    pickup_time_utc: new Date().toISOString()
  }
};

// Default request bodies for address mode
const defaultAddressBodies = {
  eta: {
    pickup_address: "Salmiya, Block 1, Street 1",
    dropoff_address: "Mubarak Al-Kabeer, Block 2, St 34",
    pickup_time_utc: new Date().toISOString()
  },
  distance: {
    pickup_address: "Salmiya, Block 1, Street 1",
    dropoff_address: "Mubarak Al-Kabeer, Block 2, St 34"
  },
  combined: {
    pickup_address: "Salmiya, Block 1, Street 1",
    dropoff_address: "Mubarak Al-Kabeer, Block 2, St 34",
    pickup_time_utc: new Date().toISOString()
  }
};

// API endpoints
const endpoints = {
  eta: "v1/public/eta",
  distance: "v1/public/distance",
  combined: "v1/public/combined"
};

// Tab interface
interface TabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ id, label, icon, active, onClick }) => {
  return (
    <div 
      className={`sandbox-tab ${active ? 'active' : ''}`} 
      onClick={onClick}
      role="tab"
      aria-selected={active}
      aria-controls={`${id}-panel`}
      id={`${id}-tab`}
    >
      <div className="tab-icon">{icon}</div>
      <div className="tab-label">{label}</div>
      {active && <div className="tab-indicator" />}
    </div>
  );
};

// Main component
const Sandbox: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'eta' | 'distance' | 'combined'>('eta');
  const [inputMode, setInputMode] = useState<'coordinates' | 'address'>('coordinates');
  const [apiKey, setApiKey] = useState<string>('');
  const [requestBody, setRequestBody] = useState<string>(JSON.stringify(defaultCoordinateBodies.eta, null, 2));
  
  // Define response type
  interface ApiResponse {
    estimated_time?: number;
    unit?: string;
    time_unit?: string;
    estimated_distance?: number;
    distance_unit?: string;
    confidence_score: number;
    request_id: string;
  }
  
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  // Get current default bodies based on input mode
  const getCurrentDefaultBodies = () => {
    return inputMode === 'coordinates' ? defaultCoordinateBodies : defaultAddressBodies;
  };

  // Update request body when tab or input mode changes
  useEffect(() => {
    const currentBodies = getCurrentDefaultBodies();
    setRequestBody(JSON.stringify(currentBodies[activeTab], null, 2));
    setResponse(null);
    setError(null);
    setResponseTime(null);
  }, [activeTab, inputMode]);

  // Handle API request
  const handleSendRequest = async () => {
    if (!apiKey) {
      setError("Please enter your API key");
      return;
    }

    try {
      // Parse the request body to validate JSON
      const parsedBody = JSON.parse(requestBody);
      
      setIsLoading(true);
      setError(null);
      setResponse(null);
      
      const startTime = performance.now();
      
      try {
        // Make the actual API call based on the active tab
        let apiResponse;
        
        if (activeTab === 'eta') {
          const result = await predictEta(apiKey, parsedBody);
          // Convert the ETA API response to the format expected by the Sandbox
          apiResponse = {
            estimated_time: result.data.eta_minutes,
            time_unit: "minutes",
            confidence_score: 0.95,
            request_id: "req_" + Math.random().toString(36).substring(2, 10)
          };
        } else if (activeTab === 'distance') {
          // Use the real distance endpoint
          const result = await predictDistance(apiKey, parsedBody);
          apiResponse = {
            estimated_distance: result.data.distance_meters,
            unit: "meters",
            confidence_score: 0.95,
            request_id: "req_" + Math.random().toString(36).substring(2, 10)
          };
        } else {
          // Use the real combined endpoint
          const result = await predictCombined(apiKey, parsedBody);
          apiResponse = {
            estimated_time: result.data.eta_minutes,
            time_unit: "minutes",
            estimated_distance: result.data.distance_meters,
            distance_unit: "meters",
            confidence_score: 0.95,
            request_id: "req_" + Math.random().toString(36).substring(2, 10)
          };
        }
        
        const endTime = performance.now();
        setResponseTime(Math.round(endTime - startTime));
        setResponse(apiResponse);
      } catch (apiError) {
        setError(formatApiError(apiError));
      } finally {
        setIsLoading(false);
      }
    } catch {
      // JSON parsing error
      setError("Invalid JSON in request body");
      setIsLoading(false);
    }
  };

  // Handle copy response to clipboard
  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle reset request body to default
  const handleResetBody = () => {
    const currentBodies = getCurrentDefaultBodies();
    setRequestBody(JSON.stringify(currentBodies[activeTab], null, 2));
  };

  return (
    <div className="sandbox-page">
      <div className="sandbox-header">
        <div className="sandbox-title">
          <h1>Etijahat Sandbox</h1>
          <p>Test our API endpoints with your API key</p>
        </div>
      </div>

      <div className="sandbox-content">
        <div className="sandbox-tabs" role="tablist">
          <Tab 
            id="eta"
            label="Time Estimation" 
            icon={<ClockIcon />} 
            active={activeTab === 'eta'} 
            onClick={() => setActiveTab('eta')} 
          />
          <Tab 
            id="distance"
            label="Distance Estimation" 
            icon={<RouteIcon />} 
            active={activeTab === 'distance'} 
            onClick={() => setActiveTab('distance')} 
          />
          <Tab 
            id="combined"
            label="Combined Estimation" 
            icon={<CombinedIcon />} 
            active={activeTab === 'combined'} 
            onClick={() => setActiveTab('combined')} 
          />
        </div>

        <div className="sandbox-container">
          <div className="sandbox-panel" role="tabpanel" id={`${activeTab}-panel`} aria-labelledby={`${activeTab}-tab`}>
            <div className="api-info">
              <div className="endpoint-url">
                <span className="method">POST</span>
                <span className="url">{endpoints[activeTab]}</span>
              </div>
              
              <div className="api-controls">
                <div className="api-key-input">
                  <div className="input-icon">
                    <KeyIcon />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter your API key" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                
                {/* Input Mode Toggle */}
                <div className="input-mode-toggle">
                  <div className="toggle-buttons">
                    <button 
                      className={`toggle-btn ${inputMode === 'coordinates' ? 'active' : ''}`}
                      onClick={() => setInputMode('coordinates')}
                    >
                      <LocationIcon />
                      <span>Coordinates</span>
                    </button>
                    <button 
                      className={`toggle-btn ${inputMode === 'address' ? 'active' : ''}`}
                      onClick={() => setInputMode('address')}
                    >
                      <AddressIcon />
                      <span>Addresses</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="request-response-container">
              <div className="request-section">
                <div className="section-header">
                  <h2>Request Body</h2>
                  <button className="btn-reset" onClick={handleResetBody}>Reset</button>
                </div>
                <div className="code-editor-container">
                  <textarea
                    className="code-editor"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    spellCheck="false"
                  />
                </div>
                <button 
                  className={`btn-send ${isLoading ? 'loading' : ''}`} 
                  onClick={handleSendRequest}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <>
                      <PlayIcon /> Send Request
                    </>
                  )}
                </button>
              </div>

              <div className="response-section">
                <div className="section-header">
                  <h2>Response</h2>
                  {response && (
                    <button 
                      className={`btn-copy ${copied ? 'copied' : ''}`} 
                      onClick={handleCopyResponse}
                    >
                      {copied ? <CheckIcon /> : <CopyIcon />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
                <div className="response-container">
                  {isLoading ? (
                    <div className="response-loading">
                      <div className="loading-spinner large"></div>
                      <p>Sending request...</p>
                    </div>
                  ) : error ? (
                    <div className="response-error">
                      <div className="error-icon">
                        <InfoIcon />
                      </div>
                      <p>{error}</p>
                    </div>
                  ) : response ? (
                    <motion.div 
                      className="response-content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="response-meta">
                        <div className="status-badge success">200 OK</div>
                        {responseTime && (
                          <div className="response-time">{responseTime}ms</div>
                        )}
                      </div>
                      <pre className="response-body">
                        {JSON.stringify(response, null, 2)}
                      </pre>
                    </motion.div>
                  ) : (
                    <div className="response-placeholder">
                      <p>Send a request to see the response</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sandbox-docs">
        <div className="docs-header">
          <h2>API Documentation</h2>
        </div>
        <div className="docs-content">
          <div className="docs-section">
            <h3>Time Estimation API</h3>
            <p>
              The Time Estimation API calculates the estimated travel time between two points.
              It takes into account factors like traffic patterns based on day of week and hour of day.
              Supports both coordinate-based and address-based requests.
            </p>
            
            <h4>Coordinate-based Parameters</h4>
            <div className="parameter-table">
              <div className="parameter-row header">
                <div className="parameter-name">Parameter</div>
                <div className="parameter-type">Type</div>
                <div className="parameter-description">Description</div>
              </div>
              <div className="parameter-row">
                <div className="parameter-name">pickup_lat</div>
                <div className="parameter-type">number</div>
                <div className="parameter-description">Latitude of pickup location</div>
              </div>
              <div className="parameter-row">
                <div className="parameter-name">pickup_lon</div>
                <div className="parameter-type">number</div>
                <div className="parameter-description">Longitude of pickup location</div>
              </div>
              <div className="parameter-row">
                <div className="parameter-name">drop_lat</div>
                <div className="parameter-type">number</div>
                <div className="parameter-description">Latitude of drop-off location</div>
              </div>
              <div className="parameter-row">
                <div className="parameter-name">drop_lon</div>
                <div className="parameter-type">number</div>
                <div className="parameter-description">Longitude of drop-off location</div>
              </div>
              <div className="parameter-row">
                <div className="parameter-name">pickup_time_utc</div>
                <div className="parameter-type">string</div>
                <div className="parameter-description">Pickup time in UTC (ISO 8601 format, e.g., "2025-04-30T10:23:18Z")</div>
              </div>
            </div>
            
            <h4>Address-based Parameters</h4>
            <div className="parameter-table">
              <div className="parameter-row header">
                <div className="parameter-name">Parameter</div>
                <div className="parameter-type">Type</div>
                <div className="parameter-description">Description</div>
              </div>
              <div className="parameter-row">
                <div className="parameter-name">pickup_address</div>
                <div className="parameter-type">string</div>
                <div className="parameter-description">Pickup address (e.g., "Salmiya, Block 1, Street 1")</div>
              </div>
              <div className="parameter-row">
                <div className="parameter-name">dropoff_address</div>
                <div className="parameter-type">string</div>
                <div className="parameter-description">Dropoff address (e.g., "Mubarak Al-Kabeer, Block 2, St 34")</div>
              </div>
              <div className="parameter-row">
                <div className="parameter-name">pickup_time_utc</div>
                <div className="parameter-type">string</div>
                <div className="parameter-description">Pickup time in UTC (ISO 8601 format, e.g., "2025-04-30T10:23:18Z")</div>
              </div>
            </div>
          </div>

          {activeTab === 'distance' && (
            <div className="docs-section">
              <h3>Distance Estimation API</h3>
              <p>
                The Distance Estimation API calculates the estimated travel distance between two points.
                It uses advanced routing algorithms to determine the most likely route.
                Supports both coordinate-based and address-based requests.
              </p>
              
              <h4>Coordinate-based Parameters</h4>
              <div className="parameter-table">
                <div className="parameter-row header">
                  <div className="parameter-name">Parameter</div>
                  <div className="parameter-type">Type</div>
                  <div className="parameter-description">Description</div>
                </div>
                <div className="parameter-row">
                  <div className="parameter-name">pickup_lat</div>
                  <div className="parameter-type">number</div>
                  <div className="parameter-description">Latitude of pickup location</div>
                </div>
                <div className="parameter-row">
                  <div className="parameter-name">pickup_lon</div>
                  <div className="parameter-type">number</div>
                  <div className="parameter-description">Longitude of pickup location</div>
                </div>
                <div className="parameter-row">
                  <div className="parameter-name">drop_lat</div>
                  <div className="parameter-type">number</div>
                  <div className="parameter-description">Latitude of drop-off location</div>
                </div>
                <div className="parameter-row">
                  <div className="parameter-name">drop_lon</div>
                  <div className="parameter-type">number</div>
                  <div className="parameter-description">Longitude of drop-off location</div>
                </div>
              </div>
              
              <h4>Address-based Parameters</h4>
              <div className="parameter-table">
                <div className="parameter-row header">
                  <div className="parameter-name">Parameter</div>
                  <div className="parameter-type">Type</div>
                  <div className="parameter-description">Description</div>
                </div>
                <div className="parameter-row">
                  <div className="parameter-name">pickup_address</div>
                  <div className="parameter-type">string</div>
                  <div className="parameter-description">Pickup address (e.g., "Salmiya, Block 1, Street 1")</div>
                </div>
                <div className="parameter-row">
                  <div className="parameter-name">dropoff_address</div>
                  <div className="parameter-type">string</div>
                  <div className="parameter-description">Dropoff address (e.g., "Mubarak Al-Kabeer, Block 2, St 34")</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'combined' && (
            <div className="docs-section">
              <h3>Combined Estimation API</h3>
              <p>
                The Combined Estimation API provides both time and distance estimates in a single request.
                It's ideal for applications that need both pieces of information.
                Supports both coordinate-based and address-based requests.
              </p>
              
              <h4>Coordinate-based Parameters</h4>
              <div className="parameter-table">
                <div className="parameter-row header">
                  <div className="parameter-name">Parameter</div>
                  <div className="parameter-type">Type</div>
                  <div className="parameter-description">Description</div>
                </div>
                <div className="parameter-row">
                  <div className="parameter-name">pickup_lat</div>
                  <div className="parameter-type">number</div>
                  <div className="parameter-description">Latitude of pickup location</div>
                </div>
                <div className="parameter-row">
                  <div className="parameter-name">pickup_lon</div>
                  <div className="parameter-type">number</div>
                  <div className="parameter-description">Longitude of pickup location</div>
                </div>
                <div className="parameter-row">
                  <div className="parameter-name">drop_lat</div>
                  <div className="parameter-type">number</div>
                  <div className="parameter-description">Latitude of drop-off location</div>
                </div>
                <div className="parameter-row">
                  <div className="parameter-name">drop_lon</div>
                  <div className="parameter-type">number</div>
                  <div className="parameter-description">Longitude of drop-off location</div>
                </div>
                <div className="parameter-row">
                  <div className="parameter-name">pickup_time_utc</div>
                  <div className="parameter-type">string</div>
                  <div className="parameter-description">Pickup time in UTC (ISO 8601 format, e.g., "2025-04-30T10:23:18Z")</div>
                </div>
              </div>
              
              <h4>Address-based Parameters</h4>
              <div className="parameter-table">
                <div className="parameter-row header">
                  <div className="parameter-name">Parameter</div>
                  <div className="parameter-type">Type</div>
                  <div className="parameter-description">Description</div>
                </div>
                <div className="parameter-row">
                  <div className="parameter-name">pickup_address</div>
                  <div className="parameter-type">string</div>
                  <div className="parameter-description">Pickup address (e.g., "Salmiya, Block 1, Street 1")</div>
                </div>
                <div className="parameter-row">
                  <div className="parameter-name">dropoff_address</div>
                  <div className="parameter-type">string</div>
                  <div className="parameter-description">Dropoff address (e.g., "Mubarak Al-Kabeer, Block 2, St 34")</div>
                </div>
                <div className="parameter-row">
                  <div className="parameter-name">pickup_time_utc</div>
                  <div className="parameter-type">string</div>
                  <div className="parameter-description">Pickup time in UTC (ISO 8601 format, e.g., "2025-04-30T10:23:18Z")</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sandbox;
