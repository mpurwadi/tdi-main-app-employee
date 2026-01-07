import { verifyAuthServer, isAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';
import { cookies } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const auth = await verifyAuthServer();
    if (!isAdmin(auth)) {
      // If not an admin, redirect to the homepage.
      redirect('/');
    }
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Admin layout authentication error:', error);
    // If not authenticated, redirect to the login page.
    redirect('/auth/boxed-signin');
  }

  return <>{children}</>;
}