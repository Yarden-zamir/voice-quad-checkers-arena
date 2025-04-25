
import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useTileSize } from '@/contexts/TileSizeContext';

export function Settings() {
  const { tileSize, setTileSize } = useTileSize();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="fixed top-4 right-4 z-50">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none text-lg">Tile Size</h4>
          <Slider
            defaultValue={[tileSize]}
            max={1.5}
            min={0.6}
            step={0.1}
            className="py-4"
            onValueChange={(value) => setTileSize(value[0])}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
