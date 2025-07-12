'use client';

import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import EmojiPicker from 'emoji-picker-react';

export type ModernTextEditorHandle = {
  getContent: () => string;
};

const ModernTextEditor = forwardRef<ModernTextEditorHandle>((_, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null); // 🔧 Toolbar container
  const quillRef = useRef<Quill | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (editorRef.current && toolbarRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: toolbarRef.current, // 🔧 use custom toolbar container
        },
        placeholder: 'Write something...',
      });
    }

    return () => {
      quillRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getContent: () => {
      return quillRef.current?.root.innerHTML || '';
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
      <div
        ref={toolbarRef}
        style={{ marginBottom: '8px' }}
        id="custom-toolbar"
      >
        <span className="ql-formats">
          <select className="ql-header" defaultValue={''}>
            <option value="1" />
            <option value="2" />
            <option value="3" />
            <option value="4" />
            <option value="5" />
            <option value="6" />
            <option value="" />
          </select>
          <select className="ql-font" />
        </span>
        <span className="ql-formats">
          <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-underline" />
          <button className="ql-strike" />
        </span>
        <span className="ql-formats">
          <select className="ql-color" />
          <select className="ql-background" />
        </span>
        <span className="ql-formats">
          <button className="ql-list" value="ordered" />
          <button className="ql-list" value="bullet" />
          <button className="ql-script" value="sub" />
          <button className="ql-script" value="super" />
        </span>
        <span className="ql-formats">
          <button className="ql-link" />
          <button className="ql-image" />
          <button className="ql-clean" />
        </span>
      </div>

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
