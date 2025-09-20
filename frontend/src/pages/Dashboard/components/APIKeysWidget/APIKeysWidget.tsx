import React, { useState } from 'react';
import './APIKeysWidget.scss';

// Icons
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
  </svg>
);

const APIKeysWidget: React.FC = () => {
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  
  return (
    <div className="dashboard-widget api-keys-widget">
      <div className="widget-header">
        <h3>API Keys</h3>
        <div className="widget-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowNewKeyForm(!showNewKeyForm)}>
            <PlusIcon /> New Key
          </button>
        </div>
      </div>
      <div className="widget-content">
        {showNewKeyForm && (
          <div className="new-key-form">
            <div className="form-group">
              <label htmlFor="keyName">Key Name</label>
              <input type="text" id="keyName" placeholder="e.g., Production API Key" />
            </div>
            <div className="form-group">
              <label htmlFor="keyExpiration">Expiration</label>
              <select id="keyExpiration">
                <option value="never">Never</option>
                <option value="30days">30 days</option>
                <option value="90days">90 days</option>
                <option value="1year">1 year</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="keyPermissions">Permissions</label>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <input type="checkbox" id="permTime" checked />
                  <label htmlFor="permTime">Time Estimation API</label>
                </div>
                <div className="checkbox-item">
                  <input type="checkbox" id="permDistance" checked />
                  <label htmlFor="permDistance">Distance Estimation API</label>
                </div>
                <div className="checkbox-item">
                  <input type="checkbox" id="permCombined" />
                  <label htmlFor="permCombined">Combined Model API</label>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-text" onClick={() => setShowNewKeyForm(false)}>Cancel</button>
              <button className="btn btn-primary">Create API Key</button>
            </div>
          </div>
        )}
        
        <div className="api-keys-list">
          <div className="api-key-item">
            <div className="key-info">
              <div className="key-name">Production API Key</div>
              <div className="key-value">
                <span className="key-mask">••••••••••••••••</span>
                <button className="btn-icon" title="Copy API Key">
                  <CopyIcon />
                </button>
              </div>
              <div className="key-meta">
                <span className="key-created">Created: Apr 15, 2025</span>
                <span className="key-expires">Never expires</span>
              </div>
            </div>
            <div className="key-actions">
              <button className="btn-icon" title="Edit API Key">
                <EditIcon />
              </button>
              <button className="btn-icon" title="Delete API Key">
                <DeleteIcon />
              </button>
            </div>
          </div>
          
          <div className="api-key-item">
            <div className="key-info">
              <div className="key-name">Development API Key</div>
              <div className="key-value">
                <span className="key-mask">••••••••••••••••</span>
                <button className="btn-icon" title="Copy API Key">
                  <CopyIcon />
                </button>
              </div>
              <div className="key-meta">
                <span className="key-created">Created: Mar 22, 2025</span>
                <span className="key-expires">Expires: Jun 22, 2025</span>
              </div>
            </div>
            <div className="key-actions">
              <button className="btn-icon" title="Edit API Key">
                <EditIcon />
              </button>
              <button className="btn-icon" title="Delete API Key">
                <DeleteIcon />
              </button>
            </div>
          </div>
          
          <div className="api-key-item">
            <div className="key-info">
              <div className="key-name">Testing API Key</div>
              <div className="key-value">
                <span className="key-mask">••••••••••••••••</span>
                <button className="btn-icon" title="Copy API Key">
                  <CopyIcon />
                </button>
              </div>
              <div className="key-meta">
                <span className="key-created">Created: Feb 10, 2025</span>
                <span className="key-expires">Expires: May 10, 2025</span>
              </div>
            </div>
            <div className="key-actions">
              <button className="btn-icon" title="Edit API Key">
                <EditIcon />
              </button>
              <button className="btn-icon" title="Delete API Key">
                <DeleteIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIKeysWidget;
