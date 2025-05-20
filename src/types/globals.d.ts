export {};

export type PublicRoles = 'attendee' | 'organizer' | 'sponsor';
export type Roles = 'admin' | PublicRoles;

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}