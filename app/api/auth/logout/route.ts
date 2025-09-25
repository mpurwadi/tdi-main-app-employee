import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const response = NextResponse.json({ message: 'Logout successful' });
        
        // Clear the token cookie
        response.cookies.delete('token');
        
        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}