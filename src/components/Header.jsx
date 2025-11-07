import React from 'react';
import { Target, Activity, Search, MessageCircle, Mic, Brain } from 'lucide-react';

const Header = ({ activeView, setActiveView }) => {
  const views = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'tracker', label: 'Status Tracker', icon: Search },
    { id: 'chatbot', label: 'AI Assistant', icon: MessageCircle },
    { id: 'voice', label: 'Voice Mode', icon: Mic },
    { id: 'insights', label: 'Deep Insights', icon: Brain }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl shadow-2xl p-6 mb-6 text-white">
      <h1 className="text-4xl font-bold mb-2 flex items-center">
        <Target className="mr-3" size={40} />
        PACT Intelligence Platform
      </h1>
      <p className="text-blue-100">
        5-in-1 Integrated Solution: Status Tracker + Dashboard + Voice AI + Chatbot + Deep Insights
      </p>
      
      <div className="flex flex-wrap gap-2 mt-4">
        {views.map(view => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center transition-all ${
              activeView === view.id 
                ? 'bg-white text-blue-900' 
                : 'bg-blue-800 text-white hover:bg-blue-700'
            }`}
          >
            <view.icon size={18} className="mr-2" />
            {view.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Header;