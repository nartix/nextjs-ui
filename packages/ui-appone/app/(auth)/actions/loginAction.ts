'use server';

import { cookies } from 'next/headers';

import { ActionResponse } from '@/app/(common)/components/FormBuilder';

export async function loginAction(currentState: { message: string }, formData: FormData): Promise<ActionResponse<unknown>> {
  let message: string = '';

  try {
    const username = formData.get('username');
    const password = formData.get('password');
    console.log('Form data:', formData);

    const response = await fetch('http://172.16.10.60:8001/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('Error data:', errorData);
      message = errorData.error || 'Failed to login';
      return { ...currentState, success: false, message };
    }

    const data = await response.json();
    console.log('Response data:', data);

    // Set a secure cookie
    cookies().set({
      name: 'authToken',
      value: data.token,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: process.env.AUTH_TOKEN_COOKIE_TIMEOUT ? parseInt(process.env.AUTH_TOKEN_COOKIE_TIMEOUT, 10) : 86400, // default 1 day
    });

    message = 'Login successful';
    return { ...currentState, success: true, data, message };
  } catch (error) {
    message = (error as Error).message || 'An unexpected error occurred. Please try again later';
    return { ...currentState, success: false, message };
  }
}
