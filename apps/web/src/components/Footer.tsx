"use client";

import React, { FC } from "react";
import Link from "next/link";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";

const Footer: FC = () => {
    const footerLinks = [
        {
            title: "Product",
            links: [
                { label: "Features", href: "/#features" },
                { label: "Pricing", href: "/#pricing" },
                { label: "FAQ", href: "/#faq" },
            ]
        },
        {
            title: "Resources",
            links: [
                { label: "All Notes", href: "/notes/all" },
                { label: "New Note", href: "/notes/new" },
                { label: "My Dashboard", href: "/notes" },
            ]
        },
        {
            title: "Company",
            links: [
                { label: "Home", href: "/" },
                { label: "Login", href: "/login" },
                { label: "Register", href: "/register" },
            ]
        }
    ];

    const socialLinks = [
        {
            label: "GitHub",
            href: "https://github.com/AryanKumarOfficial/quiljs-demo",
            icon: <FaGithub className="w-5 h-5" />
        },
        {
            label: "Twitter",
            href: "https://x.com/_aryankofficial",
            icon: <FaTwitter className="w-5 h-5" />
        },
        {
            label: "LinkedIn",
            href: "https://www.linkedin.com/in/aryankumarofficial/",
            icon: <FaLinkedin className="w-5 h-5" />
        }
    ];

    return (
        <footer className="bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800/60 text-gray-300">
            <Container className="py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand column */}
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2 group">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
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
                            </div>
                            <div className="relative">
                                <h1 className="text-white text-xl font-bold">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">Rich</span>
                                    <span className="text-gray-200">Text</span>
                                </h1>
                            </div>
                        </Link>
                        
                        <p className="mt-4 text-slate-400 text-sm max-w-xs">
                            A beautiful, modern rich text editor built with Next.js, 
                            tailored for efficient note-taking and collaboration.
                        </p>
                        
                        {/* Social links */}
                        <div className="flex gap-4 mt-6">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 hover:text-blue-400 transition-colors duration-200"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                    
                    {/* Footer link columns */}
                    {footerLinks.map((column) => (
                        <div key={column.title}>
                            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                                {column.title}
                            </h3>
                            <ul className="space-y-2">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <Link 
                                            href={link.href} 
                                            className="text-slate-400 hover:text-white transition-colors duration-200 text-sm inline-flex items-center"
                                        >
                                            <span className="relative hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-blue-500 hover:after:rounded-full">
                                                {link.label}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                
                {/* Bottom bar */}
                <div className="mt-12 pt-6 border-t border-slate-800/60 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <p className="text-sm text-slate-500">
                            © {new Date().getFullYear()} Doxie by Aaryan Kumar. All rights reserved.
                        </p>
                    </div>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="text-sm text-slate-500 flex items-center"
                    >
                        <span role="img" aria-label="love" className="inline-block mx-1 text-red-500">❤️</span> 
                        Built with passion
                    </motion.div>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
