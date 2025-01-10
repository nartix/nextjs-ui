// import { getTranslations } from 'next-intl/server';
// import NextAuth, { NextAuthOptions } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import { JWT } from 'next-auth/jwt';

// import fetchWrapper from '@/lib/fetch-wrapper';
// import ApiAdaptor from '@/app/[locale]/(auth)/adaptor/api-adaptor';

// const API_BASE_URL = process.env.API_URL_GLOBAL;
// const API_VERSION = process.env.API_URL_VERSION;
// const API_PREFIX = process.env.API_URL_PREFIX;

// async function refreshAccessToken(token: JWT): Promise<JWT> {
//   const t = await getTranslations();
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ refresh: token.refreshToken }),
//     });

//     if (!response.ok) {
//       throw new Error(t('auth.error_fetch_user_info'));
//     }

//     const refreshedTokens = await response.json();
//     const accessToken = refreshedTokens.access;

//     // Decode the new access token to get the expiration time
//     const decodedToken = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
//     const accessTokenExpires = decodedToken.exp * 1000; // Convert to milliseconds

//     return {
//       ...token,
//       accessToken,
//       accessTokenExpires,
//     };
//   } catch (error) {
//     console.error('Error refreshing access token:', error);

//     return {
//       ...token,
//       error: 'RefreshAccessTokenError',
//     };
//   }
// }

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         username: { label: 'Username', type: 'text', placeholder: 'username' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials) {
//         const t = await getTranslations();

//         if (!credentials) {
//           throw new Error(t('auth.no_credentials'));
//         }

//         try {
//           // Authenticate using the provided URL
//           console.log('url:', `${API_BASE_URL}/${API_VERSION}/${API_PREFIX}/`);
//           const response = await fetchWrapper(`${API_BASE_URL}/${API_PREFIX}/${API_VERSION}/auth/login`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               username: credentials.username,
//               password: credentials.password,
//             }),
//           });

//           if (!response.ok) {
//             return null;
//           }

//           const userInfo = await response.json();

//           // Return user information
//           return userInfo;
//         } catch (error: any) {
//           console.error(t('auth.error_in_authorize'), error);
//           return null;
//         }
//       },
//     }),
//   ],
//   pages: {
//     signIn: '/login',
//   },
//   callbacks: {
//     // async jwt({ token, user }) {
//     //   // Initial sign-in
//     //   if (user) {
//     //     return {
//     //       accessToken: user.accessToken,
//     //       refreshToken: user.refreshToken,
//     //       accessTokenExpires: user.accessTokenExpires,
//     //       user,
//     //     };
//     //   }

//     //   // Return previous token if access token is still valid
//     //   if (Date.now() < token.accessTokenExpires) {
//     //     return token;
//     //   }

//     //   // Access token expired, refresh it
//     //   return await refreshAccessToken(token);
//     // },
//     // async session({ session, token }) {
//     //   session.user = token.user;
//     //   session.accessToken = token.accessToken;
//     //   session.error = token.error;

//     //   return session;
//     // },
//     async session({ session, user }) {
//       session.user = user;
//       return session;
//     },
//   },
//   adapter: ApiAdaptor({}),
//   session: {
//     // strategy: 'jwt',
//     strategy: 'database',
//   },
//   secret: process.env.NEXTAUTH_SECRET, // Use a dedicated secret for NextAuth
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };
export {};
