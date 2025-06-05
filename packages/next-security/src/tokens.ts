export async function fetchToken(username: string, password: string) {
  try {
    const response = await fetch('http://localhost:8001/api/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Invalid login credentials' };
    }

    const data = await response.json();
    return { token: data.token };
  } catch (error) {
    return { error: 'An error occurred while fetching the token' };
  }
}

export function validateToken(token: string): boolean {
  // Add JWT validation logic here (if needed)
  return !!token; // Simplified validation
}
