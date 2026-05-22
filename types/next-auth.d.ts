declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string | null;
      name: string | null;
      image?: string | null;
      role: string;
      points: number;
    };
  }

  interface User {
    role: string;
    points: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
    points?: number;
  }
}
