// packages/auth-package/src/callbacks.ts

export const callbacks = {
  async onSignIn(user: any, account: any) {
    // Perform actions after sign in
  },
  async onSession(session: any, token: any) {
    // Customize session data
    return session;
  },
  async onSignOut(user: any) {
    // Perform actions on sign out
  },
};
