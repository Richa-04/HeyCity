import { MONTHS } from '../utils/constants';

export const generateDeepInsights = (requests, tracking, slaMetrics) => {
  const insights = [];

  // Seasonal Pattern Detection
  const monthlyData = {};
  requests.forEach(req => {
    const month = new Date(req.created_date).getMonth();
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });
  const peakMonth = Object.entries(monthlyData).sort((a, b) => b[1] - a[1])[0];
  if (peakMonth) {
    insights.push({
      type: 'seasonal',
      severity: 'info',
      title: 'Seasonal Pattern Detected',
      description: `Request volume peaks in ${MONTHS[peakMonth[0]]} with ${peakMonth[1]} requests. Consider increasing staffing during this period.`,
      impact: 'Medium',
      actions: [
        'Analyze staffing levels during peak periods',
        'Consider temporary resource allocation',
        'Review historical data for multi-year patterns'
      ]
    });
  }

  // Bottleneck Detection
  const slowTypes = Object.entries(slaMetrics.byType || {})
    .filter(([_, data]) => parseFloat(data.avgResolutionDays) > parseFloat(data.expectedDays) * 1.5)
    .slice(0, 3);
  
  if (slowTypes.length > 0) {
    insights.push({
      type: 'bottleneck',
      severity: 'warning',
      title: 'Performance Bottleneck Identified',
      description: `${slowTypes[0][0]} requests are taking ${slowTypes[0][1].avgResolutionDays} days on average, ${((slowTypes[0][1].avgResolutionDays / slowTypes[0][1].expectedDays - 1) * 100).toFixed(0)}% over target.`,
      impact: 'High',
      actions: [
        'Conduct process mapping workshop',
        'Interview staff handling these requests',
        'Identify resource constraints or policy issues'
      ]
    });
  }

  // Geographic Clustering
  const districtData = {};
  requests.forEach(req => {
    const district = req.council_district || 'Unknown';
    districtData[district] = (districtData[district] || 0) + 1;
  });
  const topDistrict = Object.entries(districtData).sort((a, b) => b[1] - a[1])[0];
  if (topDistrict) {
    insights.push({
      type: 'geographic',
      severity: 'info',
      title: 'Geographic Hotspot',
      description: `${topDistrict[0]} accounts for ${((topDistrict[1] / requests.length) * 100).toFixed(1)}% of all requests.`,
      impact: 'Medium',
      actions: [
        'Schedule community meeting in affected area',
        'Deploy mobile service unit if available',
        'Investigate underlying infrastructure issues'
      ]
    });
  }

  // Predictive Backlog Alert
  const avgDailyNew = requests.filter(r => {
    const days = (new Date() - new Date(r.created_date)) / (1000 * 60 * 60 * 24);
    return days <= 30;
  }).length / 30;
  
  const avgDailyClosed = requests.filter(r => {
    if (!r.closed_date) return false;
    const days = (new Date() - new Date(r.closed_date)) / (1000 * 60 * 60 * 24);
    return days <= 30;
  }).length / 30;

  if (avgDailyNew > avgDailyClosed) {
    insights.push({
      type: 'predictive',
      severity: 'critical',
      title: 'Backlog Growth Predicted',
      description: `Current trend shows ${avgDailyNew.toFixed(1)} new requests/day vs ${avgDailyClosed.toFixed(1)} closures/day. Backlog will grow by ${((avgDailyNew - avgDailyClosed) * 30).toFixed(0)} requests in 30 days.`,
      impact: 'Critical',
      actions: [
        'Implement expedited closure process',
        'Increase team capacity temporarily',
        'Review prioritization criteria'
      ]
    });
  }

  // SLA Compliance Trend
  const recentCompliance = requests
    .filter(r => r.closed_date && r.sla_met !== null)
    .slice(0, 50)
    .filter(r => r.sla_met).length;
  const complianceRate = (recentCompliance / 50) * 100;
  
  if (complianceRate < 70) {
    insights.push({
      type: 'sla',
      severity: 'critical',
      title: 'SLA Compliance Below Target',
      description: `Recent SLA compliance is ${complianceRate.toFixed(0)}%, below the 80% target.`,
      impact: 'Critical',
      actions: [
        'Emergency review of open requests',
        'Reassess SLA targets for feasibility',
        'Implement daily stand-up meetings'
      ]
    });
  }

  return insights;
};