interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
}

interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
}

interface AuthData {
  users: User[];
  currentUser: CurrentUser;
}

declare module "*/authData.json" {
  const value: AuthData;
  export default value;
} 