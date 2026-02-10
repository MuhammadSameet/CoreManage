'use client';

import React from 'react';
import { Title, Text, Paper, Stack, TextInput, Button, Group, Avatar, Grid, Divider } from '@mantine/core';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export default function ProfilePage() {
    const { isAuthenticated } = useSelector((state: RootState) => state.authStates);

    return (
        <Stack gap="lg">
            <div>
                <Title order={2} className="text-gray-800 tracking-tight">Admin Profile</Title>
                <Text size="sm" color="dimmed">Manage your account settings and personal preferences.</Text>
            </div>

            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper p="xl" radius="md" withBorder shadow="sm" className="text-center">
                        <Avatar
                            src={isAuthenticated?.dp || null}
                            size={120}
                            radius={120}
                            mx="auto"
                            className="border-4 border-indigo-50"
                        />
                        <Title order={4} mt="md">{isAuthenticated?.name || 'Administrator'}</Title>
                        <Text size="xs" color="dimmed" mb="lg">{isAuthenticated?.email}</Text>
                        <Button variant="light" color="indigo" fullWidth radius="md">Change Avatar</Button>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Paper p="xl" radius="md" withBorder shadow="sm">
                        <Title order={5} mb="md">Account Details</Title>
                        <Divider mb="xl" />

                        <Stack gap="md">
                            <Grid>
                                <Grid.Col span={6}>
                                    <TextInput label="First Name" defaultValue={isAuthenticated?.name?.split(' ')[0]} radius="md" />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput label="Last Name" defaultValue={isAuthenticated?.name?.split(' ')[1]} radius="md" />
                                </Grid.Col>
                            </Grid>

                            <TextInput label="Email Address" defaultValue={isAuthenticated?.email || ''} disabled radius="md" />
                            <TextInput label="Corporate ID" defaultValue={`EMP-${isAuthenticated?.uid?.slice(0, 6).toUpperCase()}`} disabled radius="md" />

                            <Group justify="flex-end" mt="xl">
                                <Button variant="default" radius="md">Cancel Changes</Button>
                                <Button leftSection={<IconDeviceFloppy size={16} />} radius="md" className="bg-[#6366f1]">
                                    Save Profile
                                </Button>
                            </Group>
                        </Stack>
                    </Paper>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
