// @ts-nocheck
"use client";

import { forwardRef, useEffect, useState } from 'react';
import { IconChevronRight, IconLogout, IconUser, IconSettings } from '@tabler/icons-react';
import { Group, Avatar, Text, Menu, UnstyledButton, Box } from '@mantine/core';
import { logOutUser } from "@/redux/actions/auth-actions/auth-actions";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from 'react-redux';

// --- 1. User Button Component ---
interface UserButtonProps extends React.ComponentPropsWithoutRef<'button'> {
    image: string;
    name: string;
    email: string;
    icon?: React.ReactNode;
    sidebarOpen?: boolean;
}

const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
    ({ image, name, email, icon, sidebarOpen, ...others }: UserButtonProps, ref) => (
        <UnstyledButton
            ref={ref}
            style={{
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                color: 'var(--mantine-color-text)',
                transition: 'background-color 0.2s ease',
            }}
            className="mantine-focus-auto"
            {...others}
        >
            <Group wrap="nowrap">
                <Avatar src={image} radius="xl" size={38} />

                {sidebarOpen && (
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {name}
                        </Text>
                        <Text className="text-xs text-gray-400" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {email}
                        </Text>
                    </div>
                )}

                {sidebarOpen && (icon || <IconChevronRight size={14} stroke={1.5} />)}
            </Group>
        </UnstyledButton>
    )
);

UserButton.displayName = 'UserButton';

// --- 2. Main UserSection Component ---
export function UserSection({ open }: { open: boolean }) {
    const [mounted, setMounted] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    // Get user from Redux
    const { isAuthenticated } = useSelector((state: RootState) => state.authStates);

    const handleLogOut = () => {
        dispatch(logOutUser());
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const userName = isAuthenticated?.name || "User";
    const userEmail = isAuthenticated?.email || "Guest";

    return (
        <Box p="xs">
            <Menu
                withArrow
                position="right-end"
                shadow="xl"
                width={220}
                transitionProps={{ transition: 'pop-bottom-right', duration: 150 }}
            >
                <Menu.Target>
                    <UserButton
                        sidebarOpen={open}
                        image="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png"
                        name={userName}
                        email={userEmail}
                    />
                </Menu.Target>

                <Menu.Dropdown style={{ padding: '8px' }}>
                    <Menu.Label>My Account</Menu.Label>
                    <Menu.Item
                        leftSection={<IconUser size={16} stroke={1.5} />}
                        style={{ borderRadius: '8px' }}
                    >
                        Profile Details
                    </Menu.Item>
                    <Menu.Item
                        leftSection={<IconSettings size={16} stroke={1.5} />}
                        style={{ borderRadius: '8px' }}
                    >
                        Account Settings
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Label>Danger Zone</Menu.Label>
                    <Menu.Item
                        onClick={handleLogOut}
                        color="red"
                        leftSection={<IconLogout size={16} stroke={1.5} />}
                        style={{ borderRadius: '8px' }}
                    >
                        Logout session
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Box>
    );
}

export default UserSection;