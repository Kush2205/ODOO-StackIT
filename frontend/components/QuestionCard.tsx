"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  HashtagIcon,
  FireIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { 
  ArrowUpIcon as ArrowUpSolidIcon,
  ArrowDownIcon as ArrowDownSolidIcon,
  HeartIcon
} from "@heroicons/react/24/solid";
import { questionsApi } from "@/lib/api";

interface Question {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
  tags: string[];
  upvotes: number;
  answers: number;
  hasAcceptedAnswer: boolean;
}

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const [votes, setVotes] = useState(question.upvotes);
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const handleVote = async (direction: 'up' | 'down') => {
    if (isVoting) return;
    
    setIsVoting(true);
    try {
      const result = await questionsApi.vote(question.id, direction);
      if (result.success) {
        // Update vote count and user vote state
        if (userVote === direction) {
          // Remove vote
          setVotes(prev => direction === 'up' ? prev - 1 : prev + 1);
          setUserVote(null);
        } else {
          // Add or change vote
          if (userVote) {
            // Changing vote
            setVotes(prev => direction === 'up' ? prev + 2 : prev - 2);
          } else {
            // New vote
            setVotes(prev => direction === 'up' ? prev + 1 : prev - 1);
          }
          setUserVote(direction);
        }
      } else {
        alert(result.error || 'Failed to vote');
      }
    } catch (error) {
      alert('Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  // Strip HTML tags for preview but preserve some formatting
  const getPlainText = (html: string) => {
    if (typeof window === 'undefined') {
      return html.replace(/<[^>]*>/g, '').trim();
    }
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const isHot = votes > 10 || question.answers > 5;
  const isNew = new Date().getTime() - new Date(question.createdAt).getTime() < 24 * 60 * 60 * 1000;

  return (
    <motion.div
      layout
      whileHover={{ y: -3, scale: 1.01 }}
      className="card group relative overflow-hidden"
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 p-6">
        <div className="flex gap-6">
          {/* Vote Section */}
          <div className="flex flex-col items-center space-y-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.2, rotateY: 15 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-xl transition-all duration-200 ${
                userVote === 'up' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
              onClick={() => handleVote('up')}
              disabled={isVoting}
            >
              {userVote === 'up' ? (
                <ArrowUpSolidIcon className="w-5 h-5" />
              ) : (
                <ArrowUpIcon className="w-5 h-5" />
              )}
            </motion.button>
            
            <motion.span 
              key={votes}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={`font-bold text-lg px-3 py-1 rounded-lg ${
                votes > 0 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {votes}
            </motion.span>
            
            <motion.button
              whileHover={{ scale: 1.2, rotateY: -15 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-xl transition-all duration-200 ${
                userVote === 'down' 
                  ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' 
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
              onClick={() => handleVote('down')}
              disabled={isVoting}
            >
              {userVote === 'down' ? (
                <ArrowDownSolidIcon className="w-5 h-5" />
              ) : (
                <ArrowDownIcon className="w-5 h-5" />
              )}
            </motion.button>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            {/* Header with badges */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {isNew && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full"
                  >
                    <SparklesIcon className="w-3 h-3" />
                    New
                  </motion.span>
                )}
                
                {isHot && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs font-medium rounded-full"
                  >
                    <FireIcon className="w-3 h-3" />
                    Hot
                  </motion.span>
                )}

                {question.hasAcceptedAnswer && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full"
                  >
                    <CheckCircleIcon className="w-3 h-3" />
                    Solved
                  </motion.span>
                )}
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <ClockIcon className="w-3 h-3" />
                <span>{formatTimeAgo(question.createdAt)}</span>
              </div>
            </div>

            {/* Title */}
            <Link 
              href={`/question/${question.id}`}
              className="group/title"
            >
              <motion.h3
                whileHover={{ x: 4 }}
                className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400 transition-colors duration-200 line-clamp-2"
              >
                {question.title}
              </motion.h3>
            </Link>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
              {getPlainText(question.description)}
            </p>

            {/* Tags */}
            {question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.slice(0, 5).map((tag, index) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full border border-blue-200 dark:border-blue-800 cursor-pointer hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30 transition-all duration-200"
                  >
                    <HashtagIcon className="w-3 h-3" />
                    {tag}
                  </motion.span>
                ))}
                
                {question.tags.length > 5 && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm rounded-full">
                    +{question.tags.length - 5} more
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              {/* Stats */}
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-200 ${
                    question.answers > 0 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {question.answers} {question.answers === 1 ? 'answer' : 'answers'}
                  </span>
                </motion.div>

                {votes > 0 && (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg"
                  >
                    <HeartIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{votes}</span>
                  </motion.div>
                )}
              </div>

              {/* Author Info */}
              <Link 
                href={`/user/${question.author}`}
                className="group/author"
              >
                <motion.div 
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3"
                >
                  <div className="relative">
                    <div className="w-10 h-10 gradient-secondary rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">
                        {question.authorAvatar}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 group-hover/author:text-blue-600 dark:group-hover/author:text-blue-400 transition-colors duration-200">
                      {question.author}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      Asked {formatTimeAgo(question.createdAt)}
                    </p>
                  </div>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
