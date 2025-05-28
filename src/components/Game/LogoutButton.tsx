
import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface LogoutButtonProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  className = "", 
  variant = "ghost" 
}) => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      className={`flex items-center space-x-2 ${className}`}
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Logout</span>
    </Button>
  );
};

export default LogoutButton;
