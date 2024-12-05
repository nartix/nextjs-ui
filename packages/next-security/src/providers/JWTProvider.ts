interface Credentials {
  username: string;
  password: string;
}

interface Token {
  access?: string;
  refresh?: string;
  [key: string]: unknown;
}

export const authOptions = {
  providers: [
    {
      id: 'jwt-provider', // Custom provider ID
      name: 'JWT Username Password Provider',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'Username' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Credentials) {
        // Replace this with your actual backend API for JWT token authentication
        const response = await fetch('https://your-backend-api.com/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: credentials?.username,
            password: credentials?.password,
          }),
        });

        const data = await response.json();

        // If login is successful and backend returns a JWT token
        if (response.ok && data.access) {
          // You can return additional data from your API here
          return {
            token: data,
            username: credentials?.username,
          };
        }

        // If the login fails, return null
        return null;
      },
    },
  ],
  session: {
    strategy: 'jwt', // Use JWT to handle sessions
  },
  //   jwt: {
  //     secret: process.env.NEXTAUTH_SECRET, // Secret for signing the JWT
  //   },
  callbacks: {
    async jwt({ token, user }: { token: Token; user?: any }) {
      // Attach the JWT token from your backend to the NextAuth token
      if (user) {
        token.access = user.token;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: Token }) {
      // Add the JWT token to the session object
      session.accessToken = token.access;
      return session;
    },
  },
};
