import { verifyAuth, isAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const auth = await verifyAuth();
    if (!isAdmin(auth)) {
      // If not an admin, redirect to the homepage.
      redirect('/');
    }
  } catch (error) {
    // If not authenticated, redirect to the login page.
    redirect('/auth/cover-login');
  }

  return <>{children}</>;
}