import React, { useState, useEffect } from 'react';
import { Search, Clock, MapPin, TrendingUp, Activity, Calendar, Filter, RefreshCw, X } from 'lucide-react';

const TrackingDataViewer2025 = () => {
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [totalPages, setTotalPages] = useState(0);

  const API_URL = 'https://data.seattle.gov/resource/43nw-pkdq.json';
  const LIMIT = 5000;

  useEffect(() => {
    fetchTrackingData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trackingData, searchTerm, selectedDepartment, selectedStatus, startDate, endDate, selectedMonth, currentPage, itemsPerPage]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch 2025 tracking data
      const startDate = '2025-01-01T00:00:00.000';
      const endDate = '2025-12-31T23:59:59.999';
      const url = `${API_URL}?$limit=${LIMIT}&$where=updateddate between '${startDate}' and '${endDate}'&$order=updateddate DESC`;

      console.log('🔄 Fetching 2025 tracking data...');
      console.log('🔗 API:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Fetched ${data.length} tracking records`);

      // Process data
      const processedData = data.map(item => ({
        serviceRequestNumber: item.servicerequestnumber || 'N/A',
        department: item.responsibledepartment || 'Unknown',
        requestType: item.servicerequesttype || 'Unknown',
        location: item.reportedlocation || 'N/A',
        statusCategory: item.statuscategory || 'Unknown',
        updatedDate: item.updateddate || new Date().toISOString(),
        statusUpdate: item.statusupdate || 'No update',
        statusOrder: parseInt(item.statusorder || '0'),
        currentCategory: item.currentcategory || 'Unknown',
        currentStatus: item.currentstatus || 'Unknown',
        latitude: parseFloat(item.latitude) || null,
        longitude: parseFloat(item.longitude) || null
      }));

      setTrackingData(processedData);

      // Calculate statistics
      calculateStats(processedData);

      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const uniqueRequests = [...new Set(data.map(d => d.serviceRequestNumber))];
    const departments = [...new Set(data.map(d => d.department))];
    const statuses = [...new Set(data.map(d => d.statusCategory))];

    // Monthly breakdown
    const monthCounts = {};
    data.forEach(item => {
      try {
        const month = new Date(item.updatedDate).toLocaleString('default', { month: 'short' });
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      } catch (e) {}
    });

    // Status breakdown
    const statusCounts = {};
    data.forEach(item => {
      statusCounts[item.statusCategory] = (statusCounts[item.statusCategory] || 0) + 1;
    });

    setStats({
      totalUpdates: data.length,
      uniqueRequests: uniqueRequests.length,
      departments: departments.length,
      statuses: statuses.length,
      monthCounts,
      statusCounts,
      departmentList: departments.sort(),
      statusList: statuses.sort()
    });
  };

  const applyFilters = () => {
    let filtered = [...trackingData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.serviceRequestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.requestType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(item => item.department === selectedDepartment);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.statusCategory === selectedStatus);
    }

    // Date range filter
    if (startDate || endDate) {
      filtered = filtered.filter(item => {
        try {
          const itemDate = new Date(item.updatedDate);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;

          if (start && end) {
            return itemDate >= start && itemDate <= end;
          } else if (start) {
            return itemDate >= start;
          } else if (end) {
            return itemDate <= end;
          }
          return true;
        } catch {
          return true;
        }
      });
    }

    // Month filter
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(item => {
        try {
          const itemDate = new Date(item.updatedDate);
          const monthName = itemDate.toLocaleString('default', { month: 'short' });
          return monthName === selectedMonth;
        } catch {
          return false;
        }
      });
    }

    // Calculate total pages
    const pages = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(pages);

    // Reset to page 1 if current page exceeds total pages
    if (currentPage > pages && pages > 0) {
      setCurrentPage(1);
    }

    setFilteredData(filtered);
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('closed') || statusLower.includes('resolved')) return 'bg-green-100 text-green-800';
    if (statusLower.includes('progress')) return 'bg-blue-100 text-blue-800';
    if (statusLower.includes('routed')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // Pagination helpers
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of table
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, and pages around current
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedMonth('all');
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('all');
    setSelectedStatus('all');
    setStartDate('');
    setEndDate('');
    setSelectedMonth('all');
    setCurrentPage(1);
  };

  // Get available months from data
  const getAvailableMonths = () => {
    const months = new Set();
    trackingData.forEach(item => {
      try {
        const month = new Date(item.updatedDate).toLocaleString('default', { month: 'short' });
        months.add(month);
      } catch {}
    });
    return ['all', ...Array.from(months).sort((a, b) => {
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    })];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700">Loading 2025 Tracking Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTrackingData}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-blue-600">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Activity className="text-blue-600" />
                Seattle Customer Service Request Tracking
              </h1>
              <p className="text-gray-600 mt-1">2025 Real-Time Status Updates</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Data Source</div>
              <div className="text-blue-600 font-semibold">Seattle Open Data Portal</div>
              <div className="text-xs text-gray-400">Dataset: 43nw-pkdq</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Updates</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalUpdates?.toLocaleString()}</p>
              </div>
              <TrendingUp className="text-blue-600 w-12 h-12" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Unique Requests</p>
                <p className="text-3xl font-bold text-gray-800">{stats.uniqueRequests?.toLocaleString()}</p>
              </div>
              <Activity className="text-green-600 w-12 h-12" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Departments</p>
                <p className="text-3xl font-bold text-gray-800">{stats.departments}</p>
              </div>
              <MapPin className="text-purple-600 w-12 h-12" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Status Types</p>
                <p className="text-3xl font-bold text-gray-800">{stats.statuses}</p>
              </div>
              <Clock className="text-orange-600 w-12 h-12" />
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600" />
            2025 Monthly Updates
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {Object.entries(stats.monthCounts || {}).map(([month, count]) => (
              <div key={month} className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <div className="text-sm text-gray-600">{month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Filter className="text-blue-600" />
            Filters
          </h3>
          
          {/* First Row: Search, Department, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Request #, location, type..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Departments</option>
                {stats.departmentList?.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                {stats.statusList?.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Second Row: Date Filters */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Date Filters
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Month Quick Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Filter by Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    if (e.target.value !== 'all') {
                      setStartDate('');
                      setEndDate('');
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {getAvailableMonths().map(month => (
                    <option key={month} value={month}>
                      {month === 'all' ? 'All Months' : month}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (e.target.value) setSelectedMonth('all');
                  }}
                  max="2025-12-31"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (e.target.value) setSelectedMonth('all');
                  }}
                  max="2025-12-31"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Clear Date Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearDateFilters}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
                >
                  Clear Date Filters
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedDepartment !== 'all' || selectedStatus !== 'all' || startDate || endDate || selectedMonth !== 'all') && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-600">Active filters:</span>
                  
                  {searchTerm && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                      Search: "{searchTerm}"
                      <button onClick={() => setSearchTerm('')} className="hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  
                  {selectedDepartment !== 'all' && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1">
                      Dept: {selectedDepartment.substring(0, 20)}{selectedDepartment.length > 20 ? '...' : ''}
                      <button onClick={() => setSelectedDepartment('all')} className="hover:text-purple-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  
                  {selectedStatus !== 'all' && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                      Status: {selectedStatus}
                      <button onClick={() => setSelectedStatus('all')} className="hover:text-green-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  
                  {selectedMonth !== 'all' && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-1">
                      Month: {selectedMonth}
                      <button onClick={() => setSelectedMonth('all')} className="hover:text-orange-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  
                  {startDate && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center gap-1">
                      From: {new Date(startDate).toLocaleDateString()}
                      <button onClick={() => setStartDate('')} className="hover:text-indigo-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  
                  {endDate && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center gap-1">
                      To: {new Date(endDate).toLocaleDateString()}
                      <button onClick={() => setEndDate('')} className="hover:text-indigo-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
                
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredData.length}</span> of <span className="font-semibold">{trackingData.length}</span> updates
            {filteredData.length > 0 && (
              <span className="ml-2">
                (Page {currentPage} of {totalPages}, displaying {getPaginatedData().length} records)
              </span>
            )}
          </div>

          {/* Items per page selector */}
          <div className="mt-4 flex items-center gap-4">
            <label className="text-sm text-gray-600">Items per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
          </div>
        </div>

        {/* Tracking Data Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold text-gray-800">Latest Tracking Updates</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Update</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getPaginatedData().map((item, index) => {
                  const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={index} className="hover:bg-blue-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {actualIndex}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {item.serviceRequestNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.requestType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.statusCategory)}`}>
                          {item.statusCategory}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.location.substring(0, 30)}{item.location.length > 30 ? '...' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.updatedDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {item.statusUpdate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-6 bg-gray-50 border-t">
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Page Info */}
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-semibold">
                    {Math.min(currentPage * itemsPerPage, filteredData.length)}
                  </span>{' '}
                  of <span className="font-semibold">{filteredData.length}</span> results
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center gap-2">
                  {/* First Page */}
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    title="First Page"
                  >
                    ««
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    « Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="hidden md:flex items-center gap-1">
                    {getPageNumbers().map((page, idx) => (
                      page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  {/* Mobile: Current Page Display */}
                  <div className="md:hidden px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium">
                    Page {currentPage} / {totalPages}
                  </div>

                  {/* Next Page */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next »
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    title="Last Page"
                  >
                    »»
                  </button>
                </div>

                {/* Jump to Page */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Go to:</label>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        goToPage(page);
                      }
                    }}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingDataViewer2025;