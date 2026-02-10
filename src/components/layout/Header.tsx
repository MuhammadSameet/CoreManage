'use client';

import React, { useState, useEffect } from 'react';
import { Group, ActionIcon, Avatar, Text, Menu, UnstyledButton, rem } from '@mantine/core';
import { IconBell, IconSettings, IconLogout, IconUser, IconMenu2 } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { logOutUser } from '@/redux/actions/auth-actions/auth-actions';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface HeaderProps {
    opened: boolean;
    toggle: () => void;
}

const getPageTitle = (pathname: string) => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/users')) return 'User Management';
    if (pathname.startsWith('/employees')) return 'Employee Management';
    if (pathname.startsWith('/payments')) return 'Payments';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Dashboard'; // Default
};

export function Header({ opened, toggle }: HeaderProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const pathname = usePathname();
    const title = getPageTitle(pathname);
    const dispatch = useDispatch<AppDispatch>();

    // Get user from Redux
    const { isAuthenticated } = useSelector((state: RootState) => state.authStates);
    
    // State to hold the user's actual name from Firebase
    const [actualUserName, setActualUserName] = useState<string>("User");
    
    useEffect(() => {
        const fetchActualUserName = async () => {
            if (isAuthenticated?.uid) {
                try {
                    // Fetch the user's actual name from the Users collection in Firebase
                    const userDocRef = doc(db, 'Users', isAuthenticated.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        const name = userData.name || userData.Name || userData.username || userData.Username || "User";
                        setActualUserName(name);
                    } else {
                        // Fallback to the name in Redux if Firebase doc doesn't exist
                        setActualUserName(isAuthenticated.name || isAuthenticated.username || "User");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setActualUserName(isAuthenticated.name || isAuthenticated.username || "User");
                }
            }
        };
        
        fetchActualUserName();
    }, [isAuthenticated?.uid, isAuthenticated?.name, isAuthenticated?.username]);

    const handleLogOut = () => {
        dispatch(logOutUser());
    };

    const userEmail = isAuthenticated?.email || "Guest";
    const userRole = isAuthenticated?.role || "User";
    const initials = actualUserName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';

    return (
        <div className="h-16 px-4 md:px-6 flex items-center justify-between bg-white border-b border-gray-200 sticky top-0 z-20">
            <Group>
                <div className="md:hidden">
                    <ActionIcon onClick={toggle} variant="subtle" color="gray" size="lg">
                        <IconMenu2 size={22} />
                    </ActionIcon>
                </div>
                <Text className="text-xl font-bold text-gray-800 hidden md:block">{title}</Text>
            </Group>

            {/* Mobile Title Centered or shown when needed */}
            <Text className="text-lg font-bold text-gray-800 md:hidden">{title}</Text>

            <Group gap="md">
                <ActionIcon variant="transparent" className="text-gray-500 hover:text-blue-600 transition-colors">
                    <IconBell size={22} stroke={1.5} />
                </ActionIcon>

                <Menu shadow="md" width={200} position="bottom-end">
                    <Menu.Target>
                        <UnstyledButton className="flex items-center gap-2 pl-2 py-1 rounded-full hover:bg-gray-50 transition-colors">
                            <Avatar src={null} alt={actualUserName} radius="xl" color="blue" size={36}>{initials || 'U'}</Avatar>
                            <div className="hidden sm:block text-left">
                                <Text size="sm" fw={500} lh={1}>{actualUserName}</Text>
                                <Text className="text-xs text-gray-400">{userEmail}</Text>
                            </div>
                        </UnstyledButton>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Label>Profile</Menu.Label>
                        <Menu.Item leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}>
                            {actualUserName}
                        </Menu.Item>
                        <Menu.Item leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}>
                            {userEmail}
                        </Menu.Item>
                        <Menu.Item leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}>
                            Role: {userRole}
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}>
                            Settings
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                            onClick={handleLogOut}
                            color="red"
                            leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                        >
                            Logout
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
        </div>
    );
}
