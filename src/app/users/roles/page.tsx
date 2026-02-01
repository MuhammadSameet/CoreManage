'use client';

import React from 'react';
import { Title, Text, Paper, Stack, Table, Badge, ActionIcon, Group, Button } from '@mantine/core';
import { IconShieldLock, IconEdit, IconTrash } from '@tabler/icons-react';

export default function RolesPage() {
    const roles = [
        { name: 'Administrator', users: 2, status: 'Active', color: 'blue' },
        { name: 'Manager', users: 5, status: 'Active', color: 'green' },
        { name: 'Employee', users: 42, status: 'Active', color: 'indigo' },
        { name: 'Audit', users: 1, status: 'Inactive', color: 'gray' },
    ];

    return (
        <Stack gap="lg">
            <Group justify="space-between">
                <div>
                    <Title order={2} className="text-gray-800 tracking-tight">Roles & Permissions</Title>
                    <Text size="sm" color="dimmed">Define and manage access levels for your organization.</Text>
                </div>
                <Button leftSection={<IconShieldLock size={16} />} radius="md" className="bg-[#6366f1]">
                    Define New Role
                </Button>
            </Group>

            <Paper p="xl" radius="md" withBorder shadow="sm">
                <Table verticalSpacing="md" highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Role Name</Table.Th>
                            <Table.Th>Assigned Users</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {roles.map((role) => (
                            <Table.Tr key={role.name}>
                                <Table.Td>
                                    <Text fw={700} size="sm">{role.name}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm">{role.users} Users</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Badge color={role.color} variant="light" size="sm" radius="sm">
                                        {role.status}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs" justify="flex-end">
                                        <ActionIcon variant="subtle" color="gray">
                                            <IconEdit size={16} />
                                        </ActionIcon>
                                        <ActionIcon variant="subtle" color="red">
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Paper>
        </Stack>
    );
}
