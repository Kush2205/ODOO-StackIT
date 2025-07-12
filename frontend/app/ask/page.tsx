"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ModernTextEditor from "@/components/ModernTextEditor";
import { TagInput } from "@/components/TagInput";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { 
  XMarkIcon, 
  QuestionMarkCircleIcon, 
  LightBulbIcon,
  SparklesIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { questionsApi } from "@/lib/api";

const tips = [
  {
    icon: QuestionMarkCircleIcon,
    title: "Be specific",
    description: "Include details about what you've tried and what isn't working"
  },
  {
    icon: LightBulbIcon,
    title: "Show your code",
    description: "Include relevant code snippets and error messages"
  },
  {
    icon: SparklesIcon,
    title: "Use descriptive titles",
    description: "Make your title clear and searchable for future visitors"
  }
];

export default function AskQuestion() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const stripHtml = (html: string) => {
    if (typeof window === 'undefined') {
      return html.replace(/<[^>]*>/g, '').trim();
    }
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 10) {
      newErrors.title = "Title should be at least 10 characters";
    }

    const descriptionText = stripHtml(description).trim();
    if (!descriptionText) {
      newErrors.description = "Description is required";
    } else if (descriptionText.length < 20) {
      newErrors.description = "Description should be at least 20 characters";
    }

    if (tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    } else if (tags.length > 5) {
      newErrors.tags = "Maximum 5 tags allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please log in to post a question");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await questionsApi.create({
        title: title.trim(),
        description: description,
        tags: tags,
      });

      if (result.success) {
        alert("Question posted successfully!");
        setTitle("");
        setDescription("");
        setTags([]);
        setErrors({});
        window.location.href = '/';
      } else {
        alert(result.error || "Failed to post question. Please try again.");
      }
    } catch (error) {
      alert("Failed to post question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 text-blue-500">
            <ExclamationTriangleIcon />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to ask a question and join the discussion.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="btn btn-secondary">
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Questions
            </Link>
            <button className="btn btn-primary">
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Questions
          </Link>
          <span>/</span>
          <span>Ask Question</span>
        </nav>

        <div className="gradient-mesh rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Ask a Public Question
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Share your coding question with our community of developers and get the help you need
            </p>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div className="card p-6">
              <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Question Title
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Be specific and imagine you're asking a question to another person
              </p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., How can I implement authentication in Next.js?"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title 
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {title.length}/150 characters
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                What are the details of your problem?
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Introduce the problem and expand on what you've already shared in the title. Minimum 20 characters.
              </p>
              <div className={`rounded-xl overflow-hidden ${
                errors.description ? 'ring-2 ring-red-300 dark:ring-red-600' : ''
              }`}>
                <ModernTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe your problem in detail. Include what you've tried, what you expected to happen, and what actually happened..."
                />
              </div>
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="card p-6">
              <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Tags
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Add up to 5 tags to describe what your question is about
              </p>
              <TagInput
                tags={tags}
                onTagsChange={handleTagsChange}
                placeholder="e.g., nextjs, typescript, authentication"
                maxTags={5}
              />
              {errors.tags && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {errors.tags}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((_, i) => i !== index))}
                      className="hover:text-red-600 dark:hover:text-red-400"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Link href="/" className="btn btn-secondary">
                  <ArrowLeftIcon className="w-4 h-4" />
                  Cancel
                </Link>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  className={`btn ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'btn-primary'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Posting...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Post Your Question</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Sidebar - Tips */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full lg:w-80 shrink-0"
        >
          <div className="space-y-6">
            {/* Writing Tips */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Writing a good question
                </h3>
              </div>
              <div className="space-y-4">
                {tips.map((tip, index) => {
                  const Icon = tip.icon;
                  return (
                    <motion.div
                      key={tip.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {tip.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {tip.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Step by step guide */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Step-by-step guide
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Summarize your problem in a one-line title</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Describe your problem in more detail</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Add tags to help others find your question</p>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
