'use client';

/**
 * Navbar — Responsive navigation with glassmorphism and mobile sheet.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Mountain,
  Search,
  Menu,
  Sun,
  Moon,
  Heart,
  Plus,
  LogOut,
  User,
  LayoutDashboard,
  Map,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/hikes', label: 'Randonnées', icon: Mountain },
  { href: '/map', label: 'Carte', icon: Map },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isTransparent = pathname === '/' && !scrolled;

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        isTransparent
          ? 'bg-transparent'
          : 'glass border-b border-border/50 shadow-sm',
      )}
    >
      <div className="container-wide">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-emerald-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-shadow">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <span className={cn(
              'font-bold text-xl hidden sm:block transition-colors',
              isTransparent ? 'text-white' : 'text-gradient-brand'
            )}>
              Hikely
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname.startsWith(link.href)
                    ? 'bg-primary/10 text-primary'
                    : isTransparent
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link
              href="/hikes?focus=search"
              className={cn(
                'p-2 rounded-lg transition-all',
                isTransparent
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={cn(
                'p-2 rounded-lg transition-all',
                isTransparent
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
              aria-label="Changer le thème"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth */}
            {session?.user ? (
              <div className="flex items-center gap-2">
                {/* Favorites */}
                <Link
                  href="/favorites"
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    isTransparent
                      ? 'text-white/70 hover:text-red-400 hover:bg-white/10'
                      : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30',
                  )}
                  aria-label="Favoris"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* New hike button */}
                <Button
                  asChild
                  size="sm"
                  className="hidden md:flex bg-primary hover:bg-primary/90"
                >
                  <Link href="/dashboard/my-hikes/new">
                    <Plus className="w-4 h-4 mr-1" />
                    Nouvelle rando
                  </Link>
                </Button>

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-all">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={session.user.image ?? undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                          {session.user.name?.[0]?.toUpperCase() ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        'text-sm font-medium hidden sm:block',
                        isTransparent ? 'text-white' : ''
                      )}>
                        {session.user.name}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${(session.user as any).username}`} className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Mon profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favorites" className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Favoris
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="text-destructive flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn(
                    isTransparent && 'text-white/90 hover:text-white hover:bg-white/10'
                  )}
                >
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="hidden sm:flex bg-primary hover:bg-primary/90"
                >
                  <Link href="/register">S&apos;inscrire</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className={cn(
                    'md:hidden p-2 rounded-lg transition-all',
                    isTransparent
                      ? 'text-white/70 hover:bg-white/10'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-1 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                        pathname.startsWith(link.href)
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                      )}
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  ))}

                  {session?.user && (
                    <>
                      <div className="h-px bg-border my-2" />
                      <Link
                        href="/dashboard/my-hikes/new"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                        Nouvelle randonnée
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
