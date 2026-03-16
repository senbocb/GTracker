"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface RegistryContextType {
  registry: any[];
  loading: boolean;
  refreshRegistry: () => Promise<void>;
}

const RegistryContext = createContext<RegistryContextType>({
  registry: [],
  loading: true,
  refreshRegistry: async () => {}
});

export const RegistryProvider = ({ children }: { children: React.ReactNode }) => {
  const [registry, setRegistry] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistry = async () => {
    try {
      const { data, error } = await supabase
        .from('game_registry')
        .select('*')
        .order('title', { ascending: true });
      
      if (error) throw error;
      setRegistry(data || []);
    } catch (err) {
      console.error("Error fetching global registry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistry();
  }, []);

  return (
    <RegistryContext.Provider value={{ registry, loading, refreshRegistry: fetchRegistry }}>
      {children}
    </RegistryContext.Provider>
  );
};

export const useRegistry = () => useContext(RegistryContext);