// src/components/VoiceMode.jsx
// Voice-activated interface for Seattle Customer Service data

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Play, Pause } from 'lucide-react';

const VoiceMode = ({ data }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [history, setHistory] = useState([]);

  // Safely access data
  const requests = data?.requests || [];
  const tracking = data?.tracking || [];

  useEffect(() => {
    // Initial greeting
    speak('Welcome to Seattle Customer Service Voice Mode. You can ask about service requests, statistics, or say "help" for available commands.');
  }, []);

  const speak = (text) => {
    setResponse(text);
    setIsSpeaking(true);
    
    // Simulate speaking for 3 seconds
    setTimeout(() => {
      setIsSpeaking(false);
    }, 3000);

    // Add to history
    setHistory(prev => [...prev, { type: 'assistant', text, timestamp: new Date() }]);
  };

  const processVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();

    // Add to history
    setHistory(prev => [...prev, { type: 'user', text: command, timestamp: new Date() }]);

    // Process commands
    if (lowerCommand.includes('help')) {
      speak('You can ask: How many requests are open? What is the status of request number? Show statistics. List recent requests. Or ask about specific departments.');
    } 
    else if (lowerCommand.includes('how many') && lowerCommand.includes('open')) {
      const openCount = requests.filter(r => r.status === 'Open').length;
      speak(`There are currently ${openCount} open service requests.`);
    }
    else if (lowerCommand.includes('how many') && lowerCommand.includes('closed')) {
      const closedCount = requests.filter(r => r.status === 'Closed').length;
      speak(`There are ${closedCount} closed service requests.`);
    }
    else if (lowerCommand.includes('statistics') || lowerCommand.includes('stats')) {
      const openCount = requests.filter(r => r.status === 'Open').length;
      const closedCount = requests.filter(r => r.status === 'Closed').length;
      const inProgressCount = requests.filter(r => r.status === 'In Progress').length;
      speak(`Statistics: ${openCount} open requests, ${inProgressCount} in progress, and ${closedCount} closed requests.`);
    }
    else if (lowerCommand.includes('recent')) {
      const recentCount = Math.min(5, requests.length);
      speak(`Showing ${recentCount} most recent service requests. They appear on your screen now.`);
    }
    else if (lowerCommand.includes('department')) {
      const departments = [...new Set(requests.map(r => r.city_department))];
      speak(`There are ${departments.length} departments handling requests, including ${departments.slice(0, 3).join(', ')}, and others.`);
    }
    else if (lowerCommand.includes('status') && lowerCommand.match(/\d+/)) {
      const requestNumber = lowerCommand.match(/\d+/)[0];
      const request = requests.find(r => r.service_request_number.includes(requestNumber));
      if (request) {
        speak(`Request ${request.service_request_number} is currently ${request.status}. Type: ${request.service_request_type}. Department: ${request.city_department}.`);
      } else {
        speak(`I couldn't find a request with number ${requestNumber}.`);
      }
    }
    else {
      speak('I didn\'t understand that command. Say "help" to hear available commands.');
    }
  };

  const startListening = () => {
    setIsListening(true);
    setTranscript('Listening...');
    
    // Simulate voice recognition
    setTimeout(() => {
      const sampleCommands = [
        'How many requests are open?',
        'Show me statistics',
        'What are the recent requests?',
        'Status of request 25-10001',
        'Help'
      ];
      const randomCommand = sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
      setTranscript(randomCommand);
      setIsListening(false);
      processVoiceCommand(randomCommand);
    }, 2000);
  };

  const stopListening = () => {
    setIsListening(false);
    setTranscript('');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Mic className="text-purple-600" />
                Voice Mode
              </h1>
              <p className="text-gray-600 mt-1">Hands-free access to customer service data</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Data Loaded</div>
              <div className="text-2xl font-bold text-purple-600">{requests.length}</div>
              <div className="text-xs text-gray-500">service requests</div>
            </div>
          </div>
        </div>

        {/* Voice Control Panel */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center">
            {/* Microphone Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isSpeaking}
              className={`mx-auto w-32 h-32 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : isSpeaking
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 hover:scale-110'
              }`}
            >
              {isListening ? (
                <MicOff className="w-16 h-16 text-white" />
              ) : (
                <Mic className="w-16 h-16 text-white" />
              )}
            </button>

            {/* Status Text */}
            <div className="mt-6">
              {isListening && (
                <div className="text-red-600 font-bold text-xl animate-pulse">
                  🎤 Listening...
                </div>
              )}
              {isSpeaking && (
                <div className="text-blue-600 font-bold text-xl flex items-center justify-center gap-2">
                  <Volume2 className="animate-bounce" />
                  Speaking...
                </div>
              )}
              {!isListening && !isSpeaking && (
                <div className="text-gray-600 text-lg">
                  Click the microphone to start
                </div>
              )}
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-2">You said:</div>
                <div className="text-lg font-medium text-gray-800">{transcript}</div>
              </div>
            )}

            {/* Response */}
            {response && (
              <div className="mt-4 bg-purple-50 rounded-lg p-4 border-l-4 border-purple-600">
                <div className="text-sm text-purple-600 mb-2 flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Assistant:
                </div>
                <div className="text-lg text-gray-800">{response}</div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Commands */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Commands</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'How many requests are open?',
              'Show me statistics',
              'What are the recent requests?',
              'List all departments',
              'Status of request 25-10001',
              'Help'
            ].map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => processVoiceCommand(cmd)}
                disabled={isListening || isSpeaking}
                className="px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition border border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-700">{cmd}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation History */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Conversation History</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No conversation yet. Start by clicking the microphone or a quick command.
              </div>
            ) : (
              history.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${
                    item.type === 'user'
                      ? 'bg-purple-50 border-l-4 border-purple-600'
                      : 'bg-blue-50 border-l-4 border-blue-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      {item.type === 'user' ? '🎤 You' : '🔊 Assistant'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>
                  <div className="text-gray-800">{item.text}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div className="text-sm text-gray-700">
              <strong>Note:</strong> This is a simulated voice interface for demonstration.
              In production, this would integrate with Web Speech API for real voice recognition.
              Click the microphone or use quick commands to interact with the system.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceMode;