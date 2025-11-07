// src/services/chatbotEngine.js

export const initializeChatbot = () => {
  return [{
    role: 'assistant',
    content: 'Hello! I\'m your Seattle Customer Service AI Assistant. I can help you with:\n\n• Track a service request\n• Find request statistics\n• Get SLA information\n• Identify bottlenecks\n• Provide insights\n\nHow can I assist you today?',
    timestamp: new Date()
  }];
};

export const generateChatbotResponse = (input, requestData, trackingData, slaMetrics, insights) => {
  const lowerInput = input.toLowerCase();

  // Track request
  if (lowerInput.includes('track') || lowerInput.includes('status') || /\d{2}-\d{5,6}/.test(input)) {
    const requestNum = input.match(/\d{2}-\d{5,6}/)?.[0];
    if (requestNum) {
      const request = requestData.find(r => r.service_request_number.includes(requestNum));
      if (request) {
        const tracking = trackingData.filter(t => t.service_request_number === request.service_request_number);
        return `📋 Request ${request.service_request_number}:\n\n• Type: ${request.service_request_type}\n• Status: ${request.status}\n• Created: ${new Date(request.created_date).toLocaleDateString()}\n• Department: ${request.city_department}\n• Expected Resolution: ${request.expected_resolution_days} days\n\nTracking History:\n${tracking.slice(0, 5).map(t => `✓ ${t.status} - ${new Date(t.updated_at).toLocaleDateString()}`).join('\n') || 'No tracking updates available'}`;
      }
      return `I couldn't find request ${requestNum}. Please verify the number and try again.`;
    }
    return 'Please provide a request number (format: XX-XXXXXX) to track.';
  }

  // Statistics
  if (lowerInput.includes('how many') || lowerInput.includes('statistics') || lowerInput.includes('total') || lowerInput.includes('show statistics')) {
    const total = requestData.length;
    const open = requestData.filter(r => r.status === 'Open').length;
    const closed = requestData.filter(r => r.status === 'Closed').length;
    const inProgress = requestData.filter(r => r.status === 'In Progress').length;
    
    // Calculate average resolution
    const avgResolution = Object.values(slaMetrics.byType || {})
      .filter(m => m.avgResolutionDays > 0)
      .reduce((sum, m) => sum + parseFloat(m.avgResolutionDays || 0), 0) / 
      Math.max(Object.values(slaMetrics.byType || {}).filter(m => m.avgResolutionDays > 0).length, 1);
    
    return `📊 Current Statistics:\n\n• Total Requests: ${total}\n• Open: ${open}\n• In Progress: ${inProgress}\n• Closed: ${closed}\n• Average Resolution: ${avgResolution.toFixed(1)} days\n\n${requestData.length > 0 ? `Most recent request: ${new Date(requestData[0].created_date).toLocaleDateString()}` : ''}`;
  }

  // SLA information
  if (lowerInput.includes('sla') || lowerInput.includes('expectation') || lowerInput.includes('how long')) {
    const topTypes = Object.entries(slaMetrics.byType || {}).slice(0, 5);
    if (topTypes.length === 0) {
      return '⏱️ SLA information is being calculated. Please try again in a moment.';
    }
    
    const overallCompliance = (Object.values(slaMetrics.byType || {})
      .reduce((sum, m) => sum + parseFloat(m.slaComplianceRate || 0), 0) / 
      Math.max(Object.keys(slaMetrics.byType || {}).length, 1)).toFixed(0);
    
    return `⏱️ Expected Resolution Times:\n\n${topTypes.map(([type, data]) => `• ${type}: ${data.expectedDays} days\n  (Current avg: ${data.avgResolutionDays} days, ${data.slaComplianceRate}% on-time)`).join('\n\n')}\n\nOverall SLA Compliance: ${overallCompliance}%`;
  }

  // Bottlenecks
  if (lowerInput.includes('bottleneck') || lowerInput.includes('slow') || lowerInput.includes('problem') || lowerInput.includes('find bottleneck')) {
    const slowest = Object.entries(slaMetrics.byType || {})
      .filter(([_, data]) => parseFloat(data.avgResolutionDays) > 0)
      .sort((a, b) => parseFloat(b[1].avgResolutionDays) - parseFloat(a[1].avgResolutionDays))
      .slice(0, 3);
    
    if (slowest.length === 0) {
      return '⚠️ No bottleneck data available yet. Please wait for metrics to be calculated.';
    }
    
    return `⚠️ Current Bottlenecks:\n\n${slowest.map(([type, data], i) => `${i + 1}. ${type}\n   • Taking ${data.avgResolutionDays} days on average\n   • Target: ${data.expectedDays} days\n   • Total requests: ${data.total}`).join('\n\n')}`;
  }

  // Insights
  if (lowerInput.includes('insight') || lowerInput.includes('recommendation') || lowerInput.includes('suggest') || lowerInput.includes('get insights')) {
    if (insights && insights.length > 0) {
      return `💡 Key Insights:\n\n${insights.slice(0, 3).map((insight, i) => `${i + 1}. ${insight.title}\n   ${insight.description}\n   Impact: ${insight.impact}`).join('\n\n')}`;
    }
    return '💡 No specific insights available at the moment. The system is still analyzing the data.';
  }

  // Help / Default
  if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
    return `I can help you with:\n\n• Track requests - Provide a request number (e.g., "Track 25-10001")\n• View statistics - Ask "Show statistics" or "How many requests"\n• Check SLA expectations - Ask "How long" or "SLA info"\n• Identify bottlenecks - Ask "What's slow" or "Find bottlenecks"\n• Get insights - Ask "Show insights" or "Recommendations"\n\nTry clicking one of the quick question buttons below, or type your question!`;
  }

  // Default response
  return `I can help you with:\n\n• Track requests (provide request #)\n• View statistics ("show statistics")\n• Check SLA expectations ("sla info")\n• Identify bottlenecks ("find bottlenecks")\n• Get insights ("get insights")\n\nWhat would you like to know?`;
};