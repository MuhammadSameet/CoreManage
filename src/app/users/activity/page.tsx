'use client';

import React from 'react';
import { Title, Text, Paper, Stack, Timeline, Group, ThemeIcon, Badge } from '@mantine/core';
import { IconLogin, IconUserPlus, IconDatabaseExport, IconSettings } from '@tabler/icons-react';

export default function ActivityPage() {
    const activities = [
        { title: 'System Login', time: '2 minutes ago', desc: 'Secure authentication via Google SSO', icon: <IconLogin size={14} />, color: 'blue' },
        { title: 'New User Registered', time: '45 minutes ago', desc: 'New employee "Sarah Chen" added to Development', icon: <IconUserPlus size={14} />, color: 'green' },
        { title: 'Database Export', time: '2 hours ago', desc: 'Monthly financial report exported to CSV', icon: <IconDatabaseExport size={14} />, color: 'orange' },
        { title: 'Configuration Update', time: '5 hours ago', desc: 'Global billing cycle adjusted to 30 days', icon: <IconSettings size={14} />, color: 'violet' },
    ];

    return (
        <Stack gap="lg">
            <div>
                <Title order={2} className="text-gray-800 tracking-tight">Activity Logs</Title>
                <Text size="sm" color="dimmed">Monitor real-time system events and administrative audit trails.</Text>
            </div>

            <Paper p="xl" radius="md" withBorder shadow="sm">
                <Timeline active={0} bulletSize={30} lineWidth={2}>
                    {activities.map((act, i) => (
                        <Timeline.Item
                            key={i}
                            bullet={<ThemeIcon color={act.color} radius="xl">{act.icon}</ThemeIcon>}
                            title={
                                <Group justify="space-between">
                                    <Text fw={700} size="sm">{act.title}</Text>
                                    <Badge variant="dot" size="xs">{act.time}</Badge>
                                </Group>
                            }
                        >
                            <Text color="dimmed" size="xs" mt={4}>{act.desc}</Text>
                        </Timeline.Item>
                    ))}
                </Timeline>
            </Paper>
        </Stack>
    );
}
