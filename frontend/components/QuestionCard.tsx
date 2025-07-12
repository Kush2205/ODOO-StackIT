"use client";

import { motion } from "framer-motion";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChatBubbleLeftIcon,
  CheckCircleIcon 
} from "@heroicons/react/24/outline";

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
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
    >
      <div className="flex gap-4">
        
        <div className="flex flex-col items-center space-y-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
          >
            <ArrowUpIcon className="w-5 h-5" />
          </motion.button>
          <span className="font-semibold text-gray-900">{question.upvotes}</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
          >
            <ArrowDownIcon className="w-5 h-5" />
          </motion.button>
        </div>

        
        <div className="flex-1">
          
          <motion.a
            href={`/question/${question.id}`}
            whileHover={{ color: "#2563eb" }}
            className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer transition-colors duration-200 block"
          >
            {question.title}
          </motion.a>

          
          <p className="text-gray-600 mb-4 line-clamp-2">
            {question.description}
          </p>

          
          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map((tag) => (
              <motion.span
                key={tag}
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full cursor-pointer hover:bg-blue-200 transition-colors duration-200"
              >
                {tag}
              </motion.span>
            ))}
          </div>

          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>{question.answers} answer{question.answers !== 1 ? 's' : ''}</span>
                {question.hasAcceptedAnswer && (
                  <CheckCircleIcon className="w-4 h-4 text-green-500 ml-1" />
                )}
              </div>
            </div>

            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {question.authorAvatar}
                </span>
              </div>
              <div className="text-sm">
                <p className="text-gray-900 font-medium">{question.author}</p>
                <p className="text-gray-500">{question.createdAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
