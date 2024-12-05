export async function fetchUserInfo(token: string, userInfoURL: string) {
  try {
    const response = await fetch(userInfoURL, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return null;
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    return null;
  }
}
