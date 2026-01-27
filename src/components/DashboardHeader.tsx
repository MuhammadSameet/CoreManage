'use client';

import React from 'react';
import { Group as MantineGroup, GroupProps, ActionIcon, Avatar, Text } from '@mantine/core';
import { IconBell, IconSettings } from '@tabler/icons-react';

// Fix for React 19 type incompatibility
const Group = MantineGroup as React.FC<GroupProps & { children?: React.ReactNode }>;

export function DashboardHeader() {
    return (
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-md shadow-sm">
            <Text className="text-xl font-bold text-gray-800">User Dashboard</Text>

            <Group gap="md">
                <ActionIcon variant="transparent" color="gray">
                    <IconBell size={20} />
                </ActionIcon>
                <ActionIcon variant="transparent" color="gray">
                    <IconSettings size={20} />
                </ActionIcon>
                <Group gap="xs">
                    <Avatar src={null} alt="User" radius="xl" color="blue">AD</Avatar>
                    {/* Dropdown arrow could go here */}
                </Group>
            </Group>
        </div>
    );
}
