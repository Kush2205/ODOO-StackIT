"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ModernTextEditor from "@/components/ModernTextEditor";
import { Ans            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(questionData.tags || []).map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>rom "@/components/AnswerCard";
import { questionsApi, answersApi } from "@/lib/api";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ShareIcon,
  BookmarkIcon
} from "@heroicons/react/24/outline";

interface QuestionDetailProps {
  params: { id: string };
}

export default function QuestionDetail({ params }: QuestionDetailProps) {
  const [questionData, setQuestionData] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestionData();
    fetchAnswers();
  }, [params.id]);

  const fetchQuestionData = async () => {
    try {
      const result = await questionsApi.getById(params.id);
      if (result.success && result.data) {
        setQuestionData(result.data);
      } else {
        setError(result.error || 'Question not found');
      }
    } catch (error) {
      setError('Failed to fetch question');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async () => {
    try {
      const result = await answersApi.getByQuestionId(params.id);
      if (result.success && result.data) {
        setAnswers(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch answers:', error);
    }
  };

  const stripHtml = (html: string) => {
    if (typeof window === 'undefined') {
      // Server-side: basic HTML tag removal
      return html.replace(/<[^>]*>/g, '').trim();
    }
    // Client-side: proper DOM parsing
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const isAnswerEmpty = !stripHtml(newAnswer).trim();

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const answerText = stripHtml(newAnswer).trim();
    
    if (!answerText) return;

    setIsSubmitting(true);
    
    try {
      const result = await answersApi.create(params.id, { content: newAnswer });
      
      if (result.success) {
        alert("Answer posted successfully!");
        setNewAnswer("");
        fetchAnswers(); // Refresh answers
      } else {
        alert(result.error || "Failed to post answer. Please try again.");
      }
    } catch (error) {
      alert("Failed to post answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  if (error || !questionData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Question not found'}</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
          <ModernTextEditor
            value={newAnswer}
            onChange={setNewAnswer}
            placeholder="Share your knowledge and help the community..."
          />
          
          <div className="flex justify-end">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting || isAnswerEmpty}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isSubmitting || isAnswerEmpty
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
