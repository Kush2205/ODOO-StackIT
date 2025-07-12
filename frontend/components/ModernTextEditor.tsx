'use client';

import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Quill styles
import EmojiPicker from 'emoji-picker-react'; // ✅ new emoji picker

// Define the ref type for the ModernTextEditor component
export type ModernTextEditorHandle = {
  getContent: () => string;
};

const ModernTextEditor = forwardRef<ModernTextEditorHandle>((_, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }, { font: [] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],
            ['link', 'image'],
            ['clean'],
          ],
        },
        placeholder: 'Write something...',
      });
    }

    return () => {
      quillRef.current = null;
    };
  }, []);

  // Expose the getContent function to the parent component
  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (quillRef.current) {
        return quillRef.current.root.innerHTML;
      }
      return '';
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
    <div>
      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        style={{
          marginBottom: '10px',
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        😊 Emoji
      </button>

      {showEmojiPicker && (
        <div style={{ position: 'absolute', zIndex: 100 }}>
          <EmojiPicker onEmojiClick={insertEmoji} />
        </div>
      )}

      <div ref={editorRef} style={{ height: '300px' }} />
    </div>
  );
});

ModernTextEditor.displayName = 'RichTextEditor';
export default ModernTextEditor;
