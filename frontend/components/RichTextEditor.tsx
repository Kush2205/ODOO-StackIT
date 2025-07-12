// components/RichTextEditor.tsx
'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

import '@/styles/editor.css'; // Custom styles

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const setImage = () => {
    const url = prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const url = prompt('Enter link');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex gap-2 flex-wrap mb-2">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className="btn">Bold</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className="btn">Italic</button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className="btn">Strikethrough</button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="btn">• List</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className="btn">1. List</button>
      <button onClick={setLink} className="btn">🔗 Link</button>
      <button onClick={setImage} className="btn">🖼️ Image</button>
      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className="btn">↞ Left</button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className="btn">↔ Center</button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className="btn">↠ Right</button>
    </div>
  );
};

const RichTextEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: 'Write your awesome question/answer here...',
      }),
    ],
    content: '',
  });

  return (
    <div className="border p-4 rounded-lg shadow-lg max-w-4xl mx-auto bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
};

export default RichTextEditor;
