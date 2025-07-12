// pages/editor.tsx
import RichTextEditor from '../components/RichTextEditor'

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">📝 Ask a Question</h1>
      <RichTextEditor />
    </div>
  );
}
