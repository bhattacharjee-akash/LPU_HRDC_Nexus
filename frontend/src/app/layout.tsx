"use client";

import { useEffect } from 'react';
import '@/styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Register PWA service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('PWA ServiceWorker registered: ', registration.scope);
          })
          .catch((error) => {
            console.error('PWA ServiceWorker registration failed: ', error);
          });
      });
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <title>LPU HRDC Nexus - AI-Powered Training Lifecycle Platform</title>
        <meta name="description" content="Enterprise-grade training ecosystem for Lovely Professional University Human Resource Development Center." />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
