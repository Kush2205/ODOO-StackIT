"use client";

import { useState, useRef } from "react";
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

export function TextEditor({ 
  value = "", 
  onChange, 
  placeholder = "Write your content here...",
  className = ""
}: TextEditorProps) {
  const [content, setContent] = useState(value);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange?.(newContent);
    }
  };

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const insertEmoji = (emoji: string) => {
    executeCommand('insertText', emoji);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = `<img src="${e.target?.result}" alt="Uploaded image" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
        executeCommand('insertHTML', img);
      };
      reader.readAsDataURL(file);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter the URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const commonEmojis = ['😀', '😂', '❤️', '👍', '👎', '🔥', '💯', '🎉', '🤔', '👏'];

  const toolbarButtons = [
    { icon: BoldIcon, command: 'bold', tooltip: 'Bold' },
    { icon: ItalicIcon, command: 'italic', tooltip: 'Italic' },
    { icon: 'strikethrough', command: 'strikethrough', tooltip: 'Strikethrough' },
    { icon: 'separator' },
    { icon: 'alignLeft', command: 'justifyLeft', tooltip: 'Align Left' },
    { icon: 'alignCenter', command: 'justifyCenter', tooltip: 'Align Center' },
    { icon: 'alignRight', command: 'justifyRight', tooltip: 'Align Right' },
    { icon: 'separator' },
    { icon: ListBulletIcon, command: 'insertUnorderedList', tooltip: 'Bullet List' },
    { icon: 'numberedList', command: 'insertOrderedList', tooltip: 'Numbered List' },
    { icon: 'separator' },
    { icon: LinkIcon, action: insertLink, tooltip: 'Insert Link' },
    { icon: PhotoIcon, action: () => fileInputRef.current?.click(), tooltip: 'Upload Image' },
    { icon: FaceSmileIcon, action: 'emoji', tooltip: 'Insert Emoji' },
  ];

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center space-x-1 flex-wrap gap-2">
          {toolbarButtons.map((button, index) => {
            if (button.icon === 'separator') {
              return <div key={index} className="w-px h-6 bg-gray-300 mx-2" />;
            }

            if (button.icon === 'strikethrough') {
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => executeCommand(button.command!)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
                  title={button.tooltip}
                >
                  <span className="text-lg font-bold line-through">S</span>
                </motion.button>
              );
            }

            if (button.icon === 'alignLeft') {
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => executeCommand(button.command!)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
                  title={button.tooltip}
                >
                  <Bars3BottomLeftIcon className="w-5 h-5" />
                </motion.button>
              );
            }

            if (button.icon === 'alignCenter') {
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => executeCommand(button.command!)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
                  title={button.tooltip}
                >
                  <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                    <div className="h-0.5 bg-current w-4 mx-auto"></div>
                    <div className="h-0.5 bg-current w-3 mx-auto"></div>
                    <div className="h-0.5 bg-current w-4 mx-auto"></div>
                  </div>
                </motion.button>
              );
            }

            if (button.icon === 'alignRight') {
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => executeCommand(button.command!)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
                  title={button.tooltip}
                >
                  <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                    <div className="h-0.5 bg-current w-4 ml-auto"></div>
                    <div className="h-0.5 bg-current w-3 ml-auto"></div>
                    <div className="h-0.5 bg-current w-4 ml-auto"></div>
                  </div>
                </motion.button>
              );
            }

            if (button.icon === 'numberedList') {
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => executeCommand(button.command!)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
                  title={button.tooltip}
                >
                  <span className="text-sm font-bold">123</span>
                </motion.button>
              );
            }

            if (button.action === 'emoji') {
              return (
                <div key={index} className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
                    title={button.tooltip}
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
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            const IconComponent = button.icon as React.ComponentType<{ className?: string }>;

            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (typeof button.action === 'function') {
                    button.action();
                  } else if (button.command) {
                    executeCommand(button.command);
                  }
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-all duration-200"
                title={button.tooltip}
              >
                <IconComponent className="w-5 h-5" />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        className="p-4 min-h-[200px] focus:outline-none"
        style={{ wordBreak: 'break-word' }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
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
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 text-xs text-gray-500">
        {content.replace(/<[^>]*>/g, '').length} characters
      </div>
    </div>
  );
}

export default TextEditor;