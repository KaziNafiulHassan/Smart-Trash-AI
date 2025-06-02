import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Button
      onClick={handleLogout}
      className={`p-2 rounded-full ${className}`}
    >
      <LogOut className="w-4 h-4 sm:w-6 sm:h-6" />
    </Button>
  );
};

export default LogoutButton;
