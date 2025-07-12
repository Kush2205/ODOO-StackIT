'use client';

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from 'react';
import dynamic from 'next/dynamic';

export type ModernTextEditorHandle = {
  getContent: () => string;
  setContent: (content: string) => void;
};

interface ModernTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

// Dynamically import the editor component with SSR turned off
const QuillEditor = dynamic(() => import('./QuillEditor'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #ccc',
        borderRadius: '6px',
        backgroundColor: '#f9f9f9',
      }}
    >
      <p>Loading editor...</p>
    </div>
  ),
});

const ModernTextEditor = forwardRef<
  ModernTextEditorHandle,
  ModernTextEditorProps
>(({ value = '', onChange, placeholder = 'Write something...' }, ref) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        style={{
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #ccc',
          borderRadius: '6px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <QuillEditor
      forwardedRef={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
});

ModernTextEditor.displayName = 'ModernTextEditor';
export default ModernTextEditor;