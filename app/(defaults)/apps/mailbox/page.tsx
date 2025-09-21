'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Dynamically import the actual component to avoid SSR issues
const MailboxClient = dynamic(
  () => import('@/components/apps/mailbox/components-apps-mailbox'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div> }
);

const MailboxPageWrapper = () => {
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
  return <MailboxClient />;
};

export default MailboxPageWrapper;