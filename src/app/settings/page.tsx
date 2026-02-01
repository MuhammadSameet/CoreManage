'use client';

import React from 'react';
import {
    Text as MantineText,
    Paper as MantinePaper,
    Switch as MantineSwitch,
    Group as MantineGroup,
    Divider as MantineDivider,
    TextInput as MantineTextInput,
    Avatar,
    Button as MantineButton,
    Stack as MantineStack,
    Select as MantineSelect
} from '@mantine/core';
import { IconBell, IconShieldLock, IconPalette, IconCloudUpload } from '@tabler/icons-react';

const Text = MantineText;
const Group = MantineGroup;
const TextInput = MantineTextInput;
const Button = MantineButton;
const Stack = MantineStack;
const Select = MantineSelect;
const Paper = MantinePaper;
const Switch = MantineSwitch;
const Divider = MantineDivider;

export default function SettingsPage() {
    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div>
                <Text className="text-2xl font-bold text-gray-800">System Settings</Text>
                <Text className="text-gray-400 text-sm">Manage your account preferences and system configurations.</Text>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Paper p="xl" radius="md" withBorder className="border-gray-100 shadow-sm">
                        <Group mb="xl" gap="xl">
                            <Avatar size={80} radius={80} color="blue" src={null}>JD</Avatar>
                            <div>
                                <Text fw={700} size="lg">John Doe</Text>
                                <Text size="sm" className="text-gray-400 mb-3">Administrator</Text>
                                <Button size="compact-xs" variant="light" leftSection={<IconCloudUpload size={14} />}>Change Photo</Button>
                            </div>
                        </Group>

                        <Divider mb="xl" label="Profile Details" labelPosition="center" />

                        <Stack gap="md">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextInput label="First Name" defaultValue="John" radius="md" />
                                <TextInput label="Last Name" defaultValue="Doe" radius="md" />
                            </div>
                            <TextInput label="Email Address" defaultValue="john.doe@coremanage.com" readOnly radius="md" />
                            <TextInput label="Job Title" defaultValue="System Administrator" radius="md" />
                            <div className="flex justify-end mt-4">
                                <Button className="bg-[#1e40af] hover:bg-blue-800" radius="md">Save Changes</Button>
                            </div>
                        </Stack>
                    </Paper>

                    <Paper p="xl" radius="md" withBorder className="border-gray-100 shadow-sm">
                        <Group mb="md">
                            <IconShieldLock size={20} className="text-blue-600" />
                            <Text fw={700}>Security & Privacy</Text>
                        </Group>
                        <Stack gap="md">
                            <Group justify="space-between">
                                <div>
                                    <Text size="sm" fw={600}>Two-Factor Authentication</Text>
                                    <Text size="xs" className="text-gray-400">Add an extra layer of security to your account.</Text>
                                </div>
                                <Switch defaultChecked />
                            </Group>
                            <Divider variant="dashed" />
                            <Group justify="space-between">
                                <div>
                                    <Text size="sm" fw={600}>Login Alerts</Text>
                                    <Text size="xs" className="text-gray-400">Receive an email whenever someone logs into your account.</Text>
                                </div>
                                <Switch />
                            </Group>
                        </Stack>
                    </Paper>
                </div>

                {/* Sidebar Settings (Appearance & Notifications) */}
                <div className="space-y-6">
                    <Paper p="xl" radius="md" withBorder className="border-gray-100 shadow-sm">
                        <Group mb="md">
                            <IconPalette size={20} className="text-blue-600" />
                            <Text fw={700}>Appearance</Text>
                        </Group>
                        <Stack gap="md">
                            <Select
                                label="Theme Mode"
                                data={['Light Mode', 'Dark Mode', 'System Default']}
                                defaultValue="Light Mode"
                            />
                            <Select
                                label="Accent Color"
                                data={['Core Blue', 'Forest Green', 'Sunset Orange', 'Deep Purple']}
                                defaultValue="Core Blue"
                            />
                        </Stack>
                    </Paper>

                    <Paper p="xl" radius="md" withBorder className="border-gray-100 shadow-sm">
                        <Group mb="md">
                            <IconBell size={20} className="text-blue-600" />
                            <Text fw={700}>Notifications</Text>
                        </Group>
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Text size="sm">Email Alerts</Text>
                                <Switch defaultChecked />
                            </Group>
                            <Group justify="space-between">
                                <Text size="sm">Desktop Popups</Text>
                                <Switch defaultChecked />
                            </Group>
                            <Group justify="space-between">
                                <Text size="sm">Weekly Reports</Text>
                                <Switch />
                            </Group>
                        </Stack>
                    </Paper>
                </div>
            </div>
        </div>
    );
}
