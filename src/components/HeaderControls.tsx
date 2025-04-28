
import React from 'react';
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, History, RotateCcw } from "lucide-react";

interface HeaderControlsProps {
  hideHistory: boolean;
  setHideHistory: (value: boolean) => void;
  isHidden: boolean;
  setIsHidden: (value: boolean) => void;
  onResetGame: () => void;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({
  hideHistory,
  setHideHistory,
  isHidden,
  setIsHidden,
  onResetGame,
}) => {
  return (
    <div className="sticky top-0 z-20 flex justify-center gap-4 bg-white/80 backdrop-blur-sm py-4 px-4 shadow-md">
      <Toggle
        pressed={hideHistory}
        onPressedChange={setHideHistory}
        variant="outline"
        aria-label={hideHistory ? "Show History" : "Hide History"}
        className="data-[state=on]:bg-blue-500 data-[state=on]:text-white"
      >
        <div className="flex items-center">
          <History className="h-4 w-4 mr-2" />
          History
        </div>
      </Toggle>
      
      <Toggle
        pressed={isHidden}
        onPressedChange={setIsHidden}
        variant="outline"
        aria-label={isHidden ? "Show Board" : "Hide Board"}
        className="data-[state=on]:bg-blue-500 data-[state=on]:text-white"
      >
        <div className="flex items-center">
          {isHidden ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
          Board
        </div>
      </Toggle>

      <Button
        onClick={onResetGame}
        variant="outline"
        aria-label="Reset Game"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset
      </Button>
    </div>
  );
};

export default HeaderControls;
