'use client';

import React, { useState } from 'react';
import { NavLink, Text, Tooltip, ScrollArea as MantineScrollArea, ScrollAreaProps, rem, UnstyledButton, Group as MantineGroup, GroupProps, Collapse as MantineCollapse, CollapseProps, Box, ActionIcon } from '@mantine/core';
import {
    IconLayoutDashboard,
    IconUsers,
    IconUserShield,
    IconSettings,
    IconWallet,
    IconChevronRight,
    IconChevronLeft,
    IconChevronDown,
    IconMenu2
} from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';

// Fix for React 19 type incompatibility
const Group = MantineGroup as React.FC<GroupProps & { children?: React.ReactNode }>;
const Collapse = MantineCollapse as React.FC<CollapseProps & { children?: React.ReactNode }>;
const ScrollArea = MantineScrollArea as React.FC<ScrollAreaProps & { children?: React.ReactNode; className?: string }>;

interface SidebarProps {
    opened: boolean;
    toggle: () => void;
    isMobile: boolean;
    closeMobile: () => void;
}

interface NavItem {
    label: string;
    icon: React.ElementType;
    link?: string;
    initiallyOpened?: boolean;
    links?: { label: string; link: string }[];
}

const mockData: NavItem[] = [
    { label: 'Dashboard', icon: IconLayoutDashboard, link: '/' },
    { label: 'User Management', icon: IconUsers, link: '/users' },
    { label: 'Payments', icon: IconWallet, link: '/payments' },
    { label: 'Employee Management', icon: IconUserShield, link: '/employees' },
    { label: 'Settings', icon: IconSettings, link: '/settings' },
];

export function Sidebar({ opened, toggle, isMobile, closeMobile }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Track open sub-menus
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    const handleSubMenuToggle = (label: string) => {
        if (!opened && !isMobile) {
            // If collapsed, opening a submenu should probably expand the sidebar or be handled via popover (complex).
            // For this implementation, let's auto-expand the sidebar if a user tries to interact with a complex item, or just toggle.
            toggle(); // Auto-expand sidebar
        }
        setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const handleNavigate = (link: string) => {
        router.push(link);
        if (isMobile) closeMobile();
    };

    const links = mockData.map((item) => {
        const hasLinks = Array.isArray(item.links);
        const Icon = item.icon;

        // Active state logic
        const isActive = item.link === pathname || item.links?.some(sub => sub.link === pathname);
        const isSubOpen = openMenus[item.label] || false;

        if (hasLinks) {
            return (
                <div key={item.label}>
                    <Tooltip label={item.label} position="right" disabled={opened} transitionProps={{ duration: 0 }}>
                        <UnstyledButton
                            onClick={() => handleSubMenuToggle(item.label)}
                            className={`w-full p-2.5 rounded-lg mb-1 flex items-center justify-between transition-all duration-200
                                ${isActive ? 'bg-white text-[#1e40af] shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                        >
                            <Group gap={0}>
                                <Icon size={20} stroke={1.5} />
                                {opened && <Text size="sm" className="ml-3.5 font-bold">{item.label}</Text>}
                            </Group>
                            {opened && (
                                <IconChevronDown
                                    size={14}
                                    className={`transition-transform duration-200 ${isActive ? 'opacity-100' : 'opacity-60'} ${isSubOpen ? 'rotate-180' : ''}`}
                                />
                            )}
                        </UnstyledButton>
                    </Tooltip>

                    {/* Sub-menu items */}
                    <Collapse in={isSubOpen && opened}>
                        <div className="pl-9 pr-2 pb-2 space-y-0.5">
                            {item.links?.map((subItem) => (
                                <UnstyledButton
                                    key={subItem.link}
                                    onClick={() => handleNavigate(subItem.link)}
                                    className={`w-full py-2 px-3 rounded-md text-xs block transition-all
                                        ${pathname === subItem.link
                                            ? 'bg-white/20 text-white font-bold'
                                            : 'text-white/60 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {subItem.label}
                                </UnstyledButton>
                            ))}
                        </div>
                    </Collapse>
                </div>
            );
        }

        return (
            <Tooltip key={item.label} label={item.label} position="right" disabled={opened} transitionProps={{ duration: 0 }}>
                <UnstyledButton
                    onClick={() => handleNavigate(item.link!)}
                    className={`w-full p-2.5 rounded-lg mb-1 flex items-center transition-all duration-200
                        ${pathname === item.link ? 'bg-white text-[#1e40af] shadow-md font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                >
                    <Icon size={20} stroke={1.5} />
                    {opened && <Text size="sm" className="ml-3.5">{item.label}</Text>}
                </UnstyledButton>
            </Tooltip>
        );
    });

    return (
        <nav
            className={`bg-[#1e40af] h-screen fixed left-0 top-0 z-30 transition-all duration-300 flex flex-col shadow-2xl
            ${opened ? 'w-64' : 'w-20'} ${isMobile ? (opened ? 'translate-x-0' : '-translate-x-full') : ''}`}
        >
            {/* Header / Logo */}
            <div className={`h-16 flex items-center transition-all duration-300 ${opened ? 'px-6 justify-between' : 'justify-center px-0'}`}>
                {opened ? (
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="min-w-[32px] w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm shadow-inner">
                            <Box className="w-4 h-4 rounded-full bg-white shadow-sm" />
                        </div>
                        <Text
                            className="text-xl font-bold tracking-tight text-white whitespace-nowrap"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            CoreManage
                        </Text>
                    </div>
                ) : (
                    <ActionIcon variant="transparent" className="text-white hover:bg-white/10 transition-colors" onClick={toggle} size="lg">
                        <IconMenu2 size={24} />
                    </ActionIcon>
                )}

                {opened && !isMobile && (
                    <ActionIcon variant="transparent" className="text-white/60 hover:text-white" onClick={toggle} size="sm">
                        <IconChevronLeft size={20} />
                    </ActionIcon>
                )}
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 p-3">
                <div className="space-y-1">
                    {links.map((link, index) => {
                        // Re-styling the generated links in a mapping would be cleaner, 
                        // but let's assume 'links' variable is already mapped correctly above.
                        // Wait, 'links' is a JSX array. I should probably adjust the mapping logic itself.
                        return link;
                    })}
                </div>
            </ScrollArea>

            {/* Collapse Toggle for Desktop (Footer) - Removed redundant toggle */}
            {!isMobile && !opened && (
                <div className="p-3 border-t border-white/10 flex justify-center opacity-0 pointer-events-none h-0 p-0 overflow-hidden">
                </div>
            )}
        </nav>
    );
}
