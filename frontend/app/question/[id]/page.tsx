"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModernTextEditor from "@/components/ModernTextEditor";
import { AnswerCard } from "@/components/AnswerCard";
import { questionsApi, answersApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ShareIcon,
  BookmarkIcon,
  ClockIcon,
  HashtagIcon,
  FireIcon,
  SparklesIcon,
  ArrowLeftIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { 
  ArrowUpIcon as ArrowUpSolidIcon,
  ArrowDownIcon as ArrowDownSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
  HeartIcon 
} from "@heroicons/react/24/solid";

interface QuestionDetailProps {
  params: { id: string };
}

export default function QuestionDetail({ params }: QuestionDetailProps) {
  const { user } = useAuth();
  const [questionData, setQuestionData] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        const result = await questionsApi.getById(params.id);
        if (result.success && result.data) {
          setQuestionData(result.data);
          setVotes((result.data as any).upvotes || 0);
          // Initialize user vote state if the data contains it
          if ((result.data as any).userVote) {
            setUserVote((result.data as any).userVote);
          }
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

    fetchQuestionData();
    fetchAnswers();
  }, [params.id]);

  const fetchAnswersData = async () => {
    try {
      const result = await answersApi.getByQuestionId(params.id);
      if (result.success && result.data) {
        setAnswers(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch answers:', error);
    }
  };

  const handleVote = async (direction: 'up' | 'down') => {
    if (isVoting || !user) return;
    
    setIsVoting(true);
    try {
      const result = await questionsApi.vote(params.id, direction);
      if (result.success) {
        if (userVote === direction) {
          setVotes(prev => direction === 'up' ? prev - 1 : prev + 1);
          setUserVote(null);
        } else {
          if (userVote) {
            setVotes(prev => direction === 'up' ? prev + 2 : prev - 2);
          } else {
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
          title: questionData.title,
          text: questionData.description.substring(0, 100) + '...',
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

  const stripHtml = (html: string) => {
    if (typeof window === 'undefined') {
      return html.replace(/<[^>]*>/g, '').trim();
    }
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const isAnswerEmpty = !stripHtml(newAnswer).trim();

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to post an answer');
      return;
    }
    
    const answerText = stripHtml(newAnswer).trim();
    
    if (!answerText) return;

    setIsSubmitting(true);
    
    try {
      const result = await answersApi.create(params.id, { content: newAnswer });
      
      if (result.success) {
        alert("Answer posted successfully!");
        setNewAnswer("");
        fetchAnswersData();
      } else {
        alert(result.error || "Failed to post answer. Please try again.");
      }
    } catch (error) {
      alert("Failed to post answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="space-y-6">
          {/* Skeleton for question */}
          <div className="card p-8">
            <div className="flex gap-6">
              <div className="flex flex-col items-center space-y-3 shrink-0">
                <div className="skeleton w-12 h-8 rounded-lg"></div>
                <div className="skeleton w-8 h-8 rounded-full"></div>
                <div className="skeleton w-12 h-8 rounded-lg"></div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="skeleton w-3/4 h-8"></div>
                <div className="skeleton w-full h-20"></div>
                <div className="flex gap-2">
                  <div className="skeleton w-16 h-6 rounded-full"></div>
                  <div className="skeleton w-20 h-6 rounded-full"></div>
                  <div className="skeleton w-18 h-6 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !questionData) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 text-red-500">
            <ExclamationTriangleIcon />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Question not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The question you\'re looking for doesn\'t exist or has been removed.'}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.history.back()}
              className="btn btn-secondary"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Go Back
            </button>
            <Link href="/" className="btn btn-primary">
              Browse Questions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isHot = votes > 10 || answers.length > 5;
  const isNew = new Date().getTime() - new Date(questionData.created_at).getTime() < 24 * 60 * 60 * 1000;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"
      >
        <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Questions
        </Link>
        <span>/</span>
        <span className="truncate max-w-md">{questionData.title}</span>
      </motion.nav>

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card group relative overflow-hidden"
      >
        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        
        <div className="relative z-10 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Voting - Desktop */}
            <div className="hidden lg:flex flex-col items-center space-y-3 shrink-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleVote('up')}
                disabled={isVoting || !user}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  userVote === 'up' 
                    ? 'gradient-primary text-white shadow-lg' 
                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                {userVote === 'up' ? (
                  <ArrowUpSolidIcon className="w-6 h-6" />
                ) : (
                  <ArrowUpIcon className="w-6 h-6" />
                )}
              </motion.button>
              
              <motion.span 
                key={votes}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl"
              >
                {votes}
              </motion.span>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleVote('down')}
                disabled={isVoting || !user}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  userVote === 'down' 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
              >
                {userVote === 'down' ? (
                  <ArrowDownSolidIcon className="w-6 h-6" />
                ) : (
                  <ArrowDownIcon className="w-6 h-6" />
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  isBookmarked 
                    ? 'bg-yellow-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                }`}
              >
                {isBookmarked ? (
                  <BookmarkSolidIcon className="w-5 h-5" />
                ) : (
                  <BookmarkIcon className="w-5 h-5" />
                )}
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header with badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {isNew && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
                    <SparklesIcon className="w-4 h-4" />
                    New Question
                  </span>
                )}
                
                {isHot && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-sm font-medium rounded-full">
                    <FireIcon className="w-4 h-4" />
                    Trending
                  </span>
                )}

                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <ClockIcon className="w-4 h-4" />
                  <span>Asked {formatTimeAgo(questionData.created_at)}</span>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <EyeIcon className="w-4 h-4" />
                  <span>{Math.floor(Math.random() * 100) + 50} views</span>
                </div>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
                {questionData.title}
              </h1>
              
              <div 
                className="prose prose-lg max-w-none mb-6 text-gray-700 dark:text-gray-300 prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded"
                dangerouslySetInnerHTML={{ __html: questionData.description }}
              />

              {/* Tags */}
              {questionData.tags && questionData.tags.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {questionData.tags.map((tag: string, index: number) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300 font-medium rounded-xl border border-blue-200 dark:border-blue-800 cursor-pointer hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30 transition-all duration-200"
                    >
                      <HashtagIcon className="w-4 h-4" />
                      {tag}
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Actions and Meta */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                {/* Mobile voting */}
                <div className="flex lg:hidden items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote('up')}
                      disabled={isVoting || !user}
                      className={`p-2 rounded-lg ${
                        userVote === 'up' 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                          : 'text-gray-400 hover:text-blue-600'
                      }`}
                    >
                      <ArrowUpIcon className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-lg">{votes}</span>
                    <button
                      onClick={() => handleVote('down')}
                      disabled={isVoting || !user}
                      className={`p-2 rounded-lg ${
                        userVote === 'down' 
                          ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' 
                          : 'text-gray-400 hover:text-red-600'
                      }`}
                    >
                      <ArrowDownIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`p-2 rounded-lg ${
                      isBookmarked 
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400' 
                        : 'text-gray-400 hover:text-yellow-600'
                    }`}
                  >
                    <BookmarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="btn btn-ghost"
                  >
                    <ShareIcon className="w-4 h-4" />
                    <span>Share</span>
                  </motion.button>
                </div>
                
                {/* Author info */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 gradient-secondary rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold">
                        {questionData.author_avatar || 'U'}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{questionData.author || 'Unknown User'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Asked {formatTimeAgo(questionData.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Answers Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <ChatBubbleLeftIcon className="w-6 h-6 text-blue-600" />
              {answers.length} Answer{answers.length !== 1 ? 's' : ''}
            </h2>
          </div>

          {/* Answer List */}
          <div className="space-y-8">
            <AnimatePresence>
              {answers.map((answer: any, index: number) => (
                <motion.div
                  key={answer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-8 last:pb-0"
                >
                  <AnswerCard answer={{
                    id: answer._id,
                    content: answer.content,
                    author: answer.author || 'Unknown User',
                    authorAvatar: answer.author_avatar || 'U',
                    createdAt: formatTimeAgo(answer.created_at),
                    upvotes: answer.votes || 0,
                    downvotes: 0,
                    votes: answer.votes || 0,
                    isAccepted: answer.is_accepted || false
                  }} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {answers.length === 0 && (
            <div className="text-center py-12">
              <ChatBubbleLeftIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No answers yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Be the first to help solve this question!</p>
            </div>
          )}

          {/* Add Answer Form */}
          {user ? (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Your Answer</h3>
              <form onSubmit={handleSubmitAnswer} className="space-y-6">
                <ModernTextEditor
                  value={newAnswer}
                  onChange={setNewAnswer}
                  placeholder="Write your answer here. Be thorough and explain your reasoning..."
                />
                
                <div className="flex flex-col sm:flex-row justify-end gap-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setNewAnswer("")}
                    className="btn btn-secondary"
                  >
                    Clear
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting || isAnswerEmpty}
                    className={`btn ${
                      isSubmitting || isAnswerEmpty ? 'opacity-50 cursor-not-allowed' : 'btn-primary'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Posting...</span>
                      </div>
                    ) : (
                      "Post Answer"
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          ) : (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8 text-center">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Want to answer?</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Please log in to post an answer</p>
                <button className="btn btn-primary">
                  Log In to Answer
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
