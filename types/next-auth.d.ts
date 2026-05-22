declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone: string;
      name: string | null;
      image?: string | null;
      role: string;
      points: number;
      isActive: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
    points?: number;
    phone?: string;
    isActive?: boolean;
  }
}
