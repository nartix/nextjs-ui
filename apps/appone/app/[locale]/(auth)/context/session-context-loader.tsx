import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';

export async function loadSessionContext() {
  const session = await getServerSession();
  return session;
}
