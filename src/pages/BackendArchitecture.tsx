
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackendChart from '@/components/BackendArchitecture/BackendChart';

interface BackendArchitectureProps {
  onBack: () => void;
}

const BackendArchitecture: React.FC<BackendArchitectureProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to App
          </Button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BackendChart />
      </div>
    </div>
  );
};

export default BackendArchitecture;
