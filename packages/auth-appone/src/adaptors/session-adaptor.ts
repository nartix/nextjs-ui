export interface SessionAdaptor {
  getSession?(sessionToken: string): Promise<Session | null>;
  createSession(session: SessionObj): Promise<SessionObj>;
  deleteSession(sessionToken: string): Promise<void>;
  updateSession(session: Partial<Session> & { sessionToken: string }): Promise<Session | null>;
}

export interface Session {
  id?: string;
  userId: string;
  userData?: Record<string, any>;
  sessionToken?: string;
  expires?: Date;
}
export interface SessionObj {
  // primaryId: string;
  // sessionId: string;
  // creationTime: number; // UNIX epoch time in milliseconds
  // expiryTime: number; // UNIX epoch time in milliseconds
  // maxInactiveInterval: number; // In seconds
  // lastAccessTime: number; // UNIX epoch time in milliseconds
  [key: string]: any; // Index signature to allow any additional properties
}
