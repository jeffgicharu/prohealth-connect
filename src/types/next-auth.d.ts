import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Extending the built-in session types
   */
  interface Session {
    user: {
      id: string;
      emailVerified?: Date | null;
    } & DefaultSession['user']
  }

  /**
   * Extending the built-in user types
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    emailVerified?: Date | null;
  }
} 