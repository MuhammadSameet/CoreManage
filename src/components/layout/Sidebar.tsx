'use client';

import React, { useState } from 'react';
import { Text, Tooltip, ScrollArea as MantineScrollArea, UnstyledButton, Group as MantineGroup, Collapse as MantineCollapse, Box, ActionIcon } from '@mantine/core';
import {
    IconLayoutDashboard,
    IconUsers,
    IconChevronLeft,
    IconChevronDown,
    IconMenu2,
    IconSettings
} from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const Group = MantineGroup;
const Collapse = MantineCollapse;
const ScrollArea = MantineScrollArea;

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

// Role: user → User Dashboard + Settings. Role: admin | employee → all items + Settings
function getSidebarData(role: string): NavItem[] {
    const roleLower = (role || 'user').toLowerCase();

    if (roleLower === 'user') {
        return [
            { label: 'User Dashboard', icon: IconLayoutDashboard, link: '/users/detail' },
            { label: 'Settings', icon: IconSettings, link: '/settings' },
        ];
    }

    return [
        { label: 'Dashboard', icon: IconLayoutDashboard, link: '/users' },
        {
            label: 'User Management',
            icon: IconUsers,
            initiallyOpened: false,
            links: [
                { label: 'Users Directory', link: '/users' },
                { label: 'Roles & Permissions', link: '/users/roles' },
                { label: 'Search Users', link: '/users/search' },
                { label: 'Upload Entry', link: '/users/uploadentry' },
                { label: 'Collection Report', link: '/users/report' },
                { label: 'Collections', link: '/users/collections' },
            ]
        },
        { label: 'Settings', icon: IconSettings, link: '/settings' },
    ];
}

export function Sidebar({ opened, toggle, isMobile, closeMobile }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated } = useSelector((state: RootState) => state.authStates);
    const role = (isAuthenticated?.role as string) || 'user';
    const mockData = getSidebarData(role);

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
                            className={`w-full py-3 px-3 rounded-xl mb-1.5 flex items-center justify-between
                                ${isActive ? 'bg-white text-[#1e40af] shadow-md font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                            style={{ fontSize: 'var(--text-sm)' }}
                        >
                            <Group gap={0}>
                                <Icon size={20} stroke={1.5} />
                                {opened && <Text size="sm" className="ml-3 font-semibold" style={{ fontSize: 'var(--text-sm)' }}>{item.label}</Text>}
                            </Group>
                            {opened && (
                                <IconChevronDown
                                    size={14}
                                    className={`${isSubOpen ? 'rotate-180' : ''}`}
                                />
                            )}
                        </UnstyledButton>
                    </Tooltip>

                    <Collapse in={isSubOpen && opened}>
                        <div className="pl-10 pr-2 pb-3 pt-0.5 space-y-0.5 relative before:content-[''] before:absolute before:left-5 before:top-0 before:bottom-2 before:w-px before:bg-white/25">
                            {item.links?.map((subItem) => {
                                const subActive = pathname === subItem.link;
                                return (
                                    <UnstyledButton
                                        key={subItem.label}
                                        onClick={() => handleNavigate(subItem.link)}
                                        className={`w-full py-2.5 px-4 rounded-lg text-left block relative font-medium ${subActive ? 'bg-white/25 text-white font-semibold' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}
                                        style={{ fontSize: 'var(--text-sm)' }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${subActive ? 'bg-white' : 'bg-white/40'}`} />
                                            {subItem.label}
                                        </div>
                                    </UnstyledButton>
                                );
                            })}
                        </div>
                    </Collapse>
                </div>
            );
        }

        return (
            <Tooltip key={item.label} label={item.label} position="right" disabled={opened} transitionProps={{ duration: 0 }}>
                <UnstyledButton
                    onClick={() => handleNavigate(item.link!)}
                    className={`w-full py-3 px-3 rounded-xl mb-1.5 flex items-center ${pathname === item.link ? 'bg-white text-[#1e40af] shadow-md font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                    style={{ fontSize: 'var(--text-sm)' }}
                >
                    <Icon size={20} stroke={1.5} />
                    {opened && <Text size="sm" className="ml-3 font-semibold" style={{ fontSize: 'var(--text-sm)' }}>{item.label}</Text>}
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
                        <Text className="font-bold tracking-tight text-white whitespace-nowrap" style={{ fontSize: 'var(--text-base)' }}>
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
                
                {opened && isMobile && (
                    <ActionIcon 
                        variant="transparent" 
                        className="text-white/60 hover:text-white" 
                        onClick={closeMobile} 
                        size="sm"
                    >
                        <IconChevronLeft size={20} />
                    </ActionIcon>
                )}
            </div>

            <ScrollArea className="flex-1 px-3 py-2">
                <div className="space-y-0.5">
                    {links.map((link, _index) => {
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

