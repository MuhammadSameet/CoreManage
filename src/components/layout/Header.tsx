'use client';

import React, { useState, useEffect } from 'react';
import { Group, ActionIcon, Avatar, Text, Menu, UnstyledButton, rem } from '@mantine/core';
import { IconSettings, IconLogout, IconMenu2 } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
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
    if (pathname === '/users') return 'Dashboard';
    if (pathname.startsWith('/users/roles')) return 'Roles & Permissions';
    if (pathname.startsWith('/users/search')) return 'Search Users';
    if (pathname.startsWith('/users/uploadentry')) return 'Upload Entry';
    if (pathname.startsWith('/users/report')) return 'Collection Report';
    if (pathname.startsWith('/users/detail')) return 'My Dashboard';
    if (pathname.startsWith('/users')) return 'User Management';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
};

export function Header({ opened, toggle }: HeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const title = getPageTitle(pathname);
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated } = useSelector((state: RootState) => state.authStates);
    const [actualUserName, setActualUserName] = useState<string>('User');
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (isAuthenticated?.uid) {
                try {
                    const userDocRef = doc(db, 'Users', isAuthenticated.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        setActualUserName(userData.name || userData.Name || userData.username || userData.Username || 'User');
                        setProfileImageUrl(userData.profileImageUrl || userData.photoURL || null);
                    } else {
                        setActualUserName(isAuthenticated.name || isAuthenticated.username || 'User');
                    }
                } catch {
                    setActualUserName(isAuthenticated.name || isAuthenticated.username || 'User');
                }
            }
        };
        fetchUser();
    }, [isAuthenticated?.uid, isAuthenticated?.name, isAuthenticated?.username]);

    const handleLogOut = () => {
        dispatch(logOutUser());
    };

    const initials = actualUserName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';

    return (
        <div className="h-16 px-4 md:px-6 flex items-center justify-between bg-white border-b border-gray-200 sticky top-0 z-20">
            <Group gap="sm">
                {!opened && (
                    <ActionIcon onClick={toggle} variant="subtle" color="gray" size="lg" className="rounded-md hover:bg-gray-100 transition-colors md:hidden">
                        <IconMenu2 size={24} />
                    </ActionIcon>
                )}
                <Text className="font-bold text-gray-800 hidden md:block tracking-tight" style={{ fontSize: 'var(--text-xl)' }}>{title}</Text>
            </Group>

            <Text className="font-bold text-gray-800 md:hidden" style={{ fontSize: 'var(--text-base)' }}>{title}</Text>

            <Group gap="md">
                <Menu shadow="md" width={200} position="bottom-end">
                    <Menu.Target>
                        <UnstyledButton className="flex items-center gap-2 pl-2 py-1 rounded-full hover:bg-gray-50 transition-colors">
                            <Avatar src={profileImageUrl || undefined} alt={actualUserName} radius="xl" color="blue" size={36}>{initials || 'U'}</Avatar>
                            <div className="hidden sm:block text-left">
                                <Text size="sm" fw={500} lh={1}>{actualUserName}</Text>
                            </div>
                        </UnstyledButton>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Label>Profile</Menu.Label>
                        <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />} onClick={() => router.push('/settings')}>
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
