'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Dynamically import the actual component to avoid SSR issues
const MarkdownEditorClient = dynamic(
  () => import('@/components/forms/markdown-editor/components-forms-markdown-editor-basic'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div> }
);

const MarkdownEditorPageWrapper = () => {
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
  return <MarkdownEditorClient />;
};

export default MarkdownEditorPageWrapper;