
import React, { createContext, useContext, useState } from 'react';

interface TileSizeContextType {
  tileSize: number;
  setTileSize: (size: number) => void;
}

const TileSizeContext = createContext<TileSizeContextType | undefined>(undefined);

export function TileSizeProvider({ children }: { children: React.ReactNode }) {
  const [tileSize, setTileSize] = useState(1);

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
