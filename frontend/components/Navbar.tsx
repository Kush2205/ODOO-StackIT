"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BellIcon, 
  UserIcon, 
  PlusIcon, 
  SunIcon, 
  MoonIcon,
  Bars3Icon,
  XMarkIcon 
} from "@heroicons/react/24/outline";
import { BellIcon as BellSolidIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthModal } from "@/components/AuthModal";
import { notificationsApi } from "@/lib/api";
import Link from "next/link";

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
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      window.location.href = notification.link;
    }
    setShowNotifications(false);
  };

  return (
    <nav className="card sticky top-0 z-50 border-b backdrop-blur-md bg-white/90 dark:bg-gray-900/90">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg lg:text-xl">S</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  StackIt
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Q&A Platform</p>
              </div>
            </Link>
          </motion.div>

          {/* Search Bar - Hidden on mobile */}
          <div className="flex-1 max-w-xl mx-4 lg:mx-8 hidden md:block">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <input
                type="text"
                placeholder="Search questions..."
                className="w-full px-4 py-2.5 pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </motion.div>
          </div>

          {/* Desktop Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:flex items-center space-x-4"
          >
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="btn-ghost p-2 rounded-xl"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </motion.button>

            {user ? (
              <>
                {/* Ask Question Button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/ask" className="btn btn-primary">
                    <PlusIcon className="w-4 h-4" />
                    <span>Ask Question</span>
                  </Link>
                </motion.div>

                {/* Notifications */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="btn-ghost p-2 rounded-xl relative"
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
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </motion.button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 card-elevated border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                            {unreadCount > 0 && (
                              <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Mark all read
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                          {notifications.map((notification, index) => (
                            <motion.div
                              key={notification._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ backgroundColor: "var(--hover-overlay)" }}
                              onClick={() => handleNotificationClick(notification)}
                              className={`px-4 py-3 cursor-pointer border-l-4 transition-colors ${
                                notification.read 
                                  ? "border-transparent" 
                                  : "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                              }`}
                            >
                              <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </motion.div>
                          ))}
                          {notifications.length === 0 && (
                            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                              <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>No notifications yet</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Menu */}
                <div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center space-x-2 p-1 rounded-xl transition-colors duration-200"
                  >
                    <div className="w-8 h-8 gradient-secondary rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-medium">
                        {user.avatar}
                      </span>
                    </div>
                  </motion.button>
                  
                  {/* User Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 card-elevated border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
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
                  className="btn btn-ghost"
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
                  className="btn btn-primary"
                >
                  Sign Up
                </motion.button>
              </>
            )}
          </motion.div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Theme Toggle for Mobile */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="btn-ghost p-2 rounded-xl"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="btn-ghost p-2 rounded-xl"
              aria-label="Toggle mobile menu"
            >
              {showMobileMenu ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4"
            >
              {/* Mobile Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search questions..."
                  className="w-full px-4 py-2.5 pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {user ? (
                <div className="space-y-3">
                  <Link 
                    href="/ask" 
                    className="btn btn-primary w-full justify-center"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Ask Question</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowMobileMenu(false);
                    }}
                    className="btn btn-secondary w-full justify-center relative"
                  >
                    <BellIcon className="w-4 h-4" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 gradient-secondary rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.avatar}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="btn btn-ghost text-red-600 dark:text-red-400"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setLoginMode('login');
                      setShowLoginModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="btn btn-secondary w-full justify-center"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setLoginMode('signup');
                      setShowLoginModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="btn btn-primary w-full justify-center"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AuthModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        initialMode={loginMode}
      />
    </nav>
  );
}
