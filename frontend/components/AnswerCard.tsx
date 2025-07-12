"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  CheckCircleIcon,
  ShareIcon 
} from "@heroicons/react/24/outline";
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
}

interface AnswerCardProps {
  answer: Answer;
}

export function AnswerCard({ answer }: AnswerCardProps) {
  const [votes, setVotes] = useState(answer.votes || 0);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (direction: 'up' | 'down') => {
    if (isVoting) return;
    
    setIsVoting(true);
    try {
      const result = await answersApi.vote(answer.id, direction);
      if (result.success) {
        // Update vote count optimistically
        setVotes(prev => direction === 'up' ? prev + 1 : prev - 1);
      } else {
        alert(result.error || 'Failed to vote');
      }
    } catch (error) {
      alert('Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -1 }}
      className={`bg-white rounded-lg border-2 p-6 transition-all duration-200 ${
        answer.isAccepted 
          ? "border-green-200 bg-green-50" 
          : "border-gray-200 hover:shadow-md"
      }`}
    >
      <div className="flex gap-6">
        {/* Vote Section */}
        <div className="flex flex-col items-center space-y-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200"
            onClick={() => handleVote('up')}
            disabled={isVoting}
          >
            <ArrowUpIcon className="w-5 h-5" />
          </motion.button>
          <span className="font-semibold text-gray-900">
            {votes}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
            onClick={() => handleVote('down')}
            disabled={isVoting}
          >
            <ArrowDownIcon className="w-5 h-5" />
          </motion.button>
          
          {answer.isAccepted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-2"
            >
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </motion.div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1">
          {answer.isAccepted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 mb-4 text-green-700"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Accepted Answer</span>
            </motion.div>
          )}
          
          <div 
            className="prose max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: answer.content }}
          />

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <ShareIcon className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </motion.button>
              <span className="text-sm text-gray-500">
                Answered {answer.createdAt}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {answer.authorAvatar}
                </span>
              </div>
              <div className="text-sm">
                <p className="text-gray-900 font-medium">{answer.author}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
