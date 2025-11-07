// src/components/StatusTracker.jsx
// Track and search service requests with detailed timeline

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Clock, TrendingUp, Filter, X } from 'lucide-react';

const StatusTracker = ({ data }) => {
  // Safely access data with fallbacks
  const requests = data?.requests || [];
  const tracking = data?.tracking || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filteredRequests, setFilteredRequests] = useState(requests);
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, departmentFilter, requests]);

  const applyFilters = () => {
    let filtered = [...requests];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.service_request_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.service_request_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(req => req.city_department === departmentFilter);
    }

    setFilteredRequests(filtered);
  };

  const getRequestTracking = (requestNumber) => {
    return tracking.filter(t => t.service_request_number === requestNumber)
      .sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Closed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Open': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const calculateDaysOpen = (createdDate, closedDate) => {
    try {
      const created = new Date(createdDate);
      const closed = closedDate ? new Date(closedDate) : new Date();
      const days = Math.floor((closed - created) / (1000 * 60 * 60 * 24));
      return days >= 0 ? days : 0;
    } catch {
      return 0;
    }
  };

  // Get unique values for filters
  const statuses = ['all', ...new Set(requests.map(r => r.status).filter(Boolean))];
  const departments = ['all', ...new Set(requests.map(r => r.city_department).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Search className="text-blue-600" />
                Status Tracker
              </h1>
              <p className="text-gray-600 mt-1">Search and track customer service requests</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Requests</div>
              <div className="text-3xl font-bold text-blue-600">{requests.length}</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline w-4 h-4 mr-1" />
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Request #, type, location..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {departments.slice(0, 10).map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || statusFilter !== 'all' || departmentFilter !== 'all') && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                  Search: {searchTerm}
                  <X className="w-4 h-4 cursor-pointer" onClick={() => setSearchTerm('')} />
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                  Status: {statusFilter}
                  <X className="w-4 h-4 cursor-pointer" onClick={() => setStatusFilter('all')} />
                </span>
              )}
              {departmentFilter !== 'all' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                  Dept: {departmentFilter.substring(0, 20)}...
                  <X className="w-4 h-4 cursor-pointer" onClick={() => setDepartmentFilter('all')} />
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDepartmentFilter('all');
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredRequests.length}</span> of{' '}
            <span className="font-semibold">{requests.length}</span> requests
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request List */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-blue-50 border-b">
              <h3 className="text-lg font-bold text-gray-800">Service Requests</h3>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {filteredRequests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No requests found matching your filters</p>
                </div>
              ) : (
                filteredRequests.slice(0, 50).map((request, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedRequest(request)}
                    className={`p-4 cursor-pointer hover:bg-blue-50 transition ${
                      selectedRequest?.service_request_number === request.service_request_number
                        ? 'bg-blue-50 border-l-4 border-blue-600'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-blue-600">
                          {request.service_request_number}
                        </div>
                        <div className="text-sm text-gray-800 mt-1">
                          {request.service_request_type}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {request.location?.substring(0, 40) || 'No location'}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(request.created_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {calculateDaysOpen(request.created_date, request.closed_date)} days
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Request Detail */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-green-50 border-b">
              <h3 className="text-lg font-bold text-gray-800">Request Details</h3>
            </div>
            <div className="p-6">
              {!selectedRequest ? (
                <div className="text-center py-16 text-gray-500">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Select a request to view details</p>
                </div>
              ) : (
                <div>
                  {/* Request Info */}
                  <div className="mb-6">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {selectedRequest.service_request_number}
                    </div>
                    <div className="text-lg text-gray-800 mb-4">
                      {selectedRequest.service_request_type}
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="text-sm text-gray-500">Department</div>
                      <div className="text-gray-800 font-medium">
                        {selectedRequest.city_department}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="text-gray-800">{selectedRequest.location}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Created</div>
                        <div className="text-gray-800">
                          {formatDate(selectedRequest.created_date)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Days Open</div>
                        <div className="text-gray-800">
                          {calculateDaysOpen(selectedRequest.created_date, selectedRequest.closed_date)} days
                        </div>
                      </div>
                    </div>
                    {selectedRequest.expected_resolution_days && (
                      <div>
                        <div className="text-sm text-gray-500">Expected Resolution</div>
                        <div className="text-gray-800">
                          {selectedRequest.expected_resolution_days} days
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tracking Timeline */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Status Timeline</h4>
                    <div className="space-y-3">
                      {getRequestTracking(selectedRequest.service_request_number).length > 0 ? (
                        getRequestTracking(selectedRequest.service_request_number).map((track, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                              {idx < getRequestTracking(selectedRequest.service_request_number).length - 1 && (
                                <div className="w-0.5 h-full bg-blue-200"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="font-medium text-gray-800">{track.status_category || track.status}</div>
                              <div className="text-xs text-gray-500">
                                {formatDate(track.updated_at)}
                              </div>
                              {track.status_update && (
                                <div className="text-sm text-gray-600 mt-1">
                                  {track.status_update}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 text-center py-4">
                          No tracking updates available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusTracker;