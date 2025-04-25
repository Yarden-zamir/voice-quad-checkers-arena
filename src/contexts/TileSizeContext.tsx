
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TileSizeContextType {
  tileSize: number;
  setTileSize: (size: number) => void;
}

const TileSizeContext = createContext<TileSizeContextType | undefined>(undefined);

export function TileSizeProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [tileSize, setTileSize] = useState(isMobile ? 0.8 : 1);

  // Adjust tile size when mobile status changes
  useEffect(() => {
    if (isMobile && tileSize > 1) {
      setTileSize(0.8);
    }
  }, [isMobile, tileSize]);

  return (
    <TileSizeContext.Provider value={{ tileSize, setTileSize }}>
      {children}
    </TileSizeContext.Provider>
  );
}

export function useTileSize() {
  const context = useContext(TileSizeContext);
  if (context === undefined) {
    throw new Error('useTileSize must be used within a TileSizeProvider');
  }
  return context;
}
