// src/components/DataStatistics.jsx
// ❌ THIS IS NOT A UI DASHBOARD ❌
// This is a DATA STATISTICS VIEWER - Direct data display only
// Shows: Department requests, Issue types, Resolution times, Monthly counts

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Clock, FileText, Calendar, Filter, Download } from 'lucide-react';

const DataStatistics = ({ data }) => {
  const [departmentData, setDepartmentData] = useState([]);
  const [issueTypeData, setIssueTypeData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedView, setSelectedView] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const requests = data?.requests || [];

  useEffect(() => {
    if (requests.length > 0) {
      calculateStatistics();
    }
  }, [requests, selectedDepartment]);

  const calculateStatistics = () => {
    // Department-wise statistics
    const deptStats = {};
    const filteredRequests = selectedDepartment === 'all' 
      ? requests 
      : requests.filter(r => r.city_department === selectedDepartment);

    filteredRequests.forEach(req => {
      const dept = req.city_department || 'Unknown';
      if (!deptStats[dept]) {
        deptStats[dept] = {
          department: dept,
          totalRequests: 0,
          open: 0,
          inProgress: 0,
          closed: 0,
          avgResolutionDays: [],
        };
      }
      deptStats[dept].totalRequests++;
      
      if (req.status === 'Open') deptStats[dept].open++;
      if (req.status === 'In Progress') deptStats[dept].inProgress++;
      if (req.status === 'Closed') {
        deptStats[dept].closed++;
        if (req.actual_resolution_days !== null) {
          deptStats[dept].avgResolutionDays.push(req.actual_resolution_days);
        }
      }
    });

    const deptArray = Object.values(deptStats).map(dept => ({
      ...dept,
      avgResolutionDays: dept.avgResolutionDays.length > 0
        ? Math.round(dept.avgResolutionDays.reduce((a, b) => a + b, 0) / dept.avgResolutionDays.length)
        : 0
    })).sort((a, b) => b.totalRequests - a.totalRequests);

    setDepartmentData(deptArray);

    // Issue type statistics
    const issueStats = {};
    filteredRequests.forEach(req => {
      const type = req.service_request_type || 'Unknown';
      if (!issueStats[type]) {
        issueStats[type] = {
          issueType: type,
          totalRequests: 0,
          avgResolutionDays: [],
          expectedDays: req.expected_resolution_days || 5,
          open: 0,
          closed: 0,
        };
      }
      issueStats[type].totalRequests++;
      
      if (req.status === 'Open') issueStats[type].open++;
      if (req.status === 'Closed') {
        issueStats[type].closed++;
        if (req.actual_resolution_days !== null) {
          issueStats[type].avgResolutionDays.push(req.actual_resolution_days);
        }
      }
    });

    const issueArray = Object.values(issueStats).map(issue => ({
      ...issue,
      avgResolutionDays: issue.avgResolutionDays.length > 0
        ? Math.round(issue.avgResolutionDays.reduce((a, b) => a + b, 0) / issue.avgResolutionDays.length)
        : 0,
      completionRate: issue.totalRequests > 0 
        ? Math.round((issue.closed / issue.totalRequests) * 100) 
        : 0
    })).sort((a, b) => b.totalRequests - a.totalRequests).slice(0, 15);

    setIssueTypeData(issueArray);

    // Monthly statistics
    const monthStats = {};
    filteredRequests.forEach(req => {
      try {
        const date = new Date(req.created_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (!monthStats[monthKey]) {
          monthStats[monthKey] = {
            month: monthName,
            sortKey: monthKey,
            totalRequests: 0,
            open: 0,
            inProgress: 0,
            closed: 0,
          };
        }
        monthStats[monthKey].totalRequests++;
        
        if (req.status === 'Open') monthStats[monthKey].open++;
        if (req.status === 'In Progress') monthStats[monthKey].inProgress++;
        if (req.status === 'Closed') monthStats[monthKey].closed++;
      } catch (e) {
        // Skip invalid dates
      }
    });

    const monthArray = Object.values(monthStats)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    setMonthlyData(monthArray);
  };

  const exportData = () => {
    const csv = [
      'Data Type,Name,Total Requests,Open,In Progress,Closed,Avg Resolution Days',
      ...departmentData.map(d => 
        `Department,${d.department},${d.totalRequests},${d.open},${d.inProgress},${d.closed},${d.avgResolutionDays}`
      ),
      '',
      'Issue Type,Name,Total Requests,Open,Closed,Avg Resolution Days,Expected Days,Completion Rate',
      ...issueTypeData.map(i => 
        `Issue Type,${i.issueType},${i.totalRequests},${i.open},${i.closed},${i.avgResolutionDays},${i.expectedDays},${i.completionRate}%`
      ),
      '',
      'Month,Period,Total Requests,Open,In Progress,Closed',
      ...monthlyData.map(m => 
        `Month,${m.month},${m.totalRequests},${m.open},${m.inProgress},${m.closed}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seattle-statistics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  const departments = ['all', ...new Set(requests.map(r => r.city_department).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-t-4 border-blue-600">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="bg-red-100 border border-red-300 rounded-lg px-3 py-1 mb-2 inline-block">
                <p className="text-red-700 font-bold text-sm">⚠️ NOT A UI DASHBOARD</p>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="text-blue-600" />
                Data Statistics Viewer
              </h1>
              <p className="text-gray-600 mt-1">
                Direct data display - Tables and charts for analysis only
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Department Analysis • Issue Types • Resolution Times • Monthly Trends
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Records</div>
                <div className="text-3xl font-bold text-blue-600">{requests.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter by Department:</span>
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistics Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Requests</p>
                <p className="text-3xl font-bold text-gray-800">
                  {selectedDepartment === 'all' 
                    ? requests.length 
                    : requests.filter(r => r.city_department === selectedDepartment).length}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Closed</p>
                <p className="text-3xl font-bold text-gray-800">
                  {requests.filter(r => 
                    r.status === 'Closed' && 
                    (selectedDepartment === 'all' || r.city_department === selectedDepartment)
                  ).length}
                </p>
              </div>
              <Clock className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-gray-800">
                  {requests.filter(r => 
                    r.status === 'In Progress' && 
                    (selectedDepartment === 'all' || r.city_department === selectedDepartment)
                  ).length}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Open</p>
                <p className="text-3xl font-bold text-gray-800">
                  {requests.filter(r => 
                    r.status === 'Open' && 
                    (selectedDepartment === 'all' || r.city_department === selectedDepartment)
                  ).length}
                </p>
              </div>
              <FileText className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Department-wise Requests */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" />
            Requests by Department
          </h2>
          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/3">Department</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Open</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">In Progress</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Closed</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {departmentData.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 break-words">
                      {dept.department}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{dept.totalRequests}</td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">{dept.open}</td>
                    <td className="px-4 py-3 text-sm text-right text-orange-600">{dept.inProgress}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">{dept.closed}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">{dept.avgResolutionDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 120 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="department" 
                angle={-45} 
                textAnchor="end" 
                height={140}
                interval={0}
                tick={{ fontSize: 11 }}
                tickMargin={15}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="totalRequests" fill="#3B82F6" name="Total Requests" />
              <Bar dataKey="closed" fill="#10B981" name="Closed" />
              <Bar dataKey="open" fill="#EF4444" name="Open" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Issue Type Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="text-green-600" />
            Issue Types & Average Resolution Time
          </h2>
          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/3">Issue Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Days</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expected</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Complete %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {issueTypeData.map((issue, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 break-words">
                      {issue.issueType}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{issue.totalRequests}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={`font-semibold ${issue.avgResolutionDays <= issue.expectedDays ? 'text-green-600' : 'text-orange-600'}`}>
                        {issue.avgResolutionDays}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">{issue.expectedDays}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={`font-semibold ${issue.completionRate >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                        {issue.completionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={issueTypeData.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 30, left: 200, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="issueType" 
                type="category" 
                width={190}
                tick={{ fontSize: 11 }}
                interval={0}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="avgResolutionDays" fill="#10B981" name="Avg Resolution Days" />
              <Bar dataKey="expectedDays" fill="#F59E0B" name="Expected Days" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Requests */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="text-purple-600" />
            Monthly Request Trend
          </h2>
          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Open</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">In Progress</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Closed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {monthlyData.map((month, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{month.month}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{month.totalRequests}</td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">{month.open}</td>
                    <td className="px-4 py-3 text-sm text-right text-orange-600">{month.inProgress}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">{month.closed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11 }}
                interval={0}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line type="monotone" dataKey="totalRequests" stroke="#3B82F6" strokeWidth={2} name="Total Requests" />
              <Line type="monotone" dataKey="closed" stroke="#10B981" strokeWidth={2} name="Closed" />
              <Line type="monotone" dataKey="open" stroke="#EF4444" strokeWidth={2} name="Open" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-red-50 border-2 border-red-300 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🚫</div>
            <div>
              <h3 className="text-lg font-bold text-red-800 mb-2">NOT A UI DASHBOARD</h3>
              <p className="text-sm text-gray-700 mb-2">
                This is a <strong>DATA STATISTICS VIEWER</strong> for direct data analysis. It shows:
              </p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• Raw statistics in table format</li>
                <li>• Simple charts for data visualization only</li>
                <li>• Direct data export capability</li>
                <li>• NO dashboard-style monitoring</li>
                <li>• NO executive KPI displays</li>
                <li>• NO business intelligence features</li>
              </ul>
              <p className="text-sm text-red-700 font-semibold mt-3">
                This component is designed for data analysis, NOT as a UI dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataStatistics;