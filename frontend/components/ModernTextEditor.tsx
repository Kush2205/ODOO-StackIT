'use client';

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from 'react';
import dynamic from 'next/dynamic';
import { aiApi } from '@/lib/api';

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
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictions, setPredictions] = useState<string[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function handleNextWord(text: string) {
    setIsPredicting(true);
    const result = await aiApi.nextWord(text);
    if (result.success && result.data) {
      setPredictions(result.data.predictions);
    } else {
      setPredictions([]);
    }
    setIsPredicting(false);
  }

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
    <div>
      <QuillEditor
        forwardedRef={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
        onClick={() => handleNextWord(value || '')}
        disabled={isPredicting}
      >
        {isPredicting ? 'Predicting...' : 'Next Word Suggestions'}
      </button>
      {predictions.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          Suggestions: {predictions.join(', ')}
        </div>
      )}
    </div>
  );
});

ModernTextEditor.displayName = 'ModernTextEditor';
export default ModernTextEditor;