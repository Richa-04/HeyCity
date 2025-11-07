// src/services/dataService.js
// Optimized for Seattle Customer Service Requests API
// Dataset: https://data.seattle.gov/City-Administration/Customer-Service-Requests/5ngg-rpne

const API_CONFIG = {
  BASE_URL: 'https://data.seattle.gov/resource',
  ENDPOINTS: {
    CUSTOMER_SERVICE_REQUESTS: '5ngg-rpne.json',
    REQUEST_TRACKING: '43nw-pkdq.json'
  },
  LIMITS: {
    REQUESTS: 10000,  // Higher limit to get all 2025 data
    TRACKING: 3000
  },
  YEAR_FILTER: 2025  // Fetch only 2025 data
};

// Actual field names from Seattle Open Data Portal
const FIELD_MAPPING = {
  // Service Request fields (5ngg-rpne)
  serviceRequestNumber: 'servicerequestnumber',
  serviceRequestType: 'webintakeservicerequests',
  department: 'departmentname',
  createdDate: 'createddate',
  methodReceived: 'methodreceivedname',
  status: 'servicerequeststatusname',
  location: 'location',
  xValue: 'x_value',
  yValue: 'y_value',
  latitude: 'latitude',
  longitude: 'longitude',
  latLong: 'latitude_longitude',
  zipCode: 'zipcode',
  councilDistrict: 'councildistrict',
  policePrecinct: 'policeprecinct',
  neighborhood: 'neighborhood'
};

// Tracking Data field names (43nw-pkdq)
const TRACKING_FIELD_MAPPING = {
  serviceRequestNumber: 'servicerequestnumber',
  responsibleDepartment: 'responsibledepartment',
  serviceRequestType: 'servicerequesttype',
  createdDate: 'createddate',
  reportedLocation: 'reportedlocation',
  statusCategory: 'statuscategory',
  linkedRequestNumber: 'linkedrequestnumber',
  updatedDate: 'updateddate',
  statusUpdate: 'statusupdate',
  statusOrder: 'statusorder',
  currentCategory: 'currentcategory',
  currentStatus: 'currentstatus',
  latitude: 'latitude',
  longitude: 'longitude'
};

