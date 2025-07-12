"use client";

import { motion } from "framer-motion";

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

export function TagFilter({ tags, selectedTags, onTagToggle }: TagFilterProps) {
  return (
    <div className="space-y-2">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <motion.button
            key={tag}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTagToggle(tag)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
              isSelected
                ? "bg-blue-100 text-blue-700 font-medium border border-blue-200"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{tag}</span>
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
