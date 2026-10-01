import React, { createContext, useContext, useEffect, ReactNode } from "react";

import { CurrentUser, getCurrentUser, supabase } from "./supabase";
import { useSupabase } from "./useSupabase";

interface GlobalContextType {
  isLogged: boolean;
  user: CurrentUser | null;
  loading: boolean;
  refetch: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const {
    data: user,
    loading,
    refetch,
  } = useSupabase({
    fn: getCurrentUser,
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        // Deferred: calling other supabase.auth methods inside this callback can deadlock.
        setTimeout(() => refetch({}), 0);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const isLogged = !!user;

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        user,
        loading,
        refetch: () => refetch({}),
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context)
    throw new Error("useGlobalContext must be used within a GlobalProvider");

  return context;
};

export default GlobalProvider;
