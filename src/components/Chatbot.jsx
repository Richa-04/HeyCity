// src/components/Chatbot.jsx
// AI Chatbot for Seattle Customer Service Requests
// Helps users find departments, check status, get resolution times, and find similar requests

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Bot, User, ExternalLink, Clock, MapPin, Search, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const Chatbot = ({ data }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Safely access data
  const requests = data?.requests || [];

const hasShownWelcome = useRef(false);

// Replace your current useEffect (lines 27-37) with this:
useEffect(() => {
  // Only add welcome message once, even on remounts
  if (!hasShownWelcome.current) {
    hasShownWelcome.current = true;
    addBotMessage(
      "👋 Hello! I'm your Seattle Customer Service Assistant. I can help you with:\n\n" +
      "1️⃣ Find the right department for your issue\n" +
      "2️⃣ Check status of existing requests\n" +
      "3️⃣ Get estimated resolution times\n" +
      "4️⃣ Learn how to submit a new request\n" +
      "5️⃣ Check if similar requests exist in your area\n\n" +
      "What would you like help with today?"
    );
  }
}, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (text, type = 'text', data = null) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'bot',
      text,
      type,
      data,
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date()
    }]);
  };

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage.trim();
    addUserMessage(userMsg);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      processMessage(userMsg);
      setIsTyping(false);
    }, 1000);
  };

  const processMessage = (message) => {
    const msgLower = message.toLowerCase();

    // Check for request number (priority check)
    const requestNumberMatch = message.match(/\d{2}-\d{6,8}|25-\d{6,8}/i);
    if (requestNumberMatch) {
      checkRequestStatus(requestNumberMatch[0]);
      return;
    }

    // Check for ZIP code
    const zipMatch = message.match(/\b98\d{3}\b/);
    if (zipMatch) {
      checkRequestsByZip(zipMatch[0]);
      return;
    }

    // Check for street address patterns
    const addressPatterns = [
      /\d+\s+\w+\s+(st|street|ave|avenue|rd|road|way|blvd|boulevard|dr|drive|ln|lane|pl|place)/i,
      /\d+\s+\w+\s+\w+\s+(st|street|ave|avenue|rd|road|way|blvd|boulevard)/i,
      /\b(north|south|east|west|n|s|e|w)\s+\d+/i
    ];

    for (const pattern of addressPatterns) {
      const addressMatch = message.match(pattern);
      if (addressMatch) {
        checkSimilarRequests(addressMatch[0]);
        return;
      }
    }

    // Check for neighborhood/area mentions
    const neighborhoods = ['capitol hill', 'ballard', 'fremont', 'queen anne', 'university district', 
                          'greenwood', 'wallingford', 'ravenna', 'green lake', 'northgate',
                          'downtown', 'pioneer square', 'international district', 'beacon hill'];
    
    const foundNeighborhood = neighborhoods.find(n => msgLower.includes(n));
    if (foundNeighborhood && (msgLower.includes('near') || msgLower.includes('in') || msgLower.includes('area') || msgLower.includes('similar'))) {
      checkRequestsByNeighborhood(foundNeighborhood);
      return;
    }

    // Intent detection
    if (msgLower.includes('similar') || msgLower.includes('area') || msgLower.includes('neighborhood') || msgLower.includes('nearby')) {
      addBotMessage(
        "🔍 **Check Similar Requests in Your Area**\n\n" +
        "I can search for requests near your location! Please provide:\n\n" +
        "**Option 1:** Street address\n" +
        "• Example: \"123 Main St\"\n" +
        "• Example: \"5th Ave and Pine St\"\n\n" +
        "**Option 2:** ZIP code\n" +
        "• Example: \"98101\"\n\n" +
        "**Option 3:** Neighborhood\n" +
        "• Example: \"Capitol Hill\"\n" +
        "• Example: \"Ballard area\"\n\n" +
        "**Option 4:** Describe your issue and location\n" +
        "• Example: \"Pothole near 123 Pine St\"\n" +
        "• Example: \"Streetlight out in Fremont\""
      );
      return;
    }

    if (msgLower.includes('status') || msgLower.includes('check')) {
      addBotMessage(
        "I can check the status of your request! Please provide:\n\n" +
        "• Your service request number (e.g., 25-100001)\n" +
        "• Or describe your issue and location"
      );
    } else if (msgLower.includes('department') || msgLower.includes('who') || msgLower.includes('contact')) {
      handleDepartmentQuery(msgLower);
    } else if (msgLower.includes('time') || msgLower.includes('long') || msgLower.includes('when')) {
      handleResolutionTimeQuery(msgLower);
    } else if (msgLower.includes('submit') || msgLower.includes('report') || msgLower.includes('request') || msgLower.includes('new')) {
      provideSubmissionProcess(msgLower);
    } else {
      // Try to detect issue type
      detectIssueType(msgLower);
    }
  };

  const checkRequestStatus = (requestNumber) => {
    const request = requests.find(r => 
      r.service_request_number?.includes(requestNumber)
    );

    if (request) {
      const createdDate = new Date(request.created_date).toLocaleDateString();
      const daysOpen = calculateDaysOpen(request.created_date, request.closed_date);
      
      addBotMessage(
        `📋 **Request Status: ${requestNumber}**\n\n` +
        `**Type:** ${request.service_request_type}\n` +
        `**Status:** ${getStatusEmoji(request.status)} ${request.status}\n` +
        `**Department:** ${request.city_department}\n` +
        `**Created:** ${createdDate}\n` +
        `**Days Open:** ${daysOpen} days\n` +
        `**Location:** ${request.location || 'Not specified'}\n\n` +
        `**Expected Resolution:** ${request.expected_resolution_days} days\n` +
        `**SLA Met:** ${request.sla_met === null ? '⏳ In Progress' : request.sla_met ? '✅ Yes' : '⚠️ Exceeded'}`,
        'status',
        request
      );

      // Provide department contact
      setTimeout(() => {
        provideDepartmentContact(request.city_department, request.service_request_type);
      }, 1500);
    } else {
      addBotMessage(
        `❌ I couldn't find request number **${requestNumber}** in our 2025 database.\n\n` +
        "**Possible reasons:**\n" +
        "• Request is from before 2025\n" +
        "• Request number might be incorrect\n" +
        "• Request hasn't been synced yet\n\n" +
        "Would you like to:\n" +
        "1️⃣ Check a different request number\n" +
        "2️⃣ Report a new issue\n" +
        "3️⃣ Find the right department"
      );
    }
  };

  const checkSimilarRequests = (address) => {
    // Clean up the address for better matching
    const cleanAddress = address.toLowerCase().trim();
    
    // Search by multiple criteria
    const similar = requests.filter(r => {
      const location = (r.location || '').toLowerCase();
      
      // Extract key parts of the address
      const addressParts = cleanAddress.split(/\s+/);
      const streetNumber = addressParts.find(part => /^\d+$/.test(part));
      const streetName = addressParts.find(part => /^[a-z]+$/i.test(part) && part.length > 2);
      
      // Match if location contains address parts
      if (streetNumber && location.includes(streetNumber)) return true;
      if (streetName && location.includes(streetName)) return true;
      if (location.includes(cleanAddress)) return true;
      
      // Also check for nearby addresses (same street)
      if (streetName) {
        const locationParts = location.split(/\s+/);
        return locationParts.some(part => part.includes(streetName));
      }
      
      return false;
    });

    if (similar.length > 0) {
      // Get unique request types
      const requestTypes = [...new Set(similar.map(r => r.service_request_type))];
      const statusBreakdown = {
        open: similar.filter(r => r.status === 'Open').length,
        inProgress: similar.filter(r => r.status === 'In Progress').length,
        closed: similar.filter(r => r.status === 'Closed').length
      };

      let response = `🔍 **Found ${similar.length} Requests Near "${address}"**\n\n`;
      
      response += `📊 **Summary:**\n`;
      response += `• Total Requests: ${similar.length}\n`;
      response += `• Open: ${statusBreakdown.open} | In Progress: ${statusBreakdown.inProgress} | Closed: ${statusBreakdown.closed}\n`;
      response += `• Issue Types: ${requestTypes.length} different types\n\n`;

      response += `📋 **Recent Requests:**\n\n`;
      
      similar.slice(0, 8).forEach((req, idx) => {
        const emoji = req.status === 'Closed' ? '✅' : req.status === 'In Progress' ? '🔄' : '📋';
        const date = new Date(req.created_date).toLocaleDateString();
        response += `${idx + 1}. ${emoji} **${req.service_request_type}**\n`;
        response += `   Request #: ${req.service_request_number}\n`;
        response += `   Status: ${req.status} | Created: ${date}\n`;
        response += `   Location: ${req.location?.substring(0, 60)}...\n`;
        response += `   Department: ${req.city_department}\n\n`;
      });

      if (similar.length > 8) {
        response += `... and ${similar.length - 8} more requests in this area\n\n`;
      }

      response += "💡 **What This Means:**\n";
      if (statusBreakdown.open > 0 || statusBreakdown.inProgress > 0) {
        response += "• Active requests exist - issue may already be reported\n";
        response += "• City is aware and working on the area\n";
      }
      if (statusBreakdown.closed > 3) {
        response += "• This area has history of similar issues\n";
        response += "• Previous requests were successfully resolved\n";
      }
      
      response += "\n🎯 **Next Steps:**\n";
      response += "1. Check if any request matches your exact issue\n";
      response += "2. If similar, you can reference that request number\n";
      response += "3. If different, submit a new request\n";
      response += "4. Contact the department handling similar issues\n\n";
      response += "Would you like to:\n";
      response += "• Check status of a specific request?\n";
      response += "• Get department contact information?\n";
      response += "• Learn how to submit a new request?";

      addBotMessage(response, 'similar', similar.slice(0, 8));
    } else {
      addBotMessage(
        `📍 **No Requests Found Near "${address}"**\n\n` +
        "This could mean:\n" +
        "• No issues have been reported in this specific area\n" +
        "• The address might not be in our 2025 database\n" +
        "• Try a broader search (ZIP code or neighborhood)\n\n" +
        "🎯 **What You Can Do:**\n\n" +
        "1️⃣ **Try Different Search:**\n" +
        "   • Use ZIP code (e.g., '98101')\n" +
        "   • Use neighborhood (e.g., 'Capitol Hill')\n" +
        "   • Try nearby intersection\n\n" +
        "2️⃣ **Submit New Request:**\n" +
        "   • This might be a new issue\n" +
        "   • Get submission instructions\n\n" +
        "3️⃣ **Contact Department:**\n" +
        "   • Get direct contact for your issue type\n\n" +
        "Would you like help with any of these options?"
      );
    }
  };

  const checkRequestsByZip = (zipCode) => {
    const requestsInZip = requests.filter(r => 
      r.zip_code === zipCode || r.location?.includes(zipCode)
    );

    if (requestsInZip.length > 0) {
      const requestTypes = [...new Set(requestsInZip.map(r => r.service_request_type))];
      const recentRequests = requestsInZip
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 10);

      let response = `📍 **Found ${requestsInZip.length} Requests in ZIP Code ${zipCode}**\n\n`;
      
      response += `📊 **Area Statistics:**\n`;
      response += `• Total Requests: ${requestsInZip.length}\n`;
      response += `• Open: ${requestsInZip.filter(r => r.status === 'Open').length}\n`;
      response += `• In Progress: ${requestsInZip.filter(r => r.status === 'In Progress').length}\n`;
      response += `• Closed: ${requestsInZip.filter(r => r.status === 'Closed').length}\n`;
      response += `• Issue Types: ${requestTypes.join(', ')}\n\n`;

      response += `🕐 **Most Recent Requests:**\n\n`;
      
      recentRequests.forEach((req, idx) => {
        const date = new Date(req.created_date).toLocaleDateString();
        response += `${idx + 1}. **${req.service_request_type}** (${req.status})\n`;
        response += `   Request: ${req.service_request_number} | ${date}\n`;
        response += `   ${req.location?.substring(0, 50)}\n\n`;
      });

      response += "💡 Type a specific address in this ZIP for more detailed results.";

      addBotMessage(response, 'zipcode', recentRequests);
    } else {
      addBotMessage(
        `📍 No requests found in ZIP code ${zipCode}.\n\n` +
        "Try:\n• Different ZIP code\n• Specific street address\n• Neighborhood name"
      );
    }
  };

  const checkRequestsByNeighborhood = (neighborhood) => {
    const neighborhoodUpper = neighborhood.charAt(0).toUpperCase() + neighborhood.slice(1);
    const requestsInArea = requests.filter(r => 
      r.location?.toLowerCase().includes(neighborhood) ||
      r.neighborhood?.toLowerCase().includes(neighborhood)
    );

    if (requestsInArea.length > 0) {
      const requestTypes = [...new Set(requestsInArea.map(r => r.service_request_type))];
      
      let response = `🏘️ **Found ${requestsInArea.length} Requests in ${neighborhoodUpper}**\n\n`;
      
      response += `📊 **Neighborhood Summary:**\n`;
      response += `• Total Requests: ${requestsInArea.length}\n`;
      response += `• Open: ${requestsInArea.filter(r => r.status === 'Open').length}\n`;
      response += `• Closed: ${requestsInArea.filter(r => r.status === 'Closed').length}\n`;
      response += `• Common Issues: ${requestTypes.slice(0, 3).join(', ')}\n\n`;

      response += `🔥 **Most Common Request Types:**\n`;
      const typeCounts = {};
      requestsInArea.forEach(r => {
        typeCounts[r.service_request_type] = (typeCounts[r.service_request_type] || 0) + 1;
      });
      
      Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([type, count]) => {
          response += `• ${type}: ${count} requests\n`;
        });

      response += "\n💡 Provide a specific address for more detailed results.";

      addBotMessage(response, 'neighborhood', requestsInArea.slice(0, 5));
    } else {
      addBotMessage(
        `🏘️ No requests found in ${neighborhoodUpper}.\n\n` +
        "Try a different neighborhood or provide a specific address."
      );
    }
  };

  const handleDepartmentQuery = (message) => {
    const issueType = detectIssueTypeFromMessage(message);
    
    if (issueType) {
      const dept = getDepartmentForIssue(issueType);
      provideDepartmentContact(dept.name, issueType);
    } else {
      addBotMessage(
        "🏛️ **Seattle City Departments:**\n\n" +
        "Please tell me what type of issue you have, and I'll direct you to the right department:\n\n" +
        "• **Police Issues** - Seattle Police Department\n" +
        "• **Street/Traffic** - Seattle Dept of Transportation\n" +
        "• **Water/Sewer** - Seattle Public Utilities\n" +
        "• **Parks** - Parks and Recreation\n" +
        "• **Streetlights** - Seattle City Light\n" +
        "• **General Services** - Finance & Admin Services\n\n" +
        "What type of issue do you need help with?"
      );
    }
  };

  const handleResolutionTimeQuery = (message) => {
    const issueType = detectIssueTypeFromMessage(message);
    
    if (issueType) {
      const resolutionDays = getExpectedResolutionDays(issueType);
      const stats = getIssueTypeStats(issueType);
      
      addBotMessage(
        `⏱️ **Resolution Time for ${issueType}:**\n\n` +
        `**Expected:** ${resolutionDays} business days\n` +
        `**Average (2025):** ${stats.avgDays} days\n` +
        `**Fastest:** ${stats.fastest} days\n` +
        `**Slowest:** ${stats.slowest} days\n\n` +
        `📊 **Statistics:**\n` +
        `• Total Requests: ${stats.total}\n` +
        `• Completed: ${stats.closed}\n` +
        `• On-Time Rate: ${stats.slaRate}%\n\n` +
        "💡 Resolution times may vary based on:\n" +
        "• Complexity of issue\n" +
        "• Resource availability\n" +
        "• Weather conditions\n" +
        "• Safety considerations"
      );
    } else {
      addBotMessage(
        "⏱️ **Typical Resolution Times:**\n\n" +
        "• **Emergency (Water main, traffic signal):** 1-2 days\n" +
        "• **High Priority (Abandoned vehicle, pothole):** 3-5 days\n" +
        "• **Standard (Graffiti, illegal dumping):** 7 days\n" +
        "• **Low Priority (Tree maintenance, sidewalk):** 14 days\n\n" +
        "What specific issue type would you like to know about?"
      );
    }
  };

  const provideSubmissionProcess = (message) => {
    const issueType = detectIssueTypeFromMessage(message);
    const dept = issueType ? getDepartmentForIssue(issueType) : null;

    addBotMessage(
      "📝 **How to Submit a Service Request:**\n\n" +
      "**Option 1: Online (Fastest)**\n" +
      "1. Visit Find It, Fix It Seattle portal\n" +
      "2. Select your issue type\n" +
      "3. Provide location and details\n" +
      "4. Upload photos (optional)\n" +
      "5. Submit and receive confirmation number\n\n" +
      "**Option 2: Phone**\n" +
      "📞 Seattle Customer Service: (206) 684-CITY (2489)\n" +
      "⏰ Hours: Mon-Fri, 8:00 AM - 5:00 PM\n\n" +
      "**Option 3: Mobile App**\n" +
      "📱 Download 'Find It, Fix It' app (iOS/Android)\n\n" +
      (dept ? `**For ${issueType}:**\n` +
              `Department: ${dept.name}\n` +
              `Direct Contact: ${dept.phone}\n` +
              `Website: ${dept.website}\n\n` : '') +
      "**What You'll Need:**\n" +
      "• Specific address or intersection\n" +
      "• Detailed description of issue\n" +
      "• Photos (if possible)\n" +
      "• Contact information\n\n" +
      "Would you like me to guide you through reporting a specific issue?",
      'submission'
    );

    if (dept) {
      setTimeout(() => {
        addBotMessage(
          `🔗 **Quick Links for ${issueType}:**`,
          'links',
          dept
        );
      }, 1500);
    }
  };

  const provideDepartmentContact = (deptName, issueType) => {
    const deptInfo = getDepartmentInfo(deptName);
    
    addBotMessage(
      `🏛️ **${deptInfo.name}**\n\n` +
      `📞 **Phone:** ${deptInfo.phone}\n` +
      `📧 **Email:** ${deptInfo.email}\n` +
      `🌐 **Website:** ${deptInfo.website}\n` +
      `⏰ **Hours:** ${deptInfo.hours}\n\n` +
      `**Handles:**\n${deptInfo.services}\n\n` +
      `**Expected Resolution:** ${getExpectedResolutionDays(issueType)} business days`,
      'department',
      deptInfo
    );
  };

  const detectIssueType = (message) => {
    const issueKeywords = {
      'graffiti': ['graffiti', 'spray paint', 'vandalism'],
      'pothole': ['pothole', 'hole in road', 'street damage'],
      'streetlight': ['streetlight', 'street light', 'light out', 'dark'],
      'abandoned vehicle': ['abandoned', 'vehicle', 'car', 'abandoned car'],
      'illegal dumping': ['dumping', 'trash', 'garbage', 'waste', 'litter'],
      'tree': ['tree', 'branch', 'fallen tree', 'tree maintenance'],
      'water': ['water', 'leak', 'water main', 'flooding'],
      'sewer': ['sewer', 'drain', 'backup'],
      'traffic': ['traffic', 'signal', 'sign', 'intersection'],
      'park': ['park', 'playground', 'trail']
    };

    for (const [type, keywords] of Object.entries(issueKeywords)) {
      if (keywords.some(kw => message.includes(kw))) {
        handleResolutionTimeQuery(type);
        setTimeout(() => {
          const dept = getDepartmentForIssue(type);
          provideDepartmentContact(dept.name, type);
        }, 2000);
        return;
      }
    }

    addBotMessage(
      "I'd be happy to help! Can you describe your issue? For example:\n\n" +
      "• 'There's a pothole on my street'\n" +
      "• 'A streetlight is out'\n" +
      "• 'I need to report graffiti'\n" +
      "• 'There's an abandoned vehicle'\n\n" +
      "Or ask me something like:\n" +
      "• 'How do I submit a request?'\n" +
      "• 'Check status of request 25-100001'\n" +
      "• 'Are there similar issues near 123 Main St?'"
    );
  };

  const detectIssueTypeFromMessage = (message) => {
    if (message.includes('graffiti')) return 'Graffiti';
    if (message.includes('pothole') || message.includes('hole')) return 'Pothole';
    if (message.includes('light')) return 'Streetlight Repair';
    if (message.includes('vehicle') || message.includes('abandoned')) return 'Abandoned Vehicle';
    if (message.includes('dump') || message.includes('trash')) return 'Illegal Dumping';
    if (message.includes('tree')) return 'Tree Maintenance';
    if (message.includes('water')) return 'Water Main Break';
    if (message.includes('sewer')) return 'Sewer Issue';
    if (message.includes('traffic') || message.includes('signal')) return 'Traffic Signal';
    if (message.includes('park')) return 'Park Maintenance';
    return null;
  };

  const getDepartmentForIssue = (issueType) => {
    const deptMap = {
      'Graffiti': { name: 'Seattle Public Utilities', phone: '(206) 684-7665', website: 'https://www.seattle.gov/utilities' },
      'Pothole': { name: 'Seattle Department of Transportation', phone: '(206) 684-ROAD', website: 'https://www.seattle.gov/transportation' },
      'Streetlight Repair': { name: 'Seattle City Light', phone: '(206) 684-3000', website: 'https://www.seattle.gov/city-light' },
      'Abandoned Vehicle': { name: 'Seattle Police Department', phone: '(206) 625-5011', website: 'https://www.seattle.gov/police' },
      'Illegal Dumping': { name: 'Seattle Public Utilities', phone: '(206) 684-7665', website: 'https://www.seattle.gov/utilities' },
      'Tree Maintenance': { name: 'Seattle Department of Transportation', phone: '(206) 684-TREE', website: 'https://www.seattle.gov/transportation' },
      'Water Main Break': { name: 'Seattle Public Utilities', phone: '(206) 386-1800', website: 'https://www.seattle.gov/utilities' },
      'Traffic Signal': { name: 'Seattle Department of Transportation', phone: '(206) 684-ROAD', website: 'https://www.seattle.gov/transportation' },
      'Park Maintenance': { name: 'Parks and Recreation', phone: '(206) 684-4075', website: 'https://www.seattle.gov/parks' }
    };

    return deptMap[issueType] || { 
      name: 'Seattle Customer Service Bureau', 
      phone: '(206) 684-CITY', 
      website: 'https://www.seattle.gov/customer-service-bureau' 
    };
  };

  const getDepartmentInfo = (deptName) => {
    const departments = {
      'Seattle Police Department': {
        name: 'Seattle Police Department',
        phone: '(206) 625-5011',
        email: 'police@seattle.gov',
        website: 'https://www.seattle.gov/police',
        hours: '24/7 for emergencies, 8 AM - 5 PM for non-emergencies',
        services: '• Abandoned vehicles\n• Parking enforcement\n• General police matters'
      },
      'Seattle Department of Transportation': {
        name: 'Seattle Department of Transportation',
        phone: '(206) 684-ROAD (7623)',
        email: 'customerservice@seattle.gov',
        website: 'https://www.seattle.gov/transportation',
        hours: 'Mon-Fri, 8:00 AM - 5:00 PM',
        services: '• Potholes\n• Traffic signals\n• Street signs\n• Sidewalk repairs'
      },
      'Seattle Public Utilities': {
        name: 'Seattle Public Utilities',
        phone: '(206) 684-7665',
        email: 'customerservice@seattle.gov',
        website: 'https://www.seattle.gov/utilities',
        hours: 'Mon-Fri, 8:00 AM - 5:00 PM (24/7 for emergencies)',
        services: '• Water/sewer issues\n• Illegal dumping\n• Graffiti removal'
      },
      'Seattle City Light': {
        name: 'Seattle City Light',
        phone: '(206) 684-3000',
        email: 'SCL_CustomerService@seattle.gov',
        website: 'https://www.seattle.gov/city-light',
        hours: '24/7 customer service',
        services: '• Streetlight repairs\n• Power outages\n• Electrical issues'
      },
      'Parks and Recreation': {
        name: 'Seattle Parks and Recreation',
        phone: '(206) 684-4075',
        email: 'parks@seattle.gov',
        website: 'https://www.seattle.gov/parks',
        hours: 'Mon-Fri, 8:00 AM - 5:00 PM',
        services: '• Park maintenance\n• Playground issues\n• Trail problems'
      }
    };

    return departments[deptName] || {
      name: 'Seattle Customer Service Bureau',
      phone: '(206) 684-CITY (2489)',
      email: 'customerservice@seattle.gov',
      website: 'https://www.seattle.gov/customer-service-bureau',
      hours: 'Mon-Fri, 8:00 AM - 5:00 PM',
      services: '• General inquiries\n• Service requests\n• City information'
    };
  };

  const getExpectedResolutionDays = (issueType) => {
    const slaMap = {
      'Abandoned Vehicle': 3,
      'Graffiti': 7,
      'Pothole': 3,
      'Streetlight Repair': 5,
      'Illegal Dumping': 7,
      'Tree Maintenance': 14,
      'Traffic Signal': 2,
      'Park Maintenance': 10,
      'Water Main Break': 1,
      'Sewer Issue': 2
    };
    return slaMap[issueType] || 5;
  };

  const getIssueTypeStats = (issueType) => {
    const filtered = requests.filter(r => 
      r.service_request_type?.toLowerCase().includes(issueType.toLowerCase())
    );

    const closed = filtered.filter(r => r.status === 'Closed');
    const days = closed.map(r => calculateDaysOpen(r.created_date, r.closed_date));
    const slaMet = closed.filter(r => r.sla_met === true).length;

    return {
      total: filtered.length,
      closed: closed.length,
      avgDays: days.length > 0 ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0,
      fastest: days.length > 0 ? Math.min(...days) : 0,
      slowest: days.length > 0 ? Math.max(...days) : 0,
      slaRate: closed.length > 0 ? Math.round((slaMet / closed.length) * 100) : 0
    };
  };

  const calculateDaysOpen = (createdDate, closedDate) => {
    try {
      const created = new Date(createdDate);
      const closed = closedDate ? new Date(closedDate) : new Date();
      return Math.floor((closed - created) / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'Closed': return '✅';
      case 'In Progress': return '🔄';
      case 'Open': return '📋';
      default: return '📌';
    }
  };

  const handleQuickAction = (action) => {
    setInputMessage(action);
    handleSend();
  };

  const renderMessage = (message) => {
    if (message.sender === 'user') {
      return (
        <div key={message.id} className="flex justify-end mb-4">
          <div className="flex items-start gap-2 max-w-[80%]">
            <div className="bg-blue-600 text-white rounded-lg px-4 py-3 shadow-md">
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <span className="text-xs opacity-75 mt-1 block">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="bg-blue-100 rounded-full p-2">
              <User className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={message.id} className="flex justify-start mb-4">
        <div className="flex items-start gap-2 max-w-[80%]">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-full p-2">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-md">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.text}</p>
            
            {message.type === 'department' && message.data && (
              <div className="mt-3 pt-3 border-t">
                <a
                  href={message.data.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Department Website
                </a>
              </div>
            )}

            <span className="text-xs text-gray-500 mt-2 block">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-t-lg shadow-lg p-6 border-b-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-full p-3">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">AI Customer Service Assistant</h1>
                <p className="text-gray-600 text-sm">Powered by Seattle Open Data • 2025</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Data Loaded</div>
              <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
              <div className="text-xs text-gray-500">requests</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white px-6 py-4 border-b">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 font-medium">Quick actions:</span>
            <button
              onClick={() => setInputMessage('Check status of my request')}
              className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-xs font-medium transition"
            >
              Check Status
            </button>
            <button
              onClick={() => setInputMessage('How do I submit a new request?')}
              className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-full text-xs font-medium transition"
            >
              Submit Request
            </button>
            <button
              onClick={() => setInputMessage('Similar requests in my area')}
              className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-xs font-medium transition"
            >
              Similar Requests
            </button>
            <button
              onClick={() => setInputMessage('Find department for my issue')}
              className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium transition"
            >
              Find Department
            </button>
            <button
              onClick={() => setInputMessage('How long will it take?')}
              className="px-3 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-full text-xs font-medium transition"
            >
              Resolution Time
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-white h-[500px] overflow-y-auto p-6">
          {messages.map(msg => renderMessage(msg))}
          
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start gap-2">
                <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-full p-2">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-md">
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-b-lg shadow-lg p-6">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about Seattle services..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg px-6 py-3 font-medium transition flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
          <div className="mt-3 text-xs text-gray-500 text-center">
            💡 Try: "Similar requests near 123 Main St" | "Requests in 98101" | "Issues in Capitol Hill" | "Check 25-100001"
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;