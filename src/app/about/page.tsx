'use client';

import React from 'react';
import {
    Title as MantineTitle,
    Text as MantineText,
    Paper as MantinePaper,
    Stack as MantineStack,
    SimpleGrid as MantineSimpleGrid,
    ThemeIcon,
    Container as MantineContainer,
    Group as MantineGroup
} from '@mantine/core';
import { IconLifebuoy, IconBook, IconMessageCircle, IconSettings } from '@tabler/icons-react';

const Title = MantineTitle;
const Text = MantineText;
const Paper = MantinePaper;
const Stack = MantineStack;
const SimpleGrid = MantineSimpleGrid;
const Container = MantineContainer;
const Group = MantineGroup;

export default function SupportPage() {
    const supports = [
        { title: 'Documentation', desc: 'Read our comprehensive guides on system management.', icon: <IconBook size={24} />, color: 'blue' },
        { title: 'Live Support', desc: 'Chat with our enterprise support engineers 24/7.', icon: <IconLifebuoy size={24} />, color: 'green' },
        { title: 'System Status', desc: 'Check real-time health for all platform modules.', icon: <IconSettings size={24} />, color: 'orange' },
        { title: 'Community', desc: 'Join the discussion with other system administrators.', icon: <IconMessageCircle size={24} />, color: 'violet' },
    ];

    return (
        <Container size="lg" py="xl">
            <Stack gap={50}>
                <div className="text-center max-w-2xl mx-auto">
                    <Title className="text-4xl font-black text-gray-800 mb-4 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        How can we <span className="text-indigo-600">help you?</span>
                    </Title>
                    <Text color="dimmed" size="lg">
                        Access our specialized support ecosystem to get the most out of your CoreManage platform.
                    </Text>
                </div>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                    {supports.map((s, i) => (
                        <Paper key={i} p="xl" radius="md" withBorder shadow="sm" className="hover:shadow-md transition-shadow cursor-default">
                            <Group wrap="nowrap" align="flex-start" gap="xl">
                                <ThemeIcon variant="light" color={s.color} size={48} radius="md">
                                    {s.icon}
                                </ThemeIcon>
                                <div>
                                    <Text fw={700} size="lg" mb={4}>{s.title}</Text>
                                    <Text size="sm" color="dimmed" className="leading-relaxed">{s.desc}</Text>
                                </div>
                            </Group>
                        </Paper>
                    ))}
                </SimpleGrid>

                <Paper p={40} radius="lg" className="bg-[#f8fafc] border-dashed border-2 border-gray-200 text-center">
                    <Text fw={800} size="xs" className="uppercase tracking-widest text-indigo-500 mb-2">Still need assistance?</Text>
                    <Title order={3} mb="md">Custom Enterprise Solutions</Title>
                    <Text color="dimmed" mb="xl">Our technical team is available for deep integrations and specialized workflows.</Text>
                    <Group justify="center">
                        <Text className="text-sm font-bold text-gray-800">support@coremanage.io</Text>
                        <Text className="text-gray-300">|</Text>
                        <Text className="text-sm font-bold text-gray-800">+1 (800) CORE-MNG</Text>
                    </Group>
                </Paper>
            </Stack>
        </Container>
    );
}