// Temporary simplified auth for build
export async function getServerAuthSession() {
  // Return null for now to avoid NextAuth v5 migration complexity
  return null;
}

// Simple mock session type
export type Session = {
  user: {
    id: string;
    email: string;
    name: string;
  };
} | null;
