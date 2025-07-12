'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { QuestionCard } from '@/components/QuestionCard';
import { TagFilter } from '@/components/TagFilter';
import { questionsApi } from '@/lib/api';
import { 
  SparklesIcon, 
  FireIcon, 
  ChatBubbleLeftIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

import React, { useState, useEffect } from 'react';

interface Question {
  _id: string;
  title: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  accepted_answer_id: string | null;
  author: string;
  author_avatar: string;
  answer_count: number;
  tags: string[];
  votes: number;
}

const allTags = ['React', 'JavaScript', 'Node.js', 'JWT', 'Authentication', 'Security', 'Database', 'PostgreSQL', 'Schema Design', 'Hooks'];

const sortOptions = [
  { key: 'newest', label: 'Newest', icon: SparklesIcon },
  { key: 'popular', label: 'Popular', icon: FireIcon },
  { key: 'unanswered', label: 'Unanswered', icon: ChatBubbleLeftIcon },
] as const;

export default function Home() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'unanswered'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await questionsApi.getAll();
      
      if (result.success && result.data) {
        setQuestions(result.data);
      } else {
        setError(result.error || 'Failed to fetch questions');
      }
    } catch (error) {
      setError('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  // Transform backend questions to match frontend interface
  const transformedQuestions = questions.map(q => ({
    id: q._id,
    title: q.title,
    description: q.description,
    author: q.author || 'Unknown User',
    authorAvatar: q.author_avatar || 'U',
    createdAt: new Date(q.created_at).toLocaleDateString(),
    tags: q.tags || [],
    upvotes: q.votes || 0,
    answers: q.answer_count || 0,
    hasAcceptedAnswer: !!q.accepted_answer_id,
  }));

  // Filter and search questions
  const filteredQuestions = transformedQuestions.filter((question) => {
    const matchesTags = selectedTags.length === 0 || question.tags.some((tag) => selectedTags.includes(tag));
    const matchesSearch = searchQuery === '' || 
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTags && matchesSearch;
  });

  // Sort questions
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.upvotes - a.upvotes;
      case 'unanswered':
        return a.answers - b.answers;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-20">
          <div className="skeleton w-16 h-16 rounded-full mx-auto mb-4"></div>
          <div className="skeleton w-48 h-6 mx-auto mb-2"></div>
          <div className="skeleton w-32 h-4 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-6 text-red-500">
            <ExclamationTriangleIcon />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={fetchQuestions}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-8 lg:mb-12"
      >
        <div className="gradient-mesh rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden">
          <div className="relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4"
            >
              Welcome to StackIt
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg lg:text-xl text-gray-700 mb-8 max-w-2xl mx-auto"
            >
              Discover, share, and grow your knowledge with our vibrant community of developers and learners.
            </motion.p>
            
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/ask" className="btn btn-primary text-lg px-8 py-3">
                  Ask Your First Question
                </Link>
                <button className="btn btn-secondary text-lg px-8 py-3">
                  Join the Community
                </button>
              </motion.div>
            )}
          </div>
          
          {/* Floating elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-500/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </motion.div>

      {/* Search and Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6 mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions, tags, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="font-bold text-xl gradient-primary bg-clip-text text-transparent">{questions.length}</div>
              <div className="text-gray-500 dark:text-gray-400">Questions</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl gradient-secondary bg-clip-text text-transparent">
                {questions.reduce((acc, q) => acc + q.answer_count, 0)}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Answers</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl gradient-accent bg-clip-text text-transparent">
                {new Set(questions.map(q => q.user_id)).size}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Contributors</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary w-full justify-center mb-4"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <span>Filters & Tags</span>
          </button>
        </div>

        {/* Sidebar - Filters */}
        <AnimatePresence>
          {(showFilters || window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full lg:w-80 shrink-0"
            >
              <div className="space-y-6">
                {/* Sort Options */}
                <div className="card p-6">
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <AdjustmentsHorizontalIcon className="w-5 h-5" />
                    Sort by
                  </h2>
                  <div className="space-y-2">
                    {sortOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.key}
                          onClick={() => setSortBy(option.key)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            sortBy === option.key 
                              ? 'gradient-primary text-white shadow-md' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tag Filter */}
                <div className="card p-6">
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Filter by Tags</h2>
                  <TagFilter
                    tags={allTags}
                    selectedTags={selectedTags}
                    onTagToggle={(tag) =>
                      setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
                    }
                  />
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Results Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {searchQuery || selectedTags.length > 0 ? 'Search Results' : 'All Questions'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {sortedQuestions.length} question{sortedQuestions.length !== 1 ? 's' : ''} found
                  {selectedTags.length > 0 && (
                    <span> • Filtered by {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''}</span>
                  )}
                </p>
              </div>
              
              {user && (
                <Link href="/ask" className="btn btn-primary">
                  Ask Question
                </Link>
              )}
            </div>
          </motion.div>

          {/* Question List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {sortedQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    delay: Math.min(index * 0.05, 0.5),
                    layout: { duration: 0.3 }
                  }}
                >
                  <QuestionCard question={question} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {sortedQuestions.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="card p-12 text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 text-gray-300 dark:text-gray-600">
                <MagnifyingGlassIcon />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery || selectedTags.length > 0 ? 'No questions found' : 'No questions yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {searchQuery || selectedTags.length > 0 
                  ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                  : 'Be the first to ask a question and start the conversation!'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {(searchQuery || selectedTags.length > 0) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTags([]);
                    }}
                    className="btn btn-secondary"
                  >
                    Clear filters
                  </button>
                )}
                {user && (
                  <Link href="/ask" className="btn btn-primary">
                    Ask the first question
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
