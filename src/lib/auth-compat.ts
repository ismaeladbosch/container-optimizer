// src/lib/auth-compat.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Simular el hook useSession de NextAuth
export function useSession() {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading');
  const router = useRouter();

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch('/api/me');
        const data = await response.json();
        
        if (data.user) {
          setSession({ user: data.user });
          setStatus('authenticated');
        } else {
          setSession(null);
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        setSession(null);
        setStatus('unauthenticated');
      }
    }
    
    fetchSession();
  }, []);

  return { data: session, status };
}

// Simular función signOut de NextAuth
export function signOut(options: any = {}) {
  const router = useRouter();
  
  return fetch('/api/logout', { method: 'POST' })
    .then(() => {
      if (options.callbackUrl) {
        router.push(options.callbackUrl);
      }
    });
}