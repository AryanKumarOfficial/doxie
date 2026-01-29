"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { GradientButton } from "@/components/ui/gradient-button";
import { motion, AnimatePresence } from "framer-motion";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import GlobalSearch from "./GlobalSearch";

// Define breakpoints for responsive design
const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
};

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const isAuthenticated = status === 'authenticated';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setScrolled(offset > 10);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // Close mobile menu when window is resized past the breakpoint
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) { // md breakpoint
                setMobileMenuOpen(false);
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        { 
            label: "Home", 
            href: "/",
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        { 
            label: "My Notes", 
            href: "/notes",
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            showOnlyWhenAuthenticated: true
        },
        { 
            label: "New Note", 
            href: "/notes/new",
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
            showOnlyWhenAuthenticated: true
        },
    ];

    // Get first letter of name for avatar fallback
    const getInitials = () => {
        if (session?.user?.name) {
            return session.user.name.charAt(0).toUpperCase();
        }
        if (session?.user?.email) {
            return session.user.email.charAt(0).toUpperCase();
        }
        return "U";
    };

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/login');
        router.refresh();
    };

    return (
        <div 
            className={`${scrolled ? 'shadow-lg shadow-blue-900/20' : ''} 
                transition-all duration-300 border-b 
                ${scrolled ? 'border-slate-800/80 backdrop-blur-xl bg-slate-900/85' : 'border-slate-800/50 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950'} 
                sticky top-0 z-40`}
        >
            <Container>
                <div className="flex h-16 items-center justify-between py-6">
                    {/* Logo */}
                    <Link href="/" className="group flex items-center gap-2">
                        <motion.div 
                            initial={{ rotate: -10, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg group-hover:from-blue-500 group-hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-blue-500/20 ring-1 ring-white/10"
                        >
                            <svg
                                className="w-5 h-5 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M14 3V7C14 7.26522 14.1054 7.51957 14.2929 7.70711C14.4804 7.89464 14.7348 8 15 8H19"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H14L19 8V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M9 7H10M9 13H15M9 17H15"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </motion.div>
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="relative"
                        >
                            <h1 className="text-white text-xl font-bold">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:from-blue-400 group-hover:to-indigo-400 transition-all duration-300">Rich</span>
                                <span className="text-gray-200 group-hover:text-white transition-colors duration-300">Text</span>
                            </h1>
                            <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </motion.div>
                    </Link>
                    
                    {/* Desktop & Tablet Navigation */}
                    <div className="hidden md:flex gap-3 lg:gap-6 items-center">
                        {navItems
                            .filter(item => !item.showOnlyWhenAuthenticated || (item.showOnlyWhenAuthenticated && isAuthenticated))
                            .map((item, index) => {
                                const isActive = pathname === item.href;
                                return (
                                    <motion.div
                                        key={item.href}
                                        initial={{ y: -10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.1 * index }}
                                    >
                                        <Link
                                            href={item.href}
                                            className={`relative group flex items-center gap-1.5 px-2 lg:px-3 py-2 rounded-md transition-all duration-200 ${
                                                isActive 
                                                ? "text-white bg-slate-800/90 shadow-md shadow-blue-500/10 ring-1 ring-white/5" 
                                                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                                            }`}
                                        >
                                            <span className={`transition-colors duration-200 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'}`}>
                                                {item.icon}
                                            </span>
                                            <span className="text-sm font-medium">{item.label}</span>
                                            {isActive && (
                                                <motion.span 
                                                    className="absolute bottom-0 left-0 right-0 mx-auto w-4/5 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                                    layoutId="navbar-indicator"
                                                />
                                            )}
                                        </Link>
                                    </motion.div>
                                );
                            })}
                    </div>

                    {/* Global Search - Only show when authenticated */}
                    {isAuthenticated && (
                        <div className="hidden md:block mx-4 flex-1 max-w-md">
                            <GlobalSearch />
                        </div>
                    )}

                    {/* Mobile Menu Button with animated hamburger */}
                    <div className="flex md:hidden">
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-expanded={mobileMenuOpen}
                            aria-label="Toggle menu"
                            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        >
                            <div className="w-6 h-5 relative flex flex-col justify-between">
                                <span 
                                    className={`w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${
                                        mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                                    }`}
                                />
                                <span 
                                    className={`w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${
                                        mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                                    }`}
                                />
                                <span 
                                    className={`w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${
                                        mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                                    }`}
                                />
                            </div>
                        </button>
                    </div>

                    {/* User Controls */}
                    <div className="hidden md:flex items-center gap-2 lg:gap-4">
                        {isAuthenticated ? (
                            <>
                                <HoverCard openDelay={100} closeDelay={100}>
                                    <HoverCardTrigger asChild>
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.3, delay: 0.3 }}
                                            className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-slate-800/80 to-slate-700/50 hover:from-slate-700/80 hover:to-slate-600/50 px-3 py-1.5 rounded-full transition-all duration-200 shadow-md shadow-blue-900/10 ring-1 ring-white/10"
                                        >
                                            <Avatar className="h-6 w-6 border-2 border-blue-500/80 ring-2 ring-blue-500/20">
                                                <AvatarImage src={session?.user?.image || ''} />
                                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-xs">
                                                    {getInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="hidden lg:inline text-sm font-medium text-white">
                                                {session?.user?.name?.split(' ')[0] || session?.user?.email?.split('@')[0] || 'User'}
                                            </span>
                                            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none">
                                                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </motion.div>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-64 p-3 bg-slate-900/95 border border-slate-700 shadow-xl shadow-blue-900/30 backdrop-blur-lg rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-blue-500 ring-2 ring-blue-500/20">
                                                <AvatarImage src={session?.user?.image || ''} />
                                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                                                    {getInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    {session?.user?.name || session?.user?.email}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {session?.user?.email}
                                                </p>
                                                <Badge variant="outline" className="mt-1 text-xs text-blue-400 border-blue-500/30 bg-blue-900/20">Member</Badge>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-slate-700/50 grid grid-cols-1 gap-2">
                                            <GradientButton 
                                                onClick={handleSignOut} 
                                                variant="destructive"
                                                size="sm"
                                                className="w-full"
                                            >
                                                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                                    <polyline points="16 17 21 12 16 7" />
                                                    <line x1="21" y1="12" x2="9" y2="12" />
                                                </svg>
                                                Logout
                                            </GradientButton>
                                        </div>
                                    </HoverCardContent>
                                </HoverCard>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 lg:gap-3">
                                <motion.div 
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 0.3 }}
                                >
                                    <Button 
                                        asChild 
                                        variant="outline" 
                                        className="text-white border-slate-700/80 hover:bg-slate-800 hover:text-white focus:ring-2 focus:ring-blue-500/40"
                                        size="sm"
                                    >
                                        <Link href="/login" className="flex items-center gap-1">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                                            </svg>
                                            <span className="hidden lg:inline">Login</span>
                                        </Link>
                                    </Button>
                                </motion.div>
                                <motion.div 
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 0.4 }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <GradientButton 
                                        asChild
                                        size="sm"
                                        className="shadow-md shadow-blue-600/20"
                                    >
                                        <Link href="/register" className="flex items-center gap-1">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                                <circle cx="8.5" cy="7" r="4" />
                                                <line x1="20" y1="8" x2="20" y2="14" />
                                                <line x1="23" y1="11" x2="17" y2="11" />
                                            </svg>
                                            <span className="hidden lg:inline">Register</span>
                                        </Link>
                                    </GradientButton>
                                </motion.div>
                            </div>
                        )}
                    </div>
                </div>
            </Container>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="md:hidden border-t border-slate-800/60 bg-slate-900/95 backdrop-blur-lg shadow-lg shadow-slate-900/20"
                    >
                        <Container>
                            <div className="py-4 space-y-2">
                                {/* Show search in mobile menu too */}
                                {isAuthenticated && (
                                    <div className="px-2 py-3 mb-2">
                                        <GlobalSearch />
                                    </div>
                                )}
                                
                                {navItems
                                    .filter(item => !item.showOnlyWhenAuthenticated || (item.showOnlyWhenAuthenticated && isAuthenticated))
                                    .map((item, index) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <motion.div
                                                key={item.href}
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Link
                                                    href={item.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
                                                        isActive 
                                                            ? "bg-gradient-to-r from-slate-800 to-slate-800/80 text-white shadow-sm shadow-blue-500/10 ring-1 ring-white/5" 
                                                            : "text-slate-300 hover:bg-slate-800/40 hover:text-white"
                                                    }`}
                                                >
                                                    <span className={`${isActive ? 'text-blue-400' : 'text-slate-400'}`}>
                                                        {item.icon}
                                                    </span>
                                                    <span className="font-medium">{item.label}</span>
                                                    {isActive && (
                                                        <motion.span
                                                            layoutId="mobile-navbar-indicator"
                                                            className="ml-auto h-full w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500"
                                                        />
                                                    )}
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                
                                {isAuthenticated ? (
                                    <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-4">
                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-lg ring-1 ring-white/5">
                                            <Avatar className="h-10 w-10 border-2 border-blue-500/80 ring-2 ring-blue-500/20">
                                                <AvatarImage src={session?.user?.image || ''} />
                                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-xs">
                                                    {getInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    {session?.user?.name || session?.user?.email}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {session?.user?.email}
                                                </p>
                                                <Badge variant="outline" className="mt-1 text-xs text-blue-400 border-blue-500/30 bg-blue-900/20">Member</Badge>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2">
                                            <GradientButton 
                                                onClick={handleSignOut} 
                                                variant="destructive"
                                                size="sm"
                                                className="w-full"
                                            >
                                                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                                    <polyline points="16 17 21 12 16 7" />
                                                    <line x1="21" y1="12" x2="9" y2="12" />
                                                </svg>
                                                Logout
                                            </GradientButton>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 pt-4 border-t border-slate-700/50 px-4 py-3 space-y-3">
                                        <Button 
                                            asChild 
                                            variant="outline" 
                                            className="w-full text-white border-slate-700/80 hover:bg-slate-800 hover:text-white flex items-center justify-center gap-1.5"
                                            size="sm"
                                        >
                                            <Link href="/login">
                                                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                                                </svg>
                                                Login
                                            </Link>
                                        </Button>
                                        <GradientButton 
                                            asChild
                                            size="sm"
                                            className="w-full flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
                                        >
                                            <Link href="/register">
                                                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                                    <circle cx="8.5" cy="7" r="4" />
                                                    <line x1="20" y1="8" x2="20" y2="14" />
                                                    <line x1="23" y1="11" x2="17" y2="11" />
                                                </svg>
                                                Register
                                            </Link>
                                        </GradientButton>
                                    </div>
                                )}
                            </div>
                        </Container>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
