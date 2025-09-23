import { verifyAuth, isAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';
import { cookies } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Create a mock request object with cookies
    const cookieStore = cookies();
    const mockRequest = {
      cookies: {
        get: (name: string) => cookieStore.get(name)
      }
    };

    const auth = await verifyAuth(mockRequest as any);
    if (!isAdmin(auth)) {
      // If not an admin, redirect to the homepage.
      redirect('/');
    }
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Admin layout authentication error:', error);
    // If not authenticated, redirect to the login page.
    redirect('/auth/cover-login');
  }

  return <>{children}</>;
}