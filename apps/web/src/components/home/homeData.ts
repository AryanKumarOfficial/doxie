import { ReactNode } from 'react';

// Statistics data
export const statistics = [
  {
    value: "10M+",
    label: "Notes Created",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
  },
  {
    value: "250K+",
    label: "Active Users",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
  },
  {
    value: "99.9%",
    label: "Uptime",
    icon: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
  },
  {
    value: "5⭐",
    label: "Average Rating",
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
  }
];

// Feature data
export const features = [
  {
    title: "Rich Text Editor",
    description: "Full formatting options including headings, lists, tables, and more with our advanced editor.",
    icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
  },
  {
    title: "Markdown Support",
    description: "Write in markdown and see real-time preview with syntax highlighting for code snippets.",
    icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
  },
  {
    title: "Cloud Synchronization",
    description: "Access your notes from any device with real-time syncing and offline capabilities.",
    icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
  },
  {
    title: "Folder Organization",
    description: "Keep your notes organized with folders, tags, and smart filters for quick access.",
    icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
  },
  {
    title: "Collaboration Tools",
    description: "Share notes with others and collaborate in real-time with commenting and edit suggestions.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
  },
  {
    title: "Advanced Search",
    description: "Find anything instantly with our powerful full-text search across all your notes and attachments.",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
  }
];

// Timeline data
export const timelineSteps = [
  {
    title: "Create an Account",
    description: "Sign up for free in seconds with your email or social accounts.",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
  },
  {
    title: "Create Your First Note",
    description: "Start writing with our beautiful editor and save automatically to the cloud.",
    icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
  },
  {
    title: "Organize with Folders",
    description: "Create folders and tags to keep your notes structured and easy to find.",
    icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
  },
  {
    title: "Access Anywhere",
    description: "Sync across all your devices and access your notes from anywhere, anytime.",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
  }
];

// Testimonial data
export const testimonials = [
  {
    quote: "This note app completely transformed how I organize my research. The cloud sync is seamless!",
    author: "Sarah Johnson",
    position: "PhD Researcher",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    posX: "5%",
    posY: "10%"
  },
  {
    quote: "I use this daily for work and personal projects. The multiple editor options are exactly what I needed.",
    author: "Michael Chen",
    position: "Software Developer",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    posX: "60%",
    posY: "5%"
  },
  {
    quote: "Sharing notes with my team has never been easier. We've completely replaced our old workflow.",
    author: "Emily Rodriguez",
    position: "Project Manager",
    image: "https://randomuser.me/api/portraits/women/22.jpg",
    posX: "20%",
    posY: "55%"
  },
  {
    quote: "The markdown support is fantastic. As a technical writer, this has been a game changer.",
    author: "David Kim",
    position: "Technical Writer",
    image: "https://randomuser.me/api/portraits/men/68.jpg",
    posX: "70%",
    posY: "60%"
  }
];

// FAQ data
export const faqItems = [
  {
    question: "What types of notes can I create?",
    answer: "We support three different note formats: rich text editing with our advanced editor, markdown notes with live preview, and simple plain text notes. You can choose the format that best suits your needs for each note."
  },
  {
    question: "How can I organize my notes?",
    answer: "You can organize notes using folders, tags, and our powerful filtering system. Pin important notes to keep them at the top, mark favorites for quick access, and use our global search to find anything instantly."
  },
  {
    question: "Can I share my notes with others?",
    answer: "Yes! You can share individual notes with others. The app allows you to make notes public or share them directly with specific users."
  },
  {
    question: "Is there a search function available?",
    answer: "Absolutely. Our powerful global search allows you to search across all your notes. You can also filter notes by type, tags, folders, and other criteria to find exactly what you're looking for."
  },
  {
    question: "Can I access my notes on different devices?",
    answer: "Yes, all your notes are securely stored in the cloud and synchronized across all your devices. Just log in to your account from any browser to access your complete note collection."
  },
  {
    question: "How do I create a new note?",
    answer: "Simply click on the 'New Note' button either on your dashboard or in the notes section. You'll be able to choose between rich text, markdown, or plain text formats for your new note."
  }
];

// Pricing data
export const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for personal use and getting started",
    features: [
      "Up to 100 notes",
      "Basic formatting",
      "5 folders",
      "Mobile and web access",
      "1GB storage",
      "Export as PDF"
    ],
    isPopular: false,
    buttonText: "Get Started",
    buttonVariant: "outline"
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "Everything you need for serious note-taking",
    features: [
      "Unlimited notes",
      "Advanced formatting",
      "Unlimited folders",
      "All platforms access",
      "20GB storage",
      "Collaboration with 5 users",
      "Version history (30 days)",
      "Priority support"
    ],
    isPopular: true,
    buttonText: "Start Free Trial",
    buttonVariant: "default"
  },
  {
    name: "Team",
    price: "$19.99",
    period: "/month",
    description: "Collaborate with your entire team seamlessly",
    features: [
      "Everything in Pro",
      "Unlimited collaborators",
      "50GB storage",
      "Admin controls",
      "Advanced permissions",
      "Version history (90 days)",
      "SSO integration",
      "Priority support with dedicated manager"
    ],
    isPopular: false,
    buttonText: "Contact Sales",
    buttonVariant: "outline"
  }
];

// Feature comparison table data
export const featureTableRows = [
  { name: "Number of Notes", free: "100", pro: "Unlimited", team: "Unlimited" },
  { name: "Storage", free: "1GB", pro: "20GB", team: "50GB" },
  { name: "Rich Text Editor", free: true, pro: true, team: true },
  { name: "Markdown Support", free: true, pro: true, team: true },
  { name: "Mobile Access", free: true, pro: true, team: true },
  { name: "Offline Mode", free: true, pro: true, team: true },
  { name: "Version History", free: false, pro: "30 days", team: "90 days" },
  { name: "Search Inside Images", free: false, pro: true, team: true },
  { name: "AI Note Suggestions", free: false, pro: true, team: true },
  { name: "Team Collaboration", free: false, pro: "Up to 5", team: "Unlimited" },
  { name: "Admin Dashboard", free: false, pro: false, team: true },
  { name: "Advanced Permissions", free: false, pro: false, team: true },
  { name: "Real-time Collaboration", free: false, pro: true, team: true },
  { name: "API Access", free: false, pro: false, team: true },
  { name: "Priority Support", free: false, pro: true, team: true }
];