import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '/features' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Case Studies', href: '/case-studies' },
        { name: 'Reviews', href: '/reviews' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'Careers', href: '/careers' },
        { name: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Guides', href: '/guides' },
        { name: 'Webinars', href: '/webinars' },
        { name: 'Community', href: '/community' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy', href: '/privacy' },
        { name: 'Terms', href: '/terms' },
        { name: 'Security', href: '/security' },
        { name: 'Cookie Policy', href: '/cookies' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com' },
    { icon: Twitter, href: 'https://twitter.com' },
    { icon: Instagram, href: 'https://instagram.com' },
    { icon: Linkedin, href: 'https://linkedin.com' },
  ];

  return (
    <footer className="bg-background border-t">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-brand flex items-center justify-center">
                <span className="text-white font-semibold">B</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © {currentYear} BrandSync. All rights reserved.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.href}
                  href={social.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 