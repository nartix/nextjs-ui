export interface SessionAdaptor {
  getSessionAndUser(sessionToken: string): Promise<SessionObj | null>;
  createSession(userData: Record<string, any>, expires: number): Promise<SessionObj>;
  deleteSession(sessionToken: string): Promise<void>;
  updateSession(session: Partial<SessionObj> & { sessionToken: string }): Promise<SessionObj | null>;
  getUser(id: string): Promise<Record<string, any> | null>;
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
