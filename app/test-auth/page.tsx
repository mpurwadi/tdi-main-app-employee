import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

export default async function TestAuthPage() {
  let authInfo = null;
  let errorInfo = null;
  let cookieInfo = null;
  
  try {
    // Get cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    cookieInfo = token ? 'Token found' : 'No token';
    
    // Try to verify auth
    authInfo = await verifyAuth();
  } catch (error: any) {
    errorInfo = error.message;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Cookie Info:</h2>
        <p>{cookieInfo || 'No cookie info'}</p>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Auth Info:</h2>
        <pre>{JSON.stringify(authInfo, null, 2)}</pre>
      </div>
      {errorInfo && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Error:</h2>
          <p className="text-red-500">{errorInfo}</p>
        </div>
      )}
    </div>
  );
}