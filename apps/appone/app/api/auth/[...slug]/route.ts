import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';
import { NextRequest, NextResponse } from 'next/server';
import { getCsrfToken } from '@/app/[locale]/(auth)/lib/get-csrf-token';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  if ((await params).slug?.[0] === 'session') {
    const session = await getServerSession();
    return NextResponse.json(session);
  }

  if ((await params).slug?.[0] === 'csrf-token') {
    const csrfToken = await getCsrfToken();
    return NextResponse.json({ token: csrfToken });
  }

  return NextResponse.json({ error: 'Route not found' }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  // Handle /api/auth/logout
  if ((await params).slug?.[0] === 'logout') {
    // Add your actual session destruction logic here
    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      {
        headers: {
          'Set-Cookie': `session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly`,
        },
      }
    );
  }

  return NextResponse.json({ error: 'Route not found' }, { status: 404 });
}
