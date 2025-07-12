'use client';

import { motion } from 'framer-motion';
import { QuestionCard } from '@/components/QuestionCard';
import { TagFilter } from '@/components/TagFilter';
import { questionsApi } from '@/lib/api';

import React, { useState, useRef, useEffect } from 'react';

interface Question {
  _id: string;
  title: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  accepted_answer_id: string | null;
}

const allTags = ['React', 'JavaScript', 'Node.js', 'JWT', 'Authentication', 'Security', 'Database', 'PostgreSQL', 'Schema Design', 'Hooks'];

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'unanswered'>('newest');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
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
    author: 'User', // We'd need to fetch user data separately
    authorAvatar: 'U',
    createdAt: new Date(q.created_at).toLocaleDateString(),
    tags: [], // Backend doesn't have tags yet, you might want to add this
    upvotes: 0, // Backend doesn't track votes on questions
    answers: 0, // Would need to count answers
    hasAcceptedAnswer: !!q.accepted_answer_id,
  }));

  const filteredQuestions = transformedQuestions.filter((question) =>
    selectedTags.length === 0 || question.tags.some((tag) => selectedTags.includes(tag))
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchQuestions}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Questions</h1>
        <p className="text-gray-600">Discover and share knowledge with the community</p>
      </motion.div>

      {/* Main Layout */}
      <div className="flex gap-8">
        {/* Sidebar - Tag Filter */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-64 shrink-0"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Filter by Tags</h2>
            <TagFilter
              tags={allTags}
              selectedTags={selectedTags}
              onTagToggle={(tag) =>
                setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
              }
            />
          </div>
        </motion.aside>

        {/* Main - Questions */}
        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                {(['newest', 'popular', 'unanswered'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                      sortBy === option ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>

          {/* Question List */}
          <div className="space-y-4">
            {filteredQuestions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <QuestionCard question={question} />
              </motion.div>
            ))}
          </div>

          {filteredQuestions.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600">Try adjusting your filters or be the first to ask a question!</p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-64 shrink-0"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Filter by Tags</h2>
            <TagFilter
              tags={allTags}
              selectedTags={selectedTags}
              onTagToggle={(tag) =>
                setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
              }
            />
          </div>
        </motion.aside>

        {/* Main - Questions */}
        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                {(['newest', 'popular', 'unanswered'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                      sortBy === option ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>

          {/* Question List */}
          <div className="space-y-4">
            {filteredQuestions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <QuestionCard question={question} />
              </motion.div>
            ))}
          </div>

          {filteredQuestions.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600">Try adjusting your filters or be the first to ask a question!</p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
