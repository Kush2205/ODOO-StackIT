"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { AnswerCard } from "@/components/AnswerCard";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ShareIcon,
  BookmarkIcon
} from "@heroicons/react/24/outline";

const questionData = {
  id: "1",
  title: "How to use React hooks effectively?",
  description: `<p>I'm learning React and wondering about the best practices for using hooks like useState and useEffect.</p>
  <p>I've been working on a project where I need to:</p>
  <ul>
    <li>Manage component state</li>
    <li>Handle side effects</li>
    <li>Optimize performance</li>
  </ul>
  <p>What are some common patterns and anti-patterns I should be aware of?</p>`,
  author: "John Doe",
  authorAvatar: "JD",
  createdAt: "2 hours ago",
  tags: ["React", "JavaScript", "Hooks"],
  upvotes: 15,
  downvotes: 2,
  answers: 3,
  hasAcceptedAnswer: true,
  views: 142
};

const mockAnswers = [
  {
    id: "1",
    content: `<p>Great question! Here are some key best practices for React hooks:</p>
    <h3><strong>1. useState Best Practices:</strong></h3>
    <ul>
      <li>Keep state as simple as possible</li>
      <li>Use functional updates when state depends on previous state</li>
      <li>Split unrelated state into separate useState calls</li>
    </ul>
    <pre><code>// Good
const [count, setCount] = useState(0);
const [name, setName] = useState('');

// Better for related updates
setCount(prevCount => prevCount + 1);</code></pre>`,
    author: "Sarah Wilson",
    authorAvatar: "SW",
    createdAt: "1 hour ago",
    upvotes: 12,
    downvotes: 0,
    isAccepted: true
  },
  {
    id: "2",
    content: `<p>I'd also add some important points about useEffect:</p>
    <ul>
      <li>Always include dependencies in the dependency array</li>
      <li>Use cleanup functions to prevent memory leaks</li>
      <li>Consider using custom hooks for complex logic</li>
    </ul>
    <p>Hope this helps! 🚀</p>`,
    author: "Mike Chen",
    authorAvatar: "MC",
    createdAt: "45 minutes ago",
    upvotes: 8,
    downvotes: 1,
    isAccepted: false
  }
];

export default function QuestionDetail() {
  const [newAnswer, setNewAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    alert("Answer posted successfully!");
    setNewAnswer("");
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-8"
      >
        
        <div className="flex gap-6">
          
          <div className="flex flex-col items-center space-y-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200"
            >
              <ArrowUpIcon className="w-6 h-6" />
            </motion.button>
            <span className="text-xl font-bold text-gray-900">
              {questionData.upvotes - questionData.downvotes}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
            >
              <ArrowDownIcon className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
            >
              <BookmarkIcon className="w-5 h-5" />
            </motion.button>
          </div>

          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {questionData.title}
            </h1>
            
            <div 
              className="prose max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: questionData.description }}
            />

            
            <div className="flex flex-wrap gap-2 mb-6">
              {questionData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{questionData.views} views</span>
                <span>•</span>
                <span>Asked {questionData.createdAt}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <ShareIcon className="w-4 h-4" />
                  <span className="text-sm">Share</span>
                </motion.button>
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {questionData.authorAvatar}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-900 font-medium">{questionData.author}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-xl font-bold text-gray-900">
          {mockAnswers.length} Answer{mockAnswers.length !== 1 ? 's' : ''}
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <CheckCircleIcon className="w-4 h-4 text-green-500" />
          <span>Accepted answer available</span>
        </div>
      </motion.div>

      
      <div className="space-y-6">
        {mockAnswers.map((answer, index) => (
          <motion.div
            key={answer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 2) }}
          >
            <AnswerCard answer={answer} />
          </motion.div>
        ))}
      </div>

      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200 p-8"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Answer
        </h3>
        
        <form onSubmit={handleSubmitAnswer} className="space-y-4">
          <textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Share your knowledge and help the community..."
            className="w-full min-h-[200px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-y"
          />
          
          <div className="flex justify-end">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting || !newAnswer.trim()}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isSubmitting || !newAnswer.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Posting...</span>
                </div>
              ) : (
                "Post Your Answer"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
