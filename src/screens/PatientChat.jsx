import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/helpers';

// Mock chat history
const initialMessages = [
  {
    id: '1',
    sender: 'clinic',
    senderName: 'Treatment Coordinator',
    message: 'Hello! How can I help you today?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    sender: 'patient',
    senderName: 'You',
    message: 'I have a question about my payment plan.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    sender: 'clinic',
    senderName: 'Treatment Coordinator',
    message: 'Of course! What would you like to know?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
  },
];

// Mock AI responses based on keywords
const getClinicResponse = (patientMessage) => {
  const message = patientMessage.toLowerCase();
  
  if (message.includes('payment') || message.includes('pay') || message.includes('cost')) {
    return "I'd be happy to help with payment questions. You can view your payment plan details in the Payment section. Would you like me to explain any specific part of your payment plan?";
  }
  if (message.includes('appointment') || message.includes('schedule') || message.includes('visit')) {
    return "To schedule an appointment, please call our office at (555) 123-4567 or reply with your preferred dates and times, and I'll help coordinate with our scheduling team.";
  }
  if (message.includes('treatment') || message.includes('braces') || message.includes('invisalign')) {
    return "Great question! Your treatment plan details are available in your Dashboard. If you have specific questions about the treatment process, I can connect you with our clinical team.";
  }
  if (message.includes('insurance') || message.includes('coverage')) {
    return "For insurance questions, please provide your insurance information and I can help check your coverage. You can also update your insurance details in your account settings.";
  }
  if (message.includes('hello') || message.includes('hi') || message.includes('help')) {
    return "Hello! I'm here to help. You can ask me about your treatment plan, payments, appointments, or any other questions you have.";
  }
  if (message.includes('thank') || message.includes('thanks')) {
    return "You're welcome! Is there anything else I can help you with today?";
  }
  
  return "Thank you for your message. I'll review your question and get back to you shortly. In the meantime, you can find most information in your Dashboard or Payment sections.";
};

export default function PatientChat() {
  const { state } = useApp();
  const [messages, setMessages] = useState(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: 'patient',
      senderName: 'You',
      message: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate clinic response after a delay
    setTimeout(() => {
      const clinicResponse = {
        id: (Date.now() + 1).toString(),
        sender: 'clinic',
        senderName: 'Treatment Coordinator',
        message: getClinicResponse(inputMessage),
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, clinicResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return formatDate(timestamp);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                TC
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Treatment Coordinator</h2>
                <p className="text-sm text-gray-600">Band & Wire Orthodontics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg ${
                  msg.sender === 'patient'
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <div className="text-xs font-medium mb-1 opacity-75">
                  {msg.senderName}
                </div>
                <div className="text-sm whitespace-pre-wrap break-words">
                  {msg.message}
                </div>
                <div className={`text-xs mt-2 ${msg.sender === 'patient' ? 'text-teal-100' : 'text-gray-500'}`}>
                  {formatMessageTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                rows={2}
              />
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Your messages are secure and will be reviewed by our team during business hours.
          </p>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Questions</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'Payment questions',
            'Schedule appointment',
            'Treatment information',
            'Insurance coverage',
          ].map((question) => (
            <button
              key={question}
              onClick={() => {
                setInputMessage(question);
                inputRef.current?.focus();
              }}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

