"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BellIcon, UserIcon, PlusIcon } from "@heroicons/react/24/outline";
import { BellIcon as BellSolidIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/contexts/AuthContext";
import { LoginModal } from "@/components/LoginModal";
import { notificationsApi } from "@/lib/api";

interface Notification {
  _id: string;
  user_id: string;
  message: string;
  link: string;
  read: boolean;
  created_at: string;
}

export function Navbar() {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
      // Poll for notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const result = await notificationsApi.getAll();
      if (result.success && result.data) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const result = await notificationsApi.getUnreadCount();
      if (result.success && result.data) {
        setUnreadCount(result.data.unread_count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const result = await notificationsApi.markAllRead();
      if (result.success) {
        setUnreadCount(0);
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">StackIt</span>
          </motion.div>

          
          <div className="flex-1 max-w-xl mx-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <input
                type="text"
                placeholder="Search questions..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </motion.div>
          </div>

          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-4"
          >
            {user ? (
              <>
                
                <motion.a
                  href="/ask"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Ask Question</span>
                </motion.a>

                
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    {unreadCount > 0 ? (
                      <BellSolidIcon className="w-6 h-6 text-blue-600" />
                    ) : (
                      <BellIcon className="w-6 h-6" />
                    )}
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </motion.button>

                  
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification._id}
                            whileHover={{ backgroundColor: "#f9fafb" }}
                            onClick={() => {
                              // Navigate to notification link
                              if (notification.link) {
                                window.location.href = notification.link;
                              }
                            }}
                            className={`px-4 py-3 cursor-pointer border-l-4 ${
                              notification.read 
                                ? "border-transparent" 
                                : "border-blue-500 bg-blue-50"
                            }`}
                          >
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </motion.div>
                        ))}
                        {notifications.length === 0 && (
                          <div className="px-4 py-3 text-center text-gray-500">
                            No notifications yet
                          </div>
                        )}
                        {unreadCount > 0 && (
                          <div className="px-4 py-2 border-t border-gray-100">
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              Mark all as read
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                
                <div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.avatar}
                      </span>
                    </div>
                  </motion.button>
                  
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setLoginMode('login');
                    setShowLoginModal(true);
                  }}
                  className="text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors duration-200"
                >
                  Log In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setLoginMode('signup');
                    setShowLoginModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Sign Up
                </motion.button>
              </>
            )}
          </motion.div>
        </div>
      </div>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        initialMode={loginMode}
      />
    </nav>
  );
}
