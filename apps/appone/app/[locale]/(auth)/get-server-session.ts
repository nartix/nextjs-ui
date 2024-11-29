import { getServerSession as Session } from '@nartix/auth-appone';
import { authConfig } from '@/app/[locale]/(auth)/auth-options';

export const getServerSession = () => Session(authConfig);
