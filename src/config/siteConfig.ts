import type { NavItem } from '../types'

export const SITE_CONFIG = {
  name: 'YouTube Free Tools',
  tagline: 'Free Tools for YouTube Creators',
  subheading: 'Simple, fast and free tools to help creators grow, optimize and manage their YouTube content.',
  description: 'YouTube Free Tools is a free creator-focused platform designed to bring useful YouTube utilities into one simple website.',
  navItems: [
    { label: 'Home', href: '#home' },
    { label: 'Tools', href: '#tools' },
    { label: 'About', href: '#about' },
  ] as NavItem[],
  footerLinks: {
    product: [
      { label: 'Home', href: '#home' },
      { label: 'Explore Tools', href: '#tools' },
      { label: 'About Us', href: '#about' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Service', href: '#terms' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  disclaimer: 'YouTube Free Tools is an independent creator utility project and is not endorsed by, affiliated with, or officially associated with YouTube, Google LLC, or Alphabet Inc. YouTube is a registered trademark of Google LLC.',
}
