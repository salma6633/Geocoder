import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchApiKeys, createApiKey, revokeApiKey, clearNewKey } from '../../store/slices/apiKeySlice';
import './APIKeys.scss';

// Icons
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5C13 4.44772 12.5523 4 12 4Z" fill="currentColor"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" fill="currentColor"/>
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

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
  </svg>
);

const APIKeys: React.FC = () => {
  const dispatch = useAppDispatch();
  const { apiKeys, isLoading, error, newKey } = useAppSelector(state => state.apiKeys);
  
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    expiration: 'never',
    permissions: ['time_estimation', 'distance_estimation']
  });
  const [showNewKeySuccess, setShowNewKeySuccess] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState('');
  
  // Fetch API keys when component mounts
  useEffect(() => {
    dispatch(fetchApiKeys());
  }, [dispatch]);
  
  // Show success modal when a new key is created
  useEffect(() => {
    if (newKey) {
      setNewKeyValue(newKey.key);
      setShowNewKeySuccess(true);
      dispatch(clearNewKey());
    }
  }, [newKey, dispatch]);

  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = key.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus ? key.status === selectedStatus : true;
    return matchesSearch && matchesStatus;
  });

  const handleCreateKey = async () => {
    try {
      // Dispatch the action to create a new API key
      await dispatch(createApiKey({
        name: newKeyData.name,
        permissions: newKeyData.permissions
      })).unwrap();
      
      setShowNewKeyModal(false);
      // The success modal will be shown by the useEffect when newKey is updated
    } catch (err) {
      console.error('Failed to create API key:', err);
      // Could show an error message here
    }
  };
  
  const handleRevokeKey = async (keyId: string) => {
    if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      try {
        await dispatch(revokeApiKey(keyId)).unwrap();
        // Could show a success message here
      } catch (err) {
        console.error('Failed to revoke API key:', err);
        // Could show an error message here
      }
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    // Would show a toast notification in a real app
  };

  return (
    <div className="apikeys-page">
      <div className="apikeys-header">
        <div className="apikeys-title">
          <h1>API Keys</h1>
          <p>Manage your API keys for accessing Armada services</p>
        </div>
      </div>

      <div className="apikeys-content">
        <div className="apikeys-actions">
          <button 
            className="btn-create-key"
            onClick={() => setShowNewKeyModal(true)}
          >
            <PlusIcon /> Create New API Key
          </button>
          
          <div className="apikeys-filters">
            <div className="search-container">
              <SearchIcon />
              <input 
                type="text" 
                placeholder="Search API keys..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-container">
              <FilterIcon />
              <select 
                value={selectedStatus || ''} 
                onChange={(e) => setSelectedStatus(e.target.value || null)}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading API keys...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">Error loading API keys: {error}</p>
            <button 
              className="btn-retry"
              onClick={() => dispatch(fetchApiKeys())}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="apikeys-table-container">
            <table className="apikeys-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Key</th>
                  <th>Created</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Permissions</th>
                  <th>Last Used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredKeys.map(key => (
                  <motion.tr 
                    key={key._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`status-${key.status}`}
                  >
                    <td className="key-name">{key.name}</td>
                    <td className="key-value">
                      <span className="key-prefix">{key.prefix}</span>
                      <span className="key-mask">••••••••••••••••</span>
                    </td>
                    <td>{new Date(key.created).toLocaleDateString()}</td>
                    <td>{key.expires ? new Date(key.expires).toLocaleDateString() : 'Never'}</td>
                    <td>
                      <span className={`status-badge ${key.status}`}>
                        {key.status.charAt(0).toUpperCase() + key.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="permissions-list">
                        {key.permissions.map((perm, i) => (
                          <span key={i} className="permission-badge">{perm}</span>
                        ))}
                      </div>
                    </td>
                    <td>{key.lastUsed}</td>
                    <td className="actions-cell">
                      <div className="key-actions">
                        <button className="btn-icon" title="Edit API Key">
                          <EditIcon />
                        </button>
                        <button 
                          className="btn-icon" 
                          title="Revoke API Key"
                          onClick={() => handleRevokeKey(key._id)}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {filteredKeys.length === 0 && (
              <div className="no-results">
                <p>No API keys found matching your filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create New Key Modal */}
      <AnimatePresence>
        {showNewKeyModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="modal-header">
                <h2>Create New API Key</h2>
                <button 
                  className="btn-close" 
                  onClick={() => setShowNewKeyModal(false)}
                >
                  <CloseIcon />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="keyName">Key Name</label>
                  <input 
                    type="text" 
                    id="keyName" 
                    placeholder="e.g., Production API Key"
                    value={newKeyData.name}
                    onChange={(e) => setNewKeyData({...newKeyData, name: e.target.value})}
                  />
                  <div className="field-hint">Give your key a descriptive name to identify its purpose</div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="keyExpiration">Expiration</label>
                  <select 
                    id="keyExpiration"
                    value={newKeyData.expiration}
                    onChange={(e) => setNewKeyData({...newKeyData, expiration: e.target.value})}
                  >
                    <option value="never">Never</option>
                    <option value="30days">30 days</option>
                    <option value="90days">90 days</option>
                    <option value="1year">1 year</option>
                  </select>
                  <div className="field-hint">For security, we recommend setting an expiration date</div>
                </div>
                
                <div className="form-group">
                  <label>Permissions</label>
                  <div className="checkbox-group">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="permTime" 
                        checked={newKeyData.permissions.includes('time_estimation')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyData({
                              ...newKeyData, 
                              permissions: [...newKeyData.permissions, 'time_estimation']
                            });
                          } else {
                            setNewKeyData({
                              ...newKeyData, 
                              permissions: newKeyData.permissions.filter(p => p !== 'time_estimation')
                            });
                          }
                        }}
                      />
                      <label htmlFor="permTime">Time Estimation API</label>
                    </div>
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="permDistance" 
                        checked={newKeyData.permissions.includes('distance_estimation')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyData({
                              ...newKeyData, 
                              permissions: [...newKeyData.permissions, 'distance_estimation']
                            });
                          } else {
                            setNewKeyData({
                              ...newKeyData, 
                              permissions: newKeyData.permissions.filter(p => p !== 'distance_estimation')
                            });
                          }
                        }}
                      />
                      <label htmlFor="permDistance">Distance Estimation API</label>
                    </div>
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="permCombined" 
                        checked={newKeyData.permissions.includes('combined_model')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyData({
                              ...newKeyData, 
                              permissions: [...newKeyData.permissions, 'combined_model']
                            });
                          } else {
                            setNewKeyData({
                              ...newKeyData, 
                              permissions: newKeyData.permissions.filter(p => p !== 'combined_model')
                            });
                          }
                        }}
                      />
                      <label htmlFor="permCombined">Combined Model API</label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowNewKeyModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleCreateKey}
                  disabled={!newKeyData.name || newKeyData.permissions.length === 0}
                >
                  Create API Key
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Key Success Modal */}
      <AnimatePresence>
        {showNewKeySuccess && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content success-modal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="modal-header">
                <h2>API Key Created</h2>
                <button 
                  className="btn-close" 
                  onClick={() => setShowNewKeySuccess(false)}
                >
                  <CloseIcon />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="success-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#34a853"/>
                  </svg>
                </div>
                
                <p className="success-message">Your new API key has been created successfully.</p>
                
                <div className="new-key-display">
                  <p className="key-warning">This key will only be displayed once. Please copy it now and store it securely.</p>
                  <div className="key-value-container">
                    <code>{newKeyValue}</code>
                    <button 
                      className="btn-copy"
                      onClick={() => handleCopyKey(newKeyValue)}
                    >
                      <CopyIcon /> Copy
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="btn-primary"
                  onClick={() => setShowNewKeySuccess(false)}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default APIKeys;