export const fetchSeattleData = async () => {
  try {
    console.log('🔄 Fetching 2025 data from Seattle Open Data Portal...');
    console.log('📊 Dataset: Customer Service Requests (5ngg-rpne)');
    console.log('📅 Filtering for: Year 2025 only');
    
    // Build API URLs with 2025 filter
    const targetYear = API_CONFIG.YEAR_FILTER;
    const startDate = `${targetYear}-01-01T00:00:00.000`;
    const endDate = `${targetYear}-12-31T23:59:59.999`;
    
    // Use SoQL (Socrata Query Language) for precise filtering
    const requestsUrl = `${API_CONFIG.BASE_URL}/${API_CONFIG.ENDPOINTS.CUSTOMER_SERVICE_REQUESTS}?$limit=${API_CONFIG.LIMITS.REQUESTS}&$where=createddate between '${startDate}' and '${endDate}'&$order=createddate DESC`;
    const trackingUrl = `${API_CONFIG.BASE_URL}/${API_CONFIG.ENDPOINTS.REQUEST_TRACKING}?$limit=${API_CONFIG.LIMITS.TRACKING}&$where=updateddate between '${startDate}' and '${endDate}'&$order=updateddate DESC`;
    
    console.log('📡 Fetching 2025 requests and tracking data...');
    console.log('🔗 Requests API:', requestsUrl);
    console.log('🔗 Tracking API:', trackingUrl);
    
    const fetchWithTimeout = (url, timeout = 20000) => {
      return Promise.race([
        fetch(url, {
          method: 'GET',
          headers: { 
            'Accept': 'application/json',
            'X-App-Token': '' // Optional: Add your app token for higher rate limits
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
      ]);
    };

    const [requestsResponse, trackingResponse] = await Promise.all([
      fetchWithTimeout(requestsUrl).catch(err => {
        console.error('❌ Error fetching requests:', err.message);
        return null;
      }),
      fetchWithTimeout(trackingUrl).catch(err => {
        console.warn('⚠️ Error fetching tracking:', err.message);
        return null;
      })
    ]);

    let requests = [];
    let tracking = [];
    let dataFetched = false;

    // Process Customer Service Requests
    if (requestsResponse && requestsResponse.ok) {
      try {
        const rawRequests = await requestsResponse.json();
        console.log(`✅ Fetched ${rawRequests.length} requests from Seattle API (2025)`);
        
        if (rawRequests && Array.isArray(rawRequests) && rawRequests.length > 0) {
          
          // Verify 2025 data
          const year2025Count = rawRequests.filter(req => {
            try {
              const year = new Date(req[FIELD_MAPPING.createdDate] || req.created_date).getFullYear();
              return year === 2025;
            } catch {
              return false;
            }
          }).length;
          
          console.log(`✅ Verified ${year2025Count} records are from 2025`);
          
          if (year2025Count === 0) {
            console.warn('⚠️ No 2025 data found in API response');
            throw new Error('No 2025 data available from API');
          }
          
          // Process and normalize the data
          requests = rawRequests.map(req => {
            const createdDate = req[FIELD_MAPPING.createdDate] || req.created_date || new Date().toISOString();
            const status = normalizeStatus(req[FIELD_MAPPING.status] || req.status);
            const requestType = req[FIELD_MAPPING.serviceRequestType] || req.service_request_type || 'Unknown';
            
            // Calculate closed date based on status
            let closedDate = null;
            if (status === 'Closed') {
              // Estimate closed date (actual closed date might not be in dataset)
              const created = new Date(createdDate);
              const estimatedDays = getExpectedResolutionDays(requestType);
              closedDate = new Date(created.getTime() + estimatedDays * 24 * 60 * 60 * 1000).toISOString();
            }
            
            return {
              service_request_number: req[FIELD_MAPPING.serviceRequestNumber] || req.service_request_number || `SR-${Math.random().toString(36).substr(2, 9)}`,
              service_request_type: requestType,
              city_department: req[FIELD_MAPPING.department] || req.city_department || 'Unknown Department',
              status: status,
              created_date: createdDate,
              closed_date: closedDate,
              method_received: req[FIELD_MAPPING.methodReceived] || 'Unknown',
              location: req[FIELD_MAPPING.location] || 'Seattle, WA',
              council_district: req[FIELD_MAPPING.councilDistrict] || 'Unknown',
              neighborhood: req[FIELD_MAPPING.neighborhood] || 'Unknown',
              zip_code: req[FIELD_MAPPING.zipCode] || null,
              latitude: parseFloat(req[FIELD_MAPPING.latitude]) || null,
              longitude: parseFloat(req[FIELD_MAPPING.longitude]) || null,
              police_precinct: req[FIELD_MAPPING.policePrecinct] || null,
              expected_resolution_days: getExpectedResolutionDays(requestType),
              actual_resolution_days: null,
              sla_met: null
            };
          });

          // Calculate resolution times for closed requests
          requests = requests.map(req => {
            if (req.closed_date && req.created_date) {
              try {
                const created = new Date(req.created_date);
                const closed = new Date(req.closed_date);
                const days = Math.floor((closed - created) / (1000 * 60 * 60 * 24));
                return {
                  ...req,
                  actual_resolution_days: days >= 0 ? days : null,
                  sla_met: days >= 0 ? (days <= req.expected_resolution_days) : null
                };
              } catch (e) {
                return req;
              }
            }
            return req;
          });

          // Sort by created_date (most recent first)
          requests.sort((a, b) => {
            try {
              return new Date(b.created_date) - new Date(a.created_date);
            } catch {
              return 0;
            }
          });

          dataFetched = true;
          console.log(`✅ Processed ${requests.length} requests from 2025`);
          
          // Show monthly distribution for 2025
          const monthCounts = {};
          requests.forEach(req => {
            try {
              const date = new Date(req.created_date);
              const month = date.toLocaleString('default', { month: 'short' });
              monthCounts[month] = (monthCounts[month] || 0) + 1;
            } catch {}
          });
          console.log('📊 2025 Requests by month:', monthCounts);
          
          // Show statistics
          const stats = {
            total: requests.length,
            open: requests.filter(r => r.status === 'Open').length,
            inProgress: requests.filter(r => r.status === 'In Progress').length,
            closed: requests.filter(r => r.status === 'Closed').length,
            departments: [...new Set(requests.map(r => r.city_department))].length,
            requestTypes: [...new Set(requests.map(r => r.service_request_type))].length
          };
          console.log('📊 Dataset Statistics:', stats);
          
          // Show date range
          if (requests.length > 0) {
            try {
              const newest = new Date(requests[0].created_date);
              const oldest = new Date(requests[requests.length - 1].created_date);
              console.log(`📅 Date range: ${oldest.toLocaleDateString()} to ${newest.toLocaleDateString()}`);
            } catch (e) {
              console.log('📅 Date range calculation skipped');
            }
          }
        }
      } catch (parseError) {
        console.error('❌ Error processing requests:', parseError);
        console.error('Error details:', parseError.message);
      }
    }

    // Process Request Tracking Data
    if (trackingResponse && trackingResponse.ok) {
      try {
        const rawTracking = await trackingResponse.json();
        
        if (rawTracking && Array.isArray(rawTracking) && rawTracking.length > 0) {
          console.log(`✅ Fetched ${rawTracking.length} tracking records from 2025`);
          
          // Verify 2025 data
          const year2025TrackingCount = rawTracking.filter(track => {
            try {
              const year = new Date(track[TRACKING_FIELD_MAPPING.updatedDate] || track.updated_at).getFullYear();
              return year === 2025;
            } catch {
              return false;
            }
          }).length;
          
          console.log(`✅ Verified ${year2025TrackingCount} tracking records are from 2025`);
          
          tracking = rawTracking.map(track => ({
            service_request_number: track[TRACKING_FIELD_MAPPING.serviceRequestNumber] || track.service_request_number || '',
            responsible_department: track[TRACKING_FIELD_MAPPING.responsibleDepartment] || track.department || 'Unknown',
            service_request_type: track[TRACKING_FIELD_MAPPING.serviceRequestType] || '',
            created_date: track[TRACKING_FIELD_MAPPING.createdDate] || null,
            reported_location: track[TRACKING_FIELD_MAPPING.reportedLocation] || '',
            status_category: track[TRACKING_FIELD_MAPPING.statusCategory] || track.status || 'In Progress',
            linked_request_number: track[TRACKING_FIELD_MAPPING.linkedRequestNumber] || null,
            updated_at: track[TRACKING_FIELD_MAPPING.updatedDate] || track.updated_at || new Date().toISOString(),
            status_update: track[TRACKING_FIELD_MAPPING.statusUpdate] || '',
            status_order: parseInt(track[TRACKING_FIELD_MAPPING.statusOrder] || '0'),
            current_category: track[TRACKING_FIELD_MAPPING.currentCategory] || '',
            current_status: track[TRACKING_FIELD_MAPPING.currentStatus] || '',
            latitude: parseFloat(track[TRACKING_FIELD_MAPPING.latitude]) || null,
            longitude: parseFloat(track[TRACKING_FIELD_MAPPING.longitude]) || null
          }));

          // Sort by updated_at (most recent first)
          tracking.sort((a, b) => {
            try {
              return new Date(b.updated_at) - new Date(a.updated_at);
            } catch {
              return 0;
            }
          });
          
          // Show tracking statistics
          const trackingStats = {
            total: tracking.length,
            uniqueRequests: [...new Set(tracking.map(t => t.service_request_number))].length,
            departments: [...new Set(tracking.map(t => t.responsible_department))].length,
            statuses: [...new Set(tracking.map(t => t.status_category))].length
          };
          console.log('📊 Tracking Statistics:', trackingStats);
          
          // Show most recent tracking updates
          if (tracking.length > 0) {
            console.log('🔔 Most recent tracking updates:');
            tracking.slice(0, 5).forEach((t, i) => {
              const date = new Date(t.updated_at).toLocaleDateString();
              console.log(`  ${i + 1}. ${t.service_request_number} - ${t.status_category} (${date})`);
            });
          }
        }
      } catch (parseError) {
        console.warn('⚠️ Error parsing tracking data:', parseError.message);
      }
    } else {
      console.warn('⚠️ Tracking data unavailable');
    }

    // Return live data if successful
    if (dataFetched && requests.length > 0) {
      console.log(`✅✅✅ SUCCESS! Returning ${requests.length} live records from 2025`);
      return {
        requests,
        tracking,
        error: null,
        dataSource: 'Seattle Open Data Portal (Live - 2025 Data)',
        datasetUrl: 'https://data.seattle.gov/City-Administration/Customer-Service-Requests/5ngg-rpne',
        timestamp: new Date().toISOString(),
        stats: {
          totalRequests: requests.length,
          totalTracking: tracking.length,
          year: 2025,
          dateRange: {
            from: requests[requests.length - 1]?.created_date,
            to: requests[0]?.created_date
          }
        }
      };
    }

    throw new Error(`No 2025 data available. API returned ${requests.length} records.`);

  } catch (err) {
    console.warn('⚠️ API Error, using 2025 sample data:', err.message);
    const sampleData = generateEnhancedSampleData();
    return {
      ...sampleData,
      error: `API unavailable: ${err.message}`,
      dataSource: 'Sample Data (Demo - 2025)',
      timestamp: new Date().toISOString()
    };
  }
};

// Normalize status values from the API
const normalizeStatus = (status) => {
  if (!status) return 'Open';
  
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('closed') || statusLower.includes('complete') || statusLower.includes('resolved')) {
    return 'Closed';
  }
  if (statusLower.includes('progress') || statusLower.includes('assigned') || statusLower.includes('routed')) {
    return 'In Progress';
  }
  if (statusLower.includes('open') || statusLower.includes('reported') || statusLower.includes('received')) {
    return 'Open';
  }
  
  return 'Open';
};

// SLA expectations by request type (in days)
const getExpectedResolutionDays = (requestType) => {
  const slaMap = {
    'Abandoned Vehicle': 3,
    'Graffiti': 7,
    'Pothole': 3,
    'Parking Enforcement': 1,
    'Unauthorized Encampment': 5,
    'Encampment': 5,
    'Street Light': 5,
    'Illegal Dumping': 7,
    'Dumping': 7,
    'Tree Maintenance': 14,
    'Tree': 14,
    'Traffic Signal': 2,
    'Street Sign': 5,
    'Sign': 5,
    'Park Maintenance': 10,
    'Park': 10,
    'Sidewalk': 14,
    'Water Main': 1,
    'Sewer': 2,
    'Noise Complaint': 2,
    'General Inquiry': 3
  };

  if (!requestType) return 5;
  
  // Exact match
  if (slaMap[requestType]) return slaMap[requestType];

  // Partial match
  const requestTypeLower = requestType.toLowerCase();
  for (const [key, value] of Object.entries(slaMap)) {
    if (requestTypeLower.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return 5; // Default
};

// Generate realistic sample data for 2025 (fallback)
const generateEnhancedSampleData = () => {
  console.log('🎨 Generating 2025 sample data...');
  
  const departments = [
    'SPD-Seattle Police Department',
    'SDOT-Seattle Department of Transportation',
    'SPU-Seattle Public Utilities',
    'Parks and Recreation',
    'Human Services Department',
    'SCL-Seattle City Light',
    'FAS-Finance and Administrative Services'
  ];

  const requestTypes = [
    { type: 'Abandoned Vehicle', avgDays: 3, targetDays: 3 },
    { type: 'Graffiti', avgDays: 5, targetDays: 7 },
    { type: 'Pothole', avgDays: 2, targetDays: 3 },
    { type: 'Parking Enforcement', avgDays: 1, targetDays: 1 },
    { type: 'Unauthorized Encampment', avgDays: 8, targetDays: 5 },
    { type: 'Street Light Out', avgDays: 4, targetDays: 5 },
    { type: 'Illegal Dumping / Needles', avgDays: 6, targetDays: 7 },
    { type: 'Tree Maintenance', avgDays: 12, targetDays: 14 },
    { type: 'Traffic Signal Malfunction', avgDays: 1, targetDays: 2 },
    { type: 'Sidewalk Repair', avgDays: 15, targetDays: 14 },
    { type: 'Water Main Break', avgDays: 1, targetDays: 1 },
    { type: 'General Inquiry - Police Department', avgDays: 2, targetDays: 3 }
  ];

  const neighborhoods = [
    'Capitol Hill', 'Ballard', 'Fremont', 'Queen Anne', 'University District',
    'Greenwood', 'Wallingford', 'Ravenna', 'Green Lake', 'Northgate',
    'Roosevelt', 'Stevens', 'Adams', 'Meadowbrook'
  ];

  const requests = [];
  const tracking = [];
  
  // Generate data for 2025 only (January to current date)
  const startDate = new Date('2025-01-01');
  const endDate = new Date(); // Today
  const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  // Generate 600 sample requests for 2025
  for (let i = 0; i < 600; i++) {
    const requestType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
    
    // Create dates within 2025 (Jan 1 to today)
    const daysFromStart = Math.floor(Math.random() * daysDiff);
    const createdDate = new Date(startDate);
    createdDate.setDate(createdDate.getDate() + daysFromStart);
    
    const daysOpen = Math.floor(Math.random() * 30);
    const willClose = Math.random() > 0.3;
    let closedDate = null;
    
    if (willClose) {
      closedDate = new Date(createdDate.getTime() + daysOpen * 24 * 60 * 60 * 1000);
      if (closedDate > endDate) closedDate = null;
    }
    
    const status = closedDate ? 'Closed' : (Math.random() > 0.4 ? 'In Progress' : 'Open');
    
    const request = {
      service_request_number: `25-${String(10000 + i).padStart(6, '0')}`,
      service_request_type: requestType.type,
      city_department: department,
      status: status,
      created_date: createdDate.toISOString(),
      closed_date: closedDate?.toISOString(),
      expected_resolution_days: requestType.targetDays,
      actual_resolution_days: closedDate ? daysOpen : null,
      sla_met: closedDate ? (daysOpen <= requestType.targetDays) : null,
      location: `${neighborhood}, Seattle, WA`,
      neighborhood: neighborhood,
      council_district: `${Math.floor(Math.random() * 7 + 1)}`,
      latitude: 47.6062 + (Math.random() - 0.5) * 0.1,
      longitude: -122.3321 + (Math.random() - 0.5) * 0.1,
      zip_code: `981${Math.floor(Math.random() * 30 + 1).toString().padStart(2, '0')}`,
      method_received: ['Find It Fix It Apps', 'Citizen Web', 'Phone'][Math.floor(Math.random() * 3)]
    };
    
    requests.push(request);

    // Generate tracking updates
    const statusUpdates = [
      { status: 'Request Received', days: 0 },
      { status: 'Routed to Department', days: 0.5 },
      { status: 'Assigned to Staff', days: 1 },
      { status: 'Work Scheduled', days: 3 }
    ];

    if (status === 'Closed') {
      statusUpdates.push({ status: 'Work Complete', days: Math.max(0, daysOpen - 1) });
      statusUpdates.push({ status: 'Verified', days: daysOpen });
    }

    const numUpdates = status === 'Closed' ? statusUpdates.length : Math.min(3, statusUpdates.length);

    for (let j = 0; j < numUpdates; j++) {
      const update = statusUpdates[j];
      const updateDate = new Date(createdDate.getTime() + update.days * 24 * 60 * 60 * 1000);
      
      if (updateDate <= endDate) {
        tracking.push({
          service_request_number: request.service_request_number,
          status: update.status,
          updated_at: updateDate.toISOString(),
          department: department
        });
      }
    }
  }

  console.log(`✅ Generated ${requests.length} sample requests for 2025`);

  return { 
    requests, 
    tracking,
    dataSource: 'Sample Data (Demo - 2025)',
    timestamp: new Date().toISOString()
  };
};

export { generateEnhancedSampleData };