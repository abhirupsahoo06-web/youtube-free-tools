# YouTube Free Tools (Version 1)

> **Free Tools for YouTube Creators**  
> Simple, fast and free tools to help creators grow, optimize and manage their YouTube content.

A modern, responsive SaaS-style web platform designed for YouTube creators. Built with a modular component architecture so each upcoming creator utility can be plugged in seamlessly.

---

## 🚀 Version 1 Scope

This release establishes the core platform shell, visual branding, responsive layout, and navigation:

* **Brand Identity**: Modern creator-centric visual direction inspired by YouTube (deep slate, obsidian black, vibrant YouTube red accents, crisp typography).
* **Navigation Bar**: Sticky top header with brand logo, smooth navigation anchors (`Home`, `Tools`, `About`), mobile drawer menu, and quick CTA.
* **Hero Section**:
  * Heading: *"Free Tools for YouTube Creators"*
  * Subheading: *"Simple, fast and free tools to help creators grow, optimize and manage their YouTube content."*
  * Call to Action: *“Explore Tools”* with smooth scroll to the Tools section.
  * SaaS preview shell illustrating future creator workflows.
* **Tools Section**:
  * Section Title: *"YouTube Free Tools"*
  * Placeholder State: *"Powerful creator tools are coming soon."*
  * Curated non-functional preview cards labeled **"Coming Soon"** highlighting upcoming creator utilities.
* **About Section**:
  * Core mission: *"YouTube Free Tools is a free creator-focused platform designed to bring useful YouTube utilities into one simple website."*
  * Key platform values: 100% Free Forever, Fast & Browser-Native, Creator-Centric Focus, Privacy & Security.
* **Footer & Modals**:
  * Brand tagline *"Free tools for creators"*.
  * Accessible interactive modals for *Privacy Policy*, *Terms of Service*, and *Contact & Inquiries*.
  * Independent creator project legal disclaimer.

---

## 🛠️ Architecture & Project Structure

```
├── public/
│   └── favicon.svg           # Brand SVG icon
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   └── Logo.tsx      # Reusable brand logo component
│   │   ├── layout/
│   │   │   ├── Header.tsx    # Sticky navigation with mobile menu
│   │   │   └── Footer.tsx    # Semantic footer with legal links
│   │   ├── modals/
│   │   │   └── InfoModal.tsx # Accessible modal for Privacy, Terms & Contact
│   │   └── sections/
│   │       ├── HeroSection.tsx   # SaaS hero with CTA
│   │       ├── ToolsSection.tsx  # Tools directory & Coming Soon placeholders
│   │       └── AboutSection.tsx  # Mission statement & value pillars
│   ├── config/
│   │   ├── siteConfig.ts     # Centralized brand copy & nav links
│   │   └── toolsRegistry.ts  # Registry for tools and upcoming utilities
│   ├── types/
│   │   └── index.ts          # Strongly typed interfaces
│   ├── App.tsx               # Main application container
│   ├── index.css             # Tailwind v4 styles, glassmorphism & themes
│   └── main.tsx              # React DOM entry point
├── package.json
└── vite.config.ts
```

---

## 🧩 Extending with Future Tools

The codebase is built specifically for modular expansion:

1. **Register the tool metadata** in `src/config/toolsRegistry.ts`.
2. **Create your tool component** in `src/components/tools/<YourTool>.tsx`.
3. **Change status** from `'coming_soon'` to `'active'`.

---

## 💻 Development & Build Scripts

```bash
# Start the local development server
pnpm dev

# Typecheck and build for production
pnpm build

# Preview production build locally
pnpm preview

# Run the linter
pnpm lint
```
