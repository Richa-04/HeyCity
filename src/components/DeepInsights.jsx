import React from 'react';
import { Brain, AlertCircle, AlertTriangle, Eye } from 'lucide-react';

const DeepInsights = ({ insights }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-2xl p-8 text-white mb-6">
        <h2 className="text-3xl font-bold flex items-center mb-3">
          <Brain className="mr-3" size={40} />
          AI-Powered Deep Insights Engine
        </h2>
        <p className="text-purple-100">Advanced pattern recognition, predictive analytics, and actionable recommendations</p>
      </div>

      {insights.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Brain className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-gray-600 text-lg">Analyzing data patterns...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {insights.map((insight, idx) => (
            <div key={idx} className={`rounded-xl shadow-lg p-6 border-l-4 ${
              insight.severity === 'critical' ? 'bg-red-50 border-red-500' :
              insight.severity === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              'bg-blue-50 border-blue-500'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  {insight.severity === 'critical' && <AlertCircle className="text-red-600 mr-3" size={32} />}
                  {insight.severity === 'warning' && <AlertTriangle className="text-yellow-600 mr-3" size={32} />}
                  {insight.severity === 'info' && <Eye className="text-blue-600 mr-3" size={32} />}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{insight.title}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      insight.impact === 'Critical' ? 'bg-red-200 text-red-800' :
                      insight.impact === 'High' ? 'bg-orange-200 text-orange-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {insight.impact} Impact
                    </span>
                  </div>
                </div>
                <span className="text-xs bg-white px-3 py-1 rounded-full font-semibold text-gray-700">
                  {insight.type.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed">{insight.description}</p>
              
              {insight.actions && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Recommended Actions:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {insight.actions.map((action, i) => (
                      <li key={i}>• {action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeepInsights;