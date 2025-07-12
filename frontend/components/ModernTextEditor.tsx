"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  PhotoIcon,
  FaceSmileIcon,
  ListBulletIcon,
  Bars3BottomLeftIcon,
} from "@heroicons/react/24/outline";

interface TextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ModernTextEditor({ 
  value = "", 
  onChange, 
  placeholder = "Write your content here...",
  className = ""
}: TextEditorProps) {
  const [content, setContent] = useState(value);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange?.(newContent);
    }
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    try {
      // Focus the editor first
      if (editorRef.current) {
        editorRef.current.focus();
      }
      
      // Check if the command is supported
      if (!document.queryCommandSupported || !document.queryCommandSupported(command)) {
        console.warn(`Command ${command} not supported`);
        return;
      }
      
      // Execute the command
      const success = document.execCommand(command, false, value);
      
      if (!success) {
        console.warn(`Command ${command} failed`);
      }
      
      // Update content after command
      setTimeout(() => {
        handleContentChange();
      }, 10);
      
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
    }
  }, [handleContentChange]);

  const insertEmoji = useCallback((emoji: string) => {
    try {
      if (editorRef.current) {
        editorRef.current.focus();
        
        // Get current selection
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          
          // Create text node with emoji
          const emojiNode = document.createTextNode(emoji);
          range.insertNode(emojiNode);
          
          // Move cursor after emoji
          range.setStartAfter(emojiNode);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          // If no selection, append to end
          editorRef.current.appendChild(document.createTextNode(emoji));
        }
        
        handleContentChange();
      }
    } catch (error) {
      console.error('Error inserting emoji:', error);
    }
  }, [handleContentChange]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && editorRef.current) {
          editorRef.current.focus();
          
          const img = document.createElement('img');
          img.src = e.target.result as string;
          img.alt = 'Uploaded image';
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.margin = '10px 0';
          img.style.border = '1px solid #e5e7eb';
          img.style.borderRadius = '8px';
          
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            
            // Move cursor after image
            range.setStartAfter(img);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            editorRef.current.appendChild(img);
          }
          
          handleContentChange();
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }

    // Reset file input
    event.target.value = '';
  }, [handleContentChange]);

  const insertLink = useCallback(() => {
    try {
      const url = prompt('Enter the URL:');
      if (!url) return;
      
      if (editorRef.current) {
        editorRef.current.focus();
        
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const selectedText = range.toString();
          
          const link = document.createElement('a');
          link.href = url;
          link.textContent = selectedText || url;
          link.style.color = '#2563eb';
          link.style.textDecoration = 'underline';
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          
          range.deleteContents();
          range.insertNode(link);
          
          // Move cursor after link
          range.setStartAfter(link);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        
        handleContentChange();
      }
    } catch (error) {
      console.error('Error inserting link:', error);
      alert('Failed to insert link. Please try again.');
    }
  }, [handleContentChange]);

  const commonEmojis = ['😀', '😂', '❤️', '👍', '👎', '🔥', '💯', '🎉', '🤔', '👏'];

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center space-x-1 flex-wrap gap-2">
          {/* Bold */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => execCommand('bold')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
            title="Bold (Ctrl+B)"
            type="button"
          >
            <BoldIcon className="w-5 h-5" />
          </motion.button>

          {/* Italic */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => execCommand('italic')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
            title="Italic (Ctrl+I)"
            type="button"
          >
            <ItalicIcon className="w-5 h-5" />
          </motion.button>

          {/* Strikethrough */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => execCommand('strikethrough')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
            title="Strikethrough"
            type="button"
          >
            <span className="text-lg font-bold line-through">S</span>
          </motion.button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Align Left */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => execCommand('justifyLeft')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
            title="Align Left"
            type="button"
          >
            <Bars3BottomLeftIcon className="w-5 h-5" />
          </motion.button>

          {/* Align Center */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => execCommand('justifyCenter')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
            title="Align Center"
            type="button"
          >
            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
              <div className="h-0.5 bg-current w-4 mx-auto"></div>
              <div className="h-0.5 bg-current w-3 mx-auto"></div>
              <div className="h-0.5 bg-current w-4 mx-auto"></div>
            </div>
          </motion.button>

          {/* Align Right */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => execCommand('justifyRight')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
            title="Align Right"
            type="button"
          >
            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
              <div className="h-0.5 bg-current w-4 ml-auto"></div>
              <div className="h-0.5 bg-current w-3 ml-auto"></div>
              <div className="h-0.5 bg-current w-4 ml-auto"></div>
            </div>
          </motion.button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Bullet List */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => execCommand('insertUnorderedList')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
            title="Bullet List"
            type="button"
          >
            <ListBulletIcon className="w-5 h-5" />
          </motion.button>

          {/* Numbered List */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => execCommand('insertOrderedList')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
            title="Numbered List"
            type="button"
          >
            <span className="text-sm font-bold">123</span>
          </motion.button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Link */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={insertLink}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
            title="Insert Link"
            type="button"
          >
            <LinkIcon className="w-5 h-5" />
          </motion.button>

          {/* Image Upload */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
            title="Upload Image"
            type="button"
          >
            <PhotoIcon className="w-5 h-5" />
          </motion.button>

          {/* Emoji Picker */}
          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
              title="Insert Emoji"
              type="button"
            >
              <FaceSmileIcon className="w-5 h-5" />
            </motion.button>
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="grid grid-cols-5 gap-1">
                {commonEmojis.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => insertEmoji(emoji)}
                    className="p-1 text-lg hover:bg-gray-100 rounded"
                    type="button"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        className="p-4 min-h-[200px] focus:outline-none prose max-w-none"
        style={{ wordBreak: 'break-word' }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
        onKeyDown={(e) => {
          // Handle keyboard shortcuts
          if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
              case 'b':
                e.preventDefault();
                execCommand('bold');
                break;
              case 'i':
                e.preventDefault();
                execCommand('italic');
                break;
              case 'u':
                e.preventDefault();
                execCommand('underline');
                break;
            }
          }
        }}
      />

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Character count */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
        <span>{content.replace(/<[^>]*>/g, '').length} characters</span>
        <span className="text-gray-400">Use Ctrl+B for bold, Ctrl+I for italic</span>
      </div>
    </div>
  );
}

// Export as both ModernTextEditor and TextEditor for compatibility
export const TextEditor = ModernTextEditor;
export const RichTextEditor = ModernTextEditor;
export default ModernTextEditor;
