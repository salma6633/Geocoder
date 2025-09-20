import { useNavigate } from 'react-router-dom';

// Define the search result item interface
export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon?: React.ReactNode;
  path: string;
  keywords?: string[];
}

// Define the search index - this will contain all searchable content from the dashboard
const searchIndex: SearchResultItem[] = [
  // Dashboard
  {
    id: 'dashboard-main',
    title: 'Dashboard',
    description: 'Main dashboard overview with all widgets',
    category: 'Pages',
    path: '/dashboard',
    keywords: ['home', 'overview', 'main', 'dashboard']
  },
  
  // API Keys
  {
    id: 'api-keys',
    title: 'API Keys',
    description: 'Manage your API keys for authentication',
    category: 'Pages',
    path: '/dashboard/api-keys',
    keywords: ['api', 'keys', 'authentication', 'security', 'tokens']
  },
  {
    id: 'production-api-key',
    title: 'Production API Key',
    description: 'API key for production environment',
    category: 'API Keys',
    path: '/dashboard/api-keys',
    keywords: ['production', 'api key', 'live']
  },
  {
    id: 'development-api-key',
    title: 'Development API Key',
    description: 'API key for development environment',
    category: 'API Keys',
    path: '/dashboard/api-keys',
    keywords: ['development', 'api key', 'testing', 'dev']
  },
  {
    id: 'testing-api-key',
    title: 'Testing API Key',
    description: 'API key for testing environment',
    category: 'API Keys',
    path: '/dashboard/api-keys',
    keywords: ['testing', 'api key', 'test']
  },
  
  // Usage
  {
    id: 'usage',
    title: 'Usage',
    description: 'View your API usage statistics and metrics',
    category: 'Pages',
    path: '/dashboard/usage',
    keywords: ['usage', 'statistics', 'metrics', 'analytics', 'api calls']
  },
  {
    id: 'total-requests',
    title: 'Total Requests',
    description: 'View total API requests made',
    category: 'Usage',
    path: '/dashboard/usage',
    keywords: ['requests', 'api calls', 'total', 'usage']
  },
  {
    id: 'success-rate',
    title: 'Success Rate',
    description: 'View API request success rate',
    category: 'Usage',
    path: '/dashboard/usage',
    keywords: ['success', 'rate', 'percentage', 'successful requests']
  },
  {
    id: 'response-time',
    title: 'Average Response Time',
    description: 'View average API response time',
    category: 'Usage',
    path: '/dashboard/usage',
    keywords: ['response', 'time', 'latency', 'performance']
  },
  
  // Logs
  {
    id: 'logs',
    title: 'Request Logs',
    description: 'View detailed logs of API requests',
    category: 'Pages',
    path: '/dashboard/logs',
    keywords: ['logs', 'history', 'requests', 'api calls', 'debugging']
  },
  
  // Sandbox
  {
    id: 'sandbox',
    title: 'API Sandbox',
    description: 'Test API endpoints in an interactive environment',
    category: 'Pages',
    path: '/dashboard/sandbox',
    keywords: ['sandbox', 'testing', 'api', 'playground', 'development']
  },
  
  // Billing
  {
    id: 'billing',
    title: 'Billing',
    description: 'Manage billing and subscription details',
    category: 'Pages',
    path: '/dashboard/billing',
    keywords: ['billing', 'payment', 'subscription', 'invoice', 'plan']
  },
  
  // Documentation
  {
    id: 'docs',
    title: 'Documentation',
    description: 'API documentation and guides',
    category: 'Pages',
    path: '/dashboard/docs',
    keywords: ['documentation', 'docs', 'guides', 'help', 'reference']
  },
  
  // Settings
  {
    id: 'settings',
    title: 'Settings',
    description: 'Configure account and application settings',
    category: 'Pages',
    path: '/dashboard/settings',
    keywords: ['settings', 'configuration', 'preferences', 'account']
  },
  
  // Widgets
  {
    id: 'usage-widget',
    title: 'API Usage Widget',
    description: 'Overview of your API usage statistics',
    category: 'Widgets',
    path: '/dashboard',
    keywords: ['widget', 'usage', 'statistics', 'chart', 'api calls']
  },
  {
    id: 'quick-actions-widget',
    title: 'Quick Actions Widget',
    description: 'Frequently used actions and shortcuts',
    category: 'Widgets',
    path: '/dashboard',
    keywords: ['widget', 'quick actions', 'shortcuts', 'actions']
  },
  {
    id: 'model-performance-widget',
    title: 'Model Performance Widget',
    description: 'Performance metrics for prediction models',
    category: 'Widgets',
    path: '/dashboard',
    keywords: ['widget', 'model', 'performance', 'metrics', 'prediction']
  },
  {
    id: 'api-keys-widget',
    title: 'API Keys Widget',
    description: 'Overview of your API keys',
    category: 'Widgets',
    path: '/dashboard',
    keywords: ['widget', 'api keys', 'security', 'authentication']
  },
  {
    id: 'billing-widget',
    title: 'Billing Widget',
    description: 'Overview of your billing and usage',
    category: 'Widgets',
    path: '/dashboard',
    keywords: ['widget', 'billing', 'payment', 'subscription', 'plan']
  }
];

// Search function that returns results based on query
export const searchDashboard = (query: string): SearchResultItem[] => {
  if (!query || query.trim() === '') {
    return [];
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return searchIndex.filter(item => {
    // Check if query matches title, description, or category
    const titleMatch = item.title.toLowerCase().includes(normalizedQuery);
    const descMatch = item.description.toLowerCase().includes(normalizedQuery);
    const categoryMatch = item.category.toLowerCase().includes(normalizedQuery);
    
    // Check if query matches any keywords
    const keywordMatch = item.keywords?.some(keyword => 
      keyword.toLowerCase().includes(normalizedQuery)
    );
    
    return titleMatch || descMatch || categoryMatch || keywordMatch;
  });
};

// Hook to navigate to search result
export const useSearchNavigation = () => {
  const navigate = useNavigate();
  
  const navigateToResult = (result: SearchResultItem) => {
    navigate(result.path);
  };
  
  return { navigateToResult };
};
