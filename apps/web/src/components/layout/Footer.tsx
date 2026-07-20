import Link from 'next/link';
import { Mountain, Github } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  produit: [
    { href: '/hikes', label: 'Randonnées' },
    { href: '/map', label: 'Carte' },
    { href: '/regions', label: 'Régions' },
  ],
  communaute: [
    { href: '/register', label: "S'inscrire" },
    { href: '/login', label: 'Se connecter' },
  ],
  legal: [
    { href: '/privacy', label: 'Confidentialité' },
    { href: '/terms', label: "Conditions d'utilisation" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container-wide py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-emerald-700 rounded-lg flex items-center justify-center">
                <Mountain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Hikely</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La plateforme communautaire de randonnée open-source et auto-hébergeable.
            </p>
          </div>

          {/* Produit */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Produit</h3>
            <ul className="space-y-2">
              {footerLinks.produit.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Communauté */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Communauté</h3>
            <ul className="space-y-2">
              {footerLinks.communaute.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Légal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Hikely. Open source et libre.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
