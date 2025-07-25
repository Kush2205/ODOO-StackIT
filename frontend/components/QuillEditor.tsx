'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import EmojiPicker from 'emoji-picker-react';

interface QuillEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  forwardedRef: React.ForwardedRef<any>;
}

const QuillEditor = ({
  value = '',
  onChange,
  placeholder = 'Write something...',
  forwardedRef,
}: QuillEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (editorRef.current && toolbarRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: toolbarRef.current,
        },
        placeholder,
      });

      quillRef.current.on('text-change', () => {
        const content = quillRef.current?.root.innerHTML || '';
        onChange?.(content);
      });

      if (value) {
        quillRef.current.root.innerHTML = value;
      }
    }

    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change');
        quillRef.current = null;
      }
    };
  }, [placeholder, onChange]);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  useImperativeHandle(forwardedRef, () => ({
    getContent: () => {
      return quillRef.current?.root.innerHTML || '';
    },
    setContent: (content: string) => {
      if (quillRef.current) {
        quillRef.current.root.innerHTML = content;
      }
    },
  }));

  const insertEmoji = (emojiData: any) => {
    const emoji = emojiData.emoji;
    const cursorPosition = quillRef.current?.getSelection()?.index ?? 0;
    quillRef.current?.insertText(cursorPosition, emoji);
    quillRef.current?.setSelection(cursorPosition + emoji.length);
    setShowEmojiPicker(false);
  };

  return (
    <div className="relative">
      <div ref={toolbarRef} className="quill-toolbar border-gray-300 border rounded-t-lg">
        <span className="ql-formats">
          <select className="ql-header" defaultValue="">
            <option value="1"></option>
            <option value="2"></option>
            <option value="3"></option>
            <option value=""></option>
          </select>
        </span>
        <span className="ql-formats">
          <button className="ql-bold"></button>
          <button className="ql-italic"></button>
          <button className="ql-underline"></button>
          <button className="ql-strike"></button>
        </span>
        <span className="ql-formats">
          <select className="ql-color"></select>
          <select className="ql-background"></select>
        </span>
        <span className="ql-formats">
          <button className="ql-list" value="ordered"></button>
          <button className="ql-list" value="bullet"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-script" value="sub"></button>
          <button className="ql-script" value="super"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-link"></button>
          <button className="ql-image"></button>
          <button className="ql-clean"></button>
        </span>
      </div>

      <button
        type="button"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="my-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm transition-colors duration-200"
      >
        😊 Add Emoji
      </button>

      {showEmojiPicker && (
        <div className="absolute top-24 left-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg">
          <EmojiPicker onEmojiClick={insertEmoji} />
        </div>
      )}

      <div ref={editorRef} className="min-h-[300px] bg-white border border-gray-300 rounded-b-lg border-t-0" />
    </div>
  );
};

export default QuillEditor;
