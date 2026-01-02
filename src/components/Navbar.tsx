import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-serif font-bold text-foreground">
          <BookOpen className="h-6 w-6 text-primary" />
          <span>BookHaven</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="gold" size="sm">Register</Button>
              </Link>
            </>
          )}
          <Link to="/admin">
            <Button variant="outline" size="sm">
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
