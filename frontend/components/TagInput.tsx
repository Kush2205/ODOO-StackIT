"use client";

import { useState, KeyboardEvent } from "react";
import { motion } from "framer-motion";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({ tags, onTagsChange, placeholder = "Add tags...", maxTags = 10 }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions] = useState([
    "React", "JavaScript", "TypeScript", "Node.js", "Python", "Java", "HTML", "CSS",
    "MongoDB", "PostgreSQL", "Express", "Next.js", "Vue", "Angular", "Bootstrap",
    "Tailwind", "Git", "Docker", "AWS", "Firebase", "GraphQL", "REST API"
  ]);

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion)
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < maxTags) {
      onTagsChange([...tags, tag]);
      setInputValue("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent min-h-[44px]">
        {tags.map((tag) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded"
          >
            {tag}
          </motion.span>
        ))}
        {tags.length < maxTags && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] outline-none text-sm"
          />
        )}
      </div>

      {inputValue && filteredSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 rounded-lg bg-white shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredSuggestions.slice(0, 8).map((suggestion) => (
            <motion.button
              key={suggestion}
              type="button"
              whileHover={{ backgroundColor: "#f3f4f6" }}
              onClick={() => addTag(suggestion)}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              {suggestion}
            </motion.button>
          ))}
        </motion.div>
      )}

      <div className="text-xs text-gray-500">
        {tags.length}/{maxTags} tags • Press Enter or comma to add tags
      </div>
    </div>
  );
}
