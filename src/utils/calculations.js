export const calculateDaysDifference = (start, end) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
};

export const calculateUrgencyScore = (daysOpen, expectedDays) => {
  return daysOpen / expectedDays;
};

export const processMetrics = (requests) => {
  const metrics = {};
  const departmentMetrics = {};

  requests.forEach(req => {
    const type = req.service_request_type;
    const dept = req.city_department;
    
    if (!metrics[type]) {
      metrics[type] = {
        total: 0,
        resolved: 0,
        totalDays: 0,
        slaCompliant: 0,
        expectedDays: req.expected_resolution_days || 5
      };
    }

    metrics[type].total++;

    if (req.status === 'Closed') {
      metrics[type].resolved++;
      const days = req.actual_resolution_days || 0;
      metrics[type].totalDays += days;
      if (days <= metrics[type].expectedDays) {
        metrics[type].slaCompliant++;
      }
    }

    if (!departmentMetrics[dept]) {
      departmentMetrics[dept] = { total: 0, open: 0, closed: 0 };
    }
    departmentMetrics[dept].total++;
    if (req.status === 'Closed') {
      departmentMetrics[dept].closed++;
    } else {
      departmentMetrics[dept].open++;
    }
  });

  Object.keys(metrics).forEach(type => {
    if (metrics[type].resolved > 0) {
      metrics[type].avgResolutionDays = (metrics[type].totalDays / metrics[type].resolved).toFixed(1);
      metrics[type].slaComplianceRate = ((metrics[type].slaCompliant / metrics[type].resolved) * 100).toFixed(0);
    } else {
      metrics[type].avgResolutionDays = 0;
      metrics[type].slaComplianceRate = 0;
    }
  });

  return { byType: metrics, byDepartment: departmentMetrics };
};

export const calculateBacklog = (requests) => {
  const now = new Date();
  return requests
    .filter(r => r.status !== 'Closed')
    .map(r => {
      const created = new Date(r.created_date);
      const daysOpen = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      const expected = r.expected_resolution_days || 5;
      
      return {
        ...r,
        daysOpen,
        expectedDays: expected,
        pastDue: daysOpen > expected,
        urgencyScore: calculateUrgencyScore(daysOpen, expected)
      };
    })
    .sort((a, b) => b.urgencyScore - a.urgencyScore);
};