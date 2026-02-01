'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Logic to exclude shell on Auth pages
    const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(pathname);

    // State for Sidebar
    // Default open on desktop, closed on mobile
    const [opened, { toggle }] = useDisclosure(true);
    const isMobile = useMediaQuery('(max-width: 768px)') || false;

    // If we are on mobile, "opened" means the drawer is showing.
    // If we are on desktop, "opened" means full width (250px), !opened means rail (80px).

    const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);

    if (isAuthPage) {
        return <>{children}</>;
    }

    // Dynamic margin calculation based on state
    // Desktop:
    //   - Open: ml-64 (256px)
    //   - Closed: ml-20 (80px)
    // Mobile:
    //   - Always ml-0
    const mainContentMargin = isMobile ? 'ml-0' : (opened ? 'ml-64' : 'ml-20');

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <Sidebar
                opened={isMobile ? mobileOpened : opened}
                toggle={isMobile ? toggleMobile : toggle}
                isMobile={isMobile}
                closeMobile={closeMobile}
            />

            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${mainContentMargin}`}>
                <Header
                    opened={isMobile ? mobileOpened : opened}
                    toggle={isMobile ? toggleMobile : toggle}
                />

                <main className="p-4 md:p-8 flex-1">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {isMobile && mobileOpened && (
                <div
                    className="fixed inset-0 bg-black/50 z-20"
                    onClick={closeMobile}
                />
            )}
        </div>
    );
}
