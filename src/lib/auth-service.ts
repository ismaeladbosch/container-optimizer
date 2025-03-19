// src/lib/auth-service.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'maricarmen1_secret_key_container_optimizer';

export function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return {
      user: {
        name: decoded.name,
        role: decoded.role,
        username: decoded.username,
      },
    };
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
}

export function signOut() {
  const cookieStore = cookies();
  cookieStore.delete('auth_token');
}