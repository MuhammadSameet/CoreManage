'use client';

import React from 'react';
import {
  Title as MantineTitle,
  Text as MantineText,
  Paper as MantinePaper,
  Stack as MantineStack,
  Group as MantineGroup,
  Button as MantineButton,
  SimpleGrid as MantineSimpleGrid,
  ThemeIcon,
  Container as MantineContainer
} from '@mantine/core';
import { IconRocket, IconChartBar, IconUsers, IconWallet, IconArrowRight } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Link from 'next/link';

const Title = MantineTitle;
const Text = MantineText;
const Paper = MantinePaper;
const Stack = MantineStack;
const Group = MantineGroup;
const Button = MantineButton;
const SimpleGrid = MantineSimpleGrid;
const Container = MantineContainer;

export default function HomePage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.authStates);

  const features = [
    { title: 'User Engine', desc: 'Manage your enterprise hierarchy and access controls with precision.', icon: <IconUsers size={24} />, color: 'blue', link: '/users' },
    { title: 'Billing Core', desc: 'Securely handle financial transactions and automated invoicing.', icon: <IconWallet size={24} />, color: 'green', link: '/payments' },
    { title: 'Live Analytics', desc: 'Monitor your business health with real-time data visualization.', icon: <IconChartBar size={24} />, color: 'indigo', link: '/users' },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap={40}>
        {/* Hero Section */}
        <div className="relative p-12 rounded-[2rem] bg-[#060b18] overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[120%] bg-indigo-600 rounded-full blur-[150px] opacity-10" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-xl text-center md:text-left">
              <Group gap="xs" mb="xs" className="justify-center md:justify-start">
                <ThemeIcon variant="light" color="indigo" radius="md">
                  <IconRocket size={18} />
                </ThemeIcon>
                <Text size="xs" fw={800} className="text-indigo-400 uppercase tracking-[0.3em]">Command Center v4.0</Text>
              </Group>
              <Title className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-white">{isAuthenticated?.name?.split(' ')[0] || 'Administrator'}</span>
              </Title>
              <Text className="text-slate-400 text-lg mb-8 font-medium">
                Your enterprise ecosystem is fully operational. Access your key modules below or monitor live activity in the dashboard.
              </Text>
              <Button
                component={Link}
                href="/"
                size="lg"
                radius="xl"
                className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 shadow-xl shadow-indigo-900/40"
                rightSection={<IconArrowRight size={20} />}
              >
                Enter Dashboard
              </Button>
            </div>

            <Paper p="xl" radius="lg" className="bg-white/5 border-white/10 backdrop-blur-md hidden lg:block">
              <Stack gap="xs" className="w-64">
                <Text size="xs" fw={700} color="dimmed" className="uppercase tracking-widest">System Status</Text>
                <Group justify="space-between">
                  <Text size="sm" className="text-white">Database</Text>
                  <Text size="xs" className="text-green-400 font-bold">Online</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" className="text-white">Security</Text>
                  <Text size="xs" className="text-green-400 font-bold">Encrypted</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" className="text-white">API Core</Text>
                  <Text size="xs" className="text-green-400 font-bold">Active</Text>
                </Group>
              </Stack>
            </Paper>
          </div>
        </div>

        {/* Feature Grid */}
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
          {features.map((feature, i) => (
            <Paper
              key={i}
              p="xl"
              radius="lg"
              withBorder
              className="hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group"
              component={Link}
              href={feature.link}
            >
              <ThemeIcon variant="light" color={feature.color} size={54} radius="md" mb="xl">
                {feature.icon}
              </ThemeIcon>
              <Title order={3} mb="sm" className="text-gray-800 tracking-tight">{feature.title}</Title>
              <Text size="sm" color="dimmed" mb="xl" className="leading-relaxed">
                {feature.desc}
              </Text>
              <Group gap={4} className="text-indigo-600 font-bold text-xs uppercase tracking-tighter group-hover:gap-2 transition-all">
                Manage Section <IconArrowRight size={14} />
              </Group>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
