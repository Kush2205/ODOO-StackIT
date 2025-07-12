'use client';

import { motion } from 'framer-motion';
import { QuestionCard } from '@/components/QuestionCard';
import { TagFilter } from '@/components/TagFilter';
import dynamic from 'next/dynamic';
import React, { useState, useRef } from 'react';

// 🔁 Changed RichTextEditor → ModernTextEditor
const ModernTextEditor = dynamic(() => import('../components/ModernTextEditor'), { ssr: false });

type ModernTextEditorHandle = {
  getContent: () => string;
};

const mockQuestions = [
  {
    id: '1',
    title: 'How to use React hooks effectively?',
    description: 'I\'m learning React and wondering about the best practices for using hooks like useState and useEffect.',
    author: 'John Doe',
    authorAvatar: 'JD',
    createdAt: '2 hours ago',
    tags: ['React', 'JavaScript', 'Hooks'],
    upvotes: 15,
    answers: 3,
    hasAcceptedAnswer: true,
  },
  {
    id: '2',
    title: 'Best practices for JWT authentication in Node.js',
    description: 'What are the security considerations when implementing JWT authentication in a Node.js application?',
    author: 'Jane Smith',
    authorAvatar: 'JS',
    createdAt: '5 hours ago',
    tags: ['Node.js', 'JWT', 'Authentication', 'Security'],
    upvotes: 8,
    answers: 1,
    hasAcceptedAnswer: false,
  },
  {
    id: '3',
    title: 'Database design for a social media application',
    description: 'I\'m building a social media app and need advice on database schema design for user relationships and posts.',
    author: 'Mike Johnson',
    authorAvatar: 'MJ',
    createdAt: '1 day ago',
    tags: ['Database', 'PostgreSQL', 'Schema Design'],
    upvotes: 23,
    answers: 7,
    hasAcceptedAnswer: true,
  },
];

const allTags = ['React', 'JavaScript', 'Node.js', 'JWT', 'Authentication', 'Security', 'Database', 'PostgreSQL', 'Schema Design', 'Hooks'];

export default function Home() {
  const editorRef = useRef<ModernTextEditorHandle>(null);
  const [editorContent, setEditorContent] = useState('');
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState(mockQuestions);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'unanswered'>('newest');

  const handlePostQuestion = () => {
    if (!title.trim()) return alert('Please enter a title');
    const content = editorRef.current?.getContent();
    if (!content || content.trim() === '<p><br></p>') return alert('Please enter content');

    const newQuestion = {
      id: (questions.length + 1).toString(),
      title: title.trim(),
      description: content,
      author: 'You',
      authorAvatar: 'U',
      createdAt: 'Just now',
      tags: [],
      upvotes: 0,
      answers: 0,
      hasAcceptedAnswer: false,
    };

    setQuestions([newQuestion, ...questions]);
    setTitle('');
    setEditorContent('');
  };

  const filteredQuestions = questions.filter((question) =>
    selectedTags.length === 0 || question.tags.some((tag) => selectedTags.includes(tag))
  );

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Questions</h1>
        <p className="text-gray-600">Discover and share knowledge with the community</p>
      </motion.div>

      {/* ➕ Create Question Box */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Ask a Question</h2>
        <input
          type="text"
          placeholder="Enter your question title"
          className="w-full border rounded px-4 py-2 mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="mb-4">
          {/* 🔁 Using ModernTextEditor instead of RichTextEditor */}
          <ModernTextEditor ref={editorRef} />
        </div>
        <button
          onClick={handlePostQuestion}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Post Question
        </button>
      </div>

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
