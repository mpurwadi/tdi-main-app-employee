'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Dynamically import the actual component to avoid SSR issues
const QuillEditorClient = dynamic(
  () => import('@/components/forms/quill-editor/components-forms-quill-editor-basic'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div> }
);

const QuillEditorPageWrapper = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set isClient to true only on the client side
    setIsClient(true);
  }, []);

  // Show loading state on server side
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Render the actual component on client side
  return <QuillEditorClient />;
};

export default QuillEditorPageWrapper;