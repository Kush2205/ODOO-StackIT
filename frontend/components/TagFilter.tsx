"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckIcon, HashtagIcon } from "@heroicons/react/24/outline";

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

export function TagFilter({ tags, selectedTags, onTagToggle }: TagFilterProps) {
  return (
    <div className="space-y-2">
      {tags.map((tag, index) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <motion.button
            key={tag}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTagToggle(tag)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 group relative overflow-hidden ${
              isSelected
                ? "gradient-primary text-white shadow-md border-0"
                : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <HashtagIcon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                <span className="font-medium">{tag}</span>
              </div>
              
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center"
                  >
                    <CheckIcon className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Hover effect background */}
            {!isSelected && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ zIndex: 0 }}
              />
            )}
          </motion.button>
        );
      })}
      
      {tags.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <HashtagIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No tags available</p>
        </div>
      )}
    </div>
  );
}
