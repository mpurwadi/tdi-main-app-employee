
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const auth = verifyAuth(); // This will throw an error if not authenticated
        return NextResponse.json(auth, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 401 });
    }
}
