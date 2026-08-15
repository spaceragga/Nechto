'use client';

import { useEffect, useState } from 'react';
import { logoutRequest, meRequest, type AuthUser } from '@/lib/api';

export function useAuthSession() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    meRequest()
      .then((response) => {
        if (active) {
          setUser(response.user);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function logout() {
    await logoutRequest();
    setUser(null);
  }

  return { user, loading, logout };
}
