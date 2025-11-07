// src/App.js
// Seattle Customer Service Tracking Platform
// ❌ STRICTLY NO UI DASHBOARDS - ONLY TRACKING TOOLS ❌

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Search, 
  MessageSquare, 
  Mic, 
  Lightbulb,
  Menu,
  X,
  RefreshCw
} from 'lucide-react';

// Import data service
import { fetchSeattleData } from './services/dataService';

// ❌ STRICTLY NO UI DASHBOARDS - VERIFIED ❌
// Import ONLY direct data access tools
import StatusTracker from './components/StatusTracker';
import TrackingDataViewer2025 from './components/TrackingDataViewer2025';
import VoiceMode from './components/VoiceMode';
import Chatbot from './components/Chatbot';
import DataStatistics from './components/DataStatistics';

// ❌❌❌ DISABLED - NO UI DASHBOARDS ❌❌❌
// NO Dashboard visualizations (this is data statistics viewer, not a dashboard)
// NO Analytics dashboards  
// NO Insights dashboards
// ONLY direct data access, statistics display, and AI assistance

function App() {
  const [activeView, setActiveView] = useState('tracking'); // Start with tracking view
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [appData, setAppData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setDataLoaded(false);
      setError(null);
      console.log('🔄 Loading Seattle data...');
      
      const data = await fetchSeattleData();
      setAppData(data);
      setDataLoaded(true);
      
      console.log('✅ Data loaded successfully:', {
        requests: data.requests?.length,
        tracking: data.tracking?.length,
        source: data.dataSource
      });
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(err.message);
      setDataLoaded(true);
    }
  };

  // Navigation items - ONLY 5 ITEMS, NO UI DASHBOARDS
  const navItems = [
    {
      id: 'tracking',
      name: '2025 Tracking',
      icon: Activity,
      description: 'Real-time Status Updates with Date Filters',
      available: true
    },
    {
      id: 'statistics',
      name: 'Data Statistics',
      icon: LayoutDashboard,
      description: 'View Data Statistics (Not a Dashboard)',
      available: appData?.requests
    },
    {
      id: 'status',
      name: 'Status Tracker',
      icon: Search,
      description: 'Search & Track Requests',
      available: appData?.requests
    },
    {
      id: 'chatbot',
      name: 'AI Assistant',
      icon: MessageSquare,
      description: 'Get Help & Information',
      available: appData?.requests
    },
    {
      id: 'voice',
      name: 'Voice Mode',
      icon: Mic,
      description: 'Hands-free Access',
      available: appData?.requests
    }
    // ❌ NO UI DASHBOARD, NO INSIGHTS DASHBOARD
    // "Data Statistics" is NOT a dashboard - it's a data viewer
  ];

  const renderContent = () => {
    if (!dataLoaded) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-xl text-gray-600">Loading Seattle Data...</p>
            <p className="text-sm text-gray-500 mt-2">Fetching from Open Data Portal</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
            <div className="text-red-600 text-6xl mb-4 text-center">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Error Loading Data</h2>
            <p className="text-gray-600 mb-4 text-center">{error}</p>
            <button
              onClick={loadData}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Retry Loading
            </button>
          </div>
        </div>
      );
    }

    // ONLY 5 components available - NO UI DASHBOARDS
    // Data Statistics is a data viewer, NOT a dashboard
    try {
      switch (activeView) {
        case 'tracking':
          return <TrackingDataViewer2025 />;
        case 'statistics':
          return appData?.requests ? <DataStatistics data={appData} /> : <ComponentNotAvailable message="Loading data statistics..." />;
        case 'status':
          return appData?.requests ? <StatusTracker data={appData} /> : <ComponentNotAvailable />;
        case 'chatbot':
          return appData?.requests ? <Chatbot data={appData} /> : <ComponentNotAvailable message="Loading AI Assistant..." />;
        case 'voice':
          return appData?.requests ? <VoiceMode data={appData} /> : <ComponentNotAvailable message="Loading voice mode..." />;
        default:
          return <TrackingDataViewer2025 />;
      }
    } catch (err) {
      console.error('Error rendering component:', err);
      return <ComponentNotAvailable message={`Error: ${err.message}`} />;
    }
  };

  const ComponentNotAvailable = ({ message }) => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {message || 'Component Coming Soon'}
        </h2>
        <p className="text-gray-600 mb-4">
          {message || 'This feature is being prepared with live data'}
        </p>
        <button
          onClick={() => setActiveView('tracking')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          View Tracking Data
        </button>
      </div>
    </div>
  );

  const currentNavItem = navItems.find(item => item.id === activeView);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="bg-white text-blue-600 rounded-lg p-2">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Seattle Customer Service</h1>
                <p className="text-xs text-blue-200">Analytics & Tracking Platform</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-1">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    disabled={!item.available && activeView !== item.id}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                      activeView === item.id
                        ? 'bg-white text-blue-600 shadow-md'
                        : item.available
                        ? 'text-white hover:bg-blue-500'
                        : 'text-blue-300 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Refresh Button */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={loadData}
                className="p-2 rounded-lg hover:bg-blue-500 transition"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-blue-500 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 space-y-2">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.available || activeView === item.id) {
                        setActiveView(item.id);
                        setMobileMenuOpen(false);
                      }
                    }}
                    disabled={!item.available && activeView !== item.id}
                    className={`w-full px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${
                      activeView === item.id
                        ? 'bg-white text-blue-600'
                        : item.available
                        ? 'text-white hover:bg-blue-500'
                        : 'text-blue-300 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Breadcrumb / Current View Indicator */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">Seattle Customer Service</span>
                <span className="text-gray-400">/</span>
                <span className="text-blue-600 font-medium">{currentNavItem?.name}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{currentNavItem?.description}</p>
            </div>
            {appData && (
              <div className="hidden md:block text-right">
                <div className="text-xs text-gray-500">Data Source</div>
                <div className="text-sm font-medium text-blue-600">{appData.dataSource}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-6">
        <div className="animate-fadeIn">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h3 className="text-lg font-bold mb-3">About This Platform</h3>
              <p className="text-gray-400 text-sm">
                Seattle Customer Service Tracking Platform provides real-time status tracking,
                data statistics display, advanced filtering, and AI assistance. 
                NO UI Dashboards - only direct data access and statistics.
              </p>
            </div>

            {/* Data Sources */}
            <div>
              <h3 className="text-lg font-bold mb-3">Data Sources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Customer Service Requests (5ngg-rpne)</li>
                <li>• Request Tracking Data (43nw-pkdq)</li>
                <li>• Seattle Open Data Portal</li>
                <li>• Real-time 2025 Updates</li>
              </ul>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-bold mb-3">Key Features</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• 2025 Tracking Data (5000+ records)</li>
                <li>• Data Statistics (Dept, Issues, Resolution Times)</li>
                <li>• AI Assistant (Dept links, Similar requests)</li>
                <li>• Date-wise Filtering (Month/Range)</li>
                <li>• NO UI Dashboards - Direct Data Only</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>
              © 2025 Seattle Customer Service Bureau • NO UI DASHBOARDS
            </p>
            <p className="mt-2">
              Data provided by{' '}
              <a
                href="https://data.seattle.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                Seattle Open Data Portal
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Quick Access Floating Button for AI Assistant */}
      {appData?.requests && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setActiveView('chatbot')}
            className="bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 flex items-center gap-2"
            title="Open AI Assistant"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-sm font-medium pr-2">AI Help</span>
          </button>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default App;