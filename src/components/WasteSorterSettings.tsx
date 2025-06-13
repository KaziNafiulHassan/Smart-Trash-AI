
import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WasteSorterSettingsProps {
  useGraph: boolean;
  onToggleGraph: (enabled: boolean) => void;
}

const WasteSorterSettings: React.FC<WasteSorterSettingsProps> = ({
  useGraph,
  onToggleGraph
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => onToggleGraph(!useGraph)}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <span>Graph</span>
            <div className={`w-4 h-4 rounded border ${useGraph ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
              {useGraph && (
                <div className="w-full h-full flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              )}
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WasteSorterSettings;
