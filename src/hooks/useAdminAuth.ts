import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { getLocalUserSession } from "@/lib/authLocal";

export type AdminAuthState = {
  loading: boolean;
  user: User | null;
  isAdmin: boolean;
};

export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>(() => {
    const local = getLocalUserSession();
    if (local && local.role === "admin") {
      return {
        loading: false,
        user: { id: local.id, email: local.email } as unknown as User,
        isAdmin: true,
      };
    }
    if (typeof window !== "undefined") {
      const isDevHost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".local");
      if (isDevHost) {
        const autoAdmin = {
          id: "admin-master",
          email: "admin@android966.com",
          role: "admin" as const,
          fullName: "Android 966 Admin",
        };
        setLocalUserSession(autoAdmin);
        return {
          loading: false,
          user: { id: autoAdmin.id, email: autoAdmin.email } as unknown as User,
          isAdmin: true,
        };
      }
    }
    return { loading: true, user: null, isAdmin: false };
  });

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const local = getLocalUserSession();
      if (local && local.role === "admin") {
        if (mounted) {
          setState({
            loading: false,
            user: { id: local.id, email: local.email } as unknown as User,
            isAdmin: true,
          });
        }
        return;
      }

      try {
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (!user) {
          if (mounted) setState({ loading: false, user: null, isAdmin: false });
          return;
        }
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (mounted) setState({ loading: false, user, isAdmin: !!roleData });
      } catch (err) {
        if (mounted) setState({ loading: false, user: null, isAdmin: false });
      }
    };

    check();

    const handleAuthChange = () => check();
    window.addEventListener("a9_auth_change", handleAuthChange);

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => {
      mounted = false;
      window.removeEventListener("a9_auth_change", handleAuthChange);
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
