export const API_ENDPOINTS = {
  CSR: 'https://data.seattle.gov/resource/5ngg-rpne.json',
  TRACKING: 'https://data.seattle.gov/resource/43nw-pkdq.json'
};

export const DEPARTMENTS = [
  'Seattle Police Department',
  'Transportation',
  'Seattle Public Utilities',
  'Parks and Recreation',
  'Human Services'
];

export const REQUEST_TYPES = [
  { type: 'Abandoned Vehicle', avgDays: 3, targetDays: 2 },
  { type: 'Graffiti', avgDays: 5, targetDays: 7 },
  { type: 'Pothole', avgDays: 2, targetDays: 3 },
  { type: 'Parking Enforcement', avgDays: 1, targetDays: 1 },
  { type: 'Unauthorized Encampment', avgDays: 10, targetDays: 5 },
  { type: 'Street Light Out', avgDays: 4, targetDays: 5 },
  { type: 'Illegal Dumping', avgDays: 6, targetDays: 7 },
  { type: 'Tree Maintenance', avgDays: 15, targetDays: 14 }
];

export const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'
];

export const STATUS_COLORS = {
  'Open': 'bg-orange-100 text-orange-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Closed': 'bg-green-100 text-green-800'
};

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];