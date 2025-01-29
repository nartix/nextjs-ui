import 'server-only';

import type { SessionObj } from '@nartix/next-security/src';

export function extractSessionForClientside(sessionObject: SessionObj | null) {
  interface UserRole {
    id: string;
    name: string;
  }

  interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    roles: UserRole[];
  }

  interface ClientData {
    primaryId: string;
    sessionId: string;
    principalName: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    user: User;
  }

  if (!sessionObject) {
    return null;
  }

  const clientData: ClientData = {
    primaryId: sessionObject.primaryId,
    sessionId: sessionObject.sessionId,
    principalName: sessionObject.principalName,
    userId: sessionObject.userId,
    ipAddress: sessionObject.ipAddress,
    userAgent: sessionObject.userAgent,
    user: {
      id: sessionObject.user.id,
      username: sessionObject.user.username,
      firstName: sessionObject.user.firstName,
      lastName: sessionObject.user.lastName,
      roles: sessionObject.user.roles.map((role: { id: string; name: string }): UserRole => ({ id: role.id, name: role.name })),
    },
  };

  return clientData;
}
