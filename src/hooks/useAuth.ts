'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/me');
        const data = await response.json();
        
        if (data.user) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);

  return { user, loading };
