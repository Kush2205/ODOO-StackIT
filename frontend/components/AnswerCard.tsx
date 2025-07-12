"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  CheckCircleIcon,
  ShareIcon,
  ClockIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { 
  ArrowUpIcon as ArrowUpSolidIcon,
  ArrowDownIcon as ArrowDownSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon
} from "@heroicons/react/24/solid";
import { answersApi } from "@/lib/api";

interface Answer {
  id: string;
  content: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  votes: number;
  userVote?: 'up' | 'down' | null;
}

interface AnswerCardProps {
  answer: Answer;
}

export function AnswerCard({ answer }: AnswerCardProps) {
  const [votes, setVotes] = useState(answer.votes || 0);
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(answer.userVote || null);

  const handleVote = async (direction: 'up' | 'down') => {
    if (isVoting) return;
    
    setIsVoting(true);
    try {
      const result = await answersApi.vote(answer.id, direction);
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Answer by ${answer.author}`,
          text: answer.content.substring(0, 100) + '...',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className={`card group relative overflow-hidden transition-all duration-300 ${
        answer.isAccepted 
          ? "border-2 border-green-300 dark:border-green-600 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" 
          : ""
      }`}
    >
      {/* Accepted answer badge */}
      {answer.isAccepted && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-bl-xl">
          <div className="flex items-center gap-1 text-sm font-medium">
            <CheckCircleSolidIcon className="w-4 h-4" />
            <span>Accepted</span>
          </div>
        </div>
      )}

      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Vote Section - Desktop */}
          <div className="hidden lg:flex flex-col items-center space-y-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.2, rotateY: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleVote('up')}
              disabled={isVoting}
              className={`p-3 rounded-xl transition-all duration-200 ${
                userVote === 'up' 
                  ? 'gradient-primary text-white shadow-lg' 
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
              }`}
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
              className={`text-xl font-bold px-3 py-1 rounded-lg ${
                votes > 0 
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {votes}
            </motion.span>
            
            <motion.button
              whileHover={{ scale: 1.2, rotateY: -15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleVote('down')}
              disabled={isVoting}
              className={`p-3 rounded-xl transition-all duration-200 ${
                userVote === 'down' 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
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
            {/* Mobile voting */}
            <div className="flex lg:hidden items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote('up')}
                  disabled={isVoting}
                  className={`p-2 rounded-lg ${
                    userVote === 'up' 
                      ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
                      : 'text-gray-400 hover:text-green-600'
                  }`}
                >
                  <ArrowUpIcon className="w-5 h-5" />
                </button>
                <span className="font-bold text-lg">{votes}</span>
                <button
                  onClick={() => handleVote('down')}
                  disabled={isVoting}
                  className={`p-2 rounded-lg ${
                    userVote === 'down' 
                      ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' 
                      : 'text-gray-400 hover:text-red-600'
                  }`}
                >
                  <ArrowDownIcon className="w-5 h-5" />
                </button>
              </div>
              
              {answer.isAccepted && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full text-sm font-medium">
                  <CheckCircleSolidIcon className="w-4 h-4" />
                  <span>Accepted</span>
                </div>
              )}
            </div>
            
            {/* Answer content */}
            <div 
              className="prose prose-lg max-w-none mb-6 text-gray-700 dark:text-gray-300 prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700"
              dangerouslySetInnerHTML={{ __html: answer.content }}
            />

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Actions */}
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="btn btn-ghost text-sm"
                >
                  <ShareIcon className="w-4 h-4" />
                  <span>Share</span>
                </motion.button>

                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                  <ClockIcon className="w-4 h-4" />
                  <span>Answered {answer.createdAt}</span>
                </div>
              </div>
              
              {/* Author info */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 gradient-accent rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold">
                      {answer.authorAvatar}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{answer.author}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {answer.isAccepted ? 'Solution Provider' : 'Contributor'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
