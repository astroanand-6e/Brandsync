"use client";

import { useState, useEffect, FC } from 'react'; // Import FC for component type
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
// Removed ForwardRefExoticComponent, RefAttributes
import { Menu, X, ChevronRight, User, LogOut, LayoutDashboard, LucideProps } from 'lucide-react'; 
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Define a type for NavLink items
type NavLinkItem = {
  name: string;
  path: string;
  // Use LucideProps directly, or define a more specific type if needed
  icon?: React.FC<LucideProps>; 
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  // Get userProfile from useAuth
  const { user, userProfile, signOut } = useAuth(); 
  // Get userRole from userProfile, default to influencer if not available (or handle loading state)
  const userRole = userProfile?.role === 'BRAND' ? 'brand' : 'influencer'; 

  const isActive = (path: string) => pathname === path || (path.startsWith('/dashboard') && pathname.startsWith(path)); // Updated isActive for dashboard

  // Change navbar style on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Define base nav links with the explicit type
  const baseNavLinks: NavLinkItem[] = [
    { name: 'Discover', path: '/discover' },
    { name: 'Workfolio', path: '/workfolio' }, // Assuming Workfolio is relevant for both? Adjust if needed.
    { name: 'Messages', path: '/messages' },
  ];

  // Determine dashboard path based on role
  const dashboardPath = userRole === 'brand' ? '/dashboard/brand' : '/dashboard/influencer';

  // Define nav links for authenticated and unauthenticated users separately
  const guestNavLinks: NavLinkItem[] = [
    { name: 'Home', path: '/' },
    { name: 'Discover', path: '/discover' },
    { name: 'Workfolio', path: '/workfolio' } // Show Workfolio for demo purposes to guests
  ];

  const authenticatedNavLinks: NavLinkItem[] = [
    { name: 'Dashboard', path: dashboardPath, icon: LayoutDashboard },
    { name: 'Messages', path: '/messages' }
  ];

  // Use the appropriate set of links based on authentication status
  const navLinks: NavLinkItem[] = user ? authenticatedNavLinks : guestNavLinks;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-10 transition-all duration-300',
        isScrolled ? 'glass-dark bg-opacity-80 backdrop-blur-md py-3' : 'bg-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between">
         {/* Logo Link - points to dashboard if logged in, otherwise home */}
        <Link href={user ? dashboardPath : "/"} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-brand flex items-center justify-center">
            <span className="text-white font-semibold">B</span>
          </div>
          <span className="font-semibold text-lg hidden sm:block">BrandSync</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5', // Added flex and gap
                isActive(link.path)
                  ? 'text-primary-foreground bg-primary'
                  : 'text-foreground/80 hover:text-foreground hover:bg-secondary'
              )}
            >
              {/* Check if icon exists before rendering */}
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.displayName && <p className="font-medium">{user.displayName}</p>}
                    {user.email && <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>}
                  </div>
                </div>
                <DropdownMenuSeparator />
                 {/* Add Dashboard link */}
                 <DropdownMenuItem asChild>
                  <Link href={dashboardPath} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/workfolio" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="group">
                  Get Started
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border py-4 px-6 flex flex-col gap-2 md:hidden animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={cn(
                'px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2', // Added flex and gap
                isActive(link.path)
                  ? 'text-primary-foreground bg-primary'
                  : 'text-foreground/80 hover:text-foreground hover:bg-secondary'
              )}
            >
               {/* Check if icon exists before rendering */}
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.name}
            </Link>
          ))}
           <div className="flex flex-col gap-2 mt-4 border-t border-border pt-4"> {/* Added border */}
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    {user.displayName && <p className="font-medium text-sm">{user.displayName}</p>}
                    {user.email && <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</p>}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full justify-start px-4 py-3" onClick={handleSignOut}> {/* Adjusted style */}
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/signin" className="w-full">
                  <Button variant="outline" size="sm" className="w-full justify-center"> {/* Adjusted style */}
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" className="w-full">
                  <Button size="sm" className="w-full justify-center"> {/* Adjusted style */}
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;