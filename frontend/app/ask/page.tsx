"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ModernTextEditor from "@/components/ModernTextEditor";
import { TagInput } from "@/components/TagInput";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { questionsApi, aiApi } from "@/lib/api";

export default function AskQuestion() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const descriptionText = stripHtml(description).trim();
    
    if (!title.trim() || !descriptionText || tags.length === 0) {
      alert("Please fill in all fields and add at least one tag.");
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
        // Redirect to home page or the new question
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

  // Suggest tags when title or description changes
  async function handleSuggestTags() {
    if (!title.trim() && !description.trim()) return;
    setIsSuggesting(true);
    const result = await aiApi.suggestTags(title, description);
    if (result.success && result.data) {
      setSuggestedTags(result.data.suggested_tags);
    } else {
      setSuggestedTags([]);
    }
    setIsSuggesting(false);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
        <p className="text-gray-600">
          Share your question with the community and get help from other developers
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border border-gray-200 p-8 space-y-6"
      >
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your programming question? Be specific."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            maxLength={150}
          />
          <div className="mt-1 text-xs text-gray-500">
            {title.length}/150 characters
          </div>
        </div>

        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <ModernTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Describe your problem in detail. Include any error messages, code snippets, or relevant context that might help others understand your question."
          />
        </div>

        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags <span className="text-red-500">*</span>
          </label>
          <TagInput
            tags={tags}
            onTagsChange={setTags}
            placeholder="Add relevant tags (e.g., react, javascript, node.js)"
            maxTags={5}
          />
          <div className="mt-2">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                    className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        
        <div>
          <button
            type="button"
            onClick={handleSuggestTags}
            className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
            disabled={isSuggesting}
          >
            {isSuggesting ? "Suggesting..." : "Suggest Tags"}
          </button>
          {suggestedTags.length > 0 && (
            <div className="mt-2 text-sm text-gray-700">
              Suggested Tags: {suggestedTags.join(", ")}
              <div className="flex flex-wrap gap-2 mt-1">
                {suggestedTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs hover:bg-blue-300"
                    onClick={() => setTags(prev => prev.includes(tag) ? prev : [...prev, tag])}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <h3 className="font-medium text-blue-900 mb-2">Writing a good question</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Make your title specific and descriptive</li>
            <li>• Include relevant code, error messages, or examples</li>
            <li>• Explain what you've already tried</li>
            <li>• Use relevant tags to help others find your question</li>
            <li>• Be respectful and follow community guidelines</li>
          </ul>
        </motion.div>

        
        <div className="flex justify-end space-x-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting || !title.trim() || !description.trim() || tags.length === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isSubmitting || !title.trim() || !description.trim() || tags.length === 0
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
              "Post Question"
            )}
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
}
