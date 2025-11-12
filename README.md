# 🌆 CityPulse Connect

<div>

**AI-Powered Transparency & Service Assistant for Smart Cities**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)]()
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)]()
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)]()
[![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)]()

</div>

> 🏆 **Hackathon Project** - Building smarter, more transparent cities through AI

---

## 🎯 The Problem

Every year, cities receive **millions of service requests** from residents:
- 🤷‍♀️ **Residents** submit requests blindly with no idea when issues will be resolved
- 📞 Frustration leads to repeated 311 calls asking "What's the status?"
- 🏛️ **City staff** lack cross-department visibility into bottlenecks and performance
- 📊 Data exists but isn't analyzed or used for decision-making
- 🌍 Language barriers prevent non-English speakers from accessing services
- 🔍 No way to see what issues affect your neighborhood

**Result:** Wasted time, low trust, and inefficient resource allocation.

---

## 💡 Our Solution

**CityPulse Connect** bridges the gap between residents and city services with:

### For Residents 👥
- 📱 **Smart Request Submission** - Easy form with geolocation
- 🤖 **AI-Powered Predictions** - Get instant estimates on resolution time
- 📍 **Real-Time Tracking** - Live status updates at every step
- 💬 **24/7 AI Chatbot** - Interactive assistant with quick actions
  - Ask questions about your requests anytime
  - Quick access to city department websites
  - Get instant answers about city services
- 🗺️ **Location-Based Insights** - View all requests in your area
- 🗣️ **Multilingual Support** - Access in your preferred language

### For City Staff 🏛️
- 📊 **Operations Dashboard** - Real-time view of all active requests
- ⚠️ **AI Alerts** - Identify bottlenecks and overdue requests automatically
- 📈 **Performance Analytics** - Track department efficiency and trends
- 🗺️ **Geospatial Visualization** - See request heat zones and patterns
- 🎯 **Resource Optimization** - Data-driven insights for crew allocation

---

## ✨ Key Features

### 🔮 AI-Powered Intelligence
- **Smart Predictions**: Analyzes request type, location, and severity to estimate resolution time
- **Natural Language Processing**: Understands urgency keywords ("dangerous", "urgent", "large")
- **Contextual Explanations**: Explains *why* repairs take the estimated time
- **Conversational Chatbot**: Answers resident questions 24/7 with intelligent responses

### 💬 Interactive Chatbot
- **Quick Actions**: One-click access to common tasks
- **Department Links**: Direct connections to official government websites
- **Location Queries**: "What issues are reported near me?"
- **Request Status**: Check your service request status instantly
- **Smart Routing**: Get directed to the right department for your issue

### 🗺️ Location-Based Features
- **Area Request View**: See all service requests at any location
- **Neighborhood Insights**: Understand what issues affect your community
- **Real Data Integration**: Powered by actual city service request data
- **Geospatial Filtering**: Find requests by address or coordinates

### 🎨 User Experience
- **Intuitive Interface**: Clean, modern design that anyone can use
- **Mobile-First**: Fully responsive for smartphone access
- **Real-Time Updates**: Live status changes without page refresh
- **Accessibility**: Built with inclusivity in mind

### 📊 Data & Analytics
- **Real City Data**: Integrated with actual 311 service request databases
- **Historical Pattern Analysis**: Learns from past requests to improve predictions
- **Department Performance Metrics**: Track resolution times by type and location
- **Bottleneck Detection**: AI identifies where resources are needed most
- **Trend Visualization**: Charts and graphs for actionable insights

---

## 🛠️ Tech Stack

**Frontend**
- React 18
- CSS3 with animations
- Recharts for data visualization
- Lucide React for icons

**AI & Intelligence**
- OpenAI GPT-3.5 for natural language processing
- Smart fallback algorithms for offline predictions
- Pattern-matching AI for urgency detection
- Contextual chatbot with quick actions

**Data Integration**
- Real city 311 service request data
- Geolocation services for location-based queries
- REST API compatible architecture

**Ready for Integration**
- REST API compatible
- Designed for 311 system integration
- PostGIS-ready for geospatial queries

---

## 🚀 Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Prerequisites
- Node.js 14+ and npm
- (Optional) OpenAI API key for chatbot features

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/citypulse-connect.git

# Navigate to project directory
cd citypulse-connect

# Install dependencies
npm install
```

### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

---

## 📖 Project Structure

```
citypulse-connect/
├── src/
│   ├── App.js              # Main application component
│   ├── App.css             # Styles & animations
│   ├── AIChatbot.js        # Interactive chatbot with quick actions
│   ├── aiService.js        # AI integration & API calls
│   ├── mockData.js         # Sample data for development
│   └── index.js            # Entry point
├── public/
│   └── index.html
├── package.json
└── README.md
```

---

## 🎯 How It Works

### Request Flow
1. **Resident submits** service request with description and location
2. **AI analyzes** urgency keywords and request type
3. **System predicts** resolution time based on historical patterns
4. **Generates explanation** of timeline factors
5. **Provides tracking** with real-time status updates
6. **Chatbot assists** with questions and updates throughout the process

### Chatbot Interaction Flow
1. **User opens** chatbot widget
2. **Quick actions** provide instant access to common tasks
3. **Natural language** understanding processes user questions
4. **Smart routing** connects users to relevant departments
5. **Location queries** show nearby service requests
6. **Real-time responses** powered by OpenAI and city data

### City Dashboard Flow
1. **Aggregates** all active requests from real city data
2. **Identifies** bottlenecks and overdue items
3. **Displays** department performance metrics
4. **Visualizes** geographic patterns and trends
5. **Alerts** staff to resource allocation needs

---

## 🌟 Chatbot Quick Actions

The AI chatbot includes intelligent quick actions for common tasks:

- 🏛️ **Find Department** - Get direct links to official city department websites
- 📍 **Location Requests** - "Show me requests near [address]"
- 📊 **Request Status** - Check the status of your service requests
- ❓ **FAQs** - Instant answers to frequently asked questions
- 🔗 **Resources** - Access city services and information

---

## 📊 Expected Impact

| Metric | Improvement |
|--------|-------------|
| 311 Call Volume | ↓ 40% reduction |
| Resident Satisfaction | ↑ 35% increase |
| Average Resolution Time | ↓ 15% faster |
| Resource Efficiency | ↑ 25% improvement |
| Self-Service Rate | ↑ 50% increase |
| Annual Cost Savings | $50k - $200k |

---

<div>

**Made with 💙 for better cities and happier residents**

⭐ Star us on GitHub if you find this project useful!

</div>
