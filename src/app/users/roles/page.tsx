'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchAllUsers } from '@/redux/actions/user-actions/user-actions';
import { Title, Text, Paper, Stack, Table, Badge, ActionIcon, Group, Button, Modal, TextInput, Select } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type UserRow = {
  docId: string;
  uid: string;
  name: string;
  email: string;
  role: string;
  username?: string;
  createdAt?: string;
};

export default function RolesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { usersList, loading } = useSelector((state: RootState) => state.userStates);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; role: string; username: string }>({ name: '', email: '', role: 'user', username: '' });

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const admins = usersList.filter(u => (u.role || '').toLowerCase() === 'admin');
  const employees = usersList.filter(u => (u.role || '').toLowerCase() === 'employee');
  const users = usersList.filter(u => (u.role || '').toLowerCase() === 'user' || !(u.role || '').toLowerCase() || (u.role || '').toLowerCase() === 'user');

  const openEdit = (row: UserRow) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      email: row.email || '',
      role: row.role || 'user',
      username: (row as UserRow & { username?: string }).username || ''
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const ref = doc(db, 'Users', editing.docId);
      await updateDoc(ref, {
        name: form.name,
        email: form.email,
        role: form.role,
        username: form.username
      });
      dispatch(fetchAllUsers());
      setEditing(null);
      notifications.show({ title: 'Updated', message: 'User updated successfully.', color: 'green', position: 'top-right' });
    } catch {
      notifications.show({ title: 'Error', message: 'Could not update user.', color: 'red', position: 'top-right' });
    }
  };

  const renderTable = (title: string, list: UserRow[], color: string) => (
    <Paper p="xl" radius="md" withBorder shadow="sm" key={title}>
      <Title order={4} className="page-heading mb-4" style={{ fontSize: 'var(--text-lg)' }}>{title}</Title>
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <Table verticalSpacing="md" highlightOnHover className="mantine-Table-root min-w-[500px]">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Username</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {list.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Text size="sm" c="dimmed">No users in this role.</Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            list.map((row) => (
              <Table.Tr key={row.docId}>
                <Table.Td><Text fw={600} size="sm">{row.name || '—'}</Text></Table.Td>
                <Table.Td><Text size="sm">{row.email || '—'}</Text></Table.Td>
                <Table.Td><Text size="sm">{(row as UserRow & { username?: string }).username || '—'}</Text></Table.Td>
                <Table.Td>
                  <Badge color={color} variant="light" size="sm" radius="sm">{row.role || 'user'}</Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <ActionIcon variant="subtle" color="gray" onClick={() => openEdit(row)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
      </div>
    </Paper>
  );

  return (
    <Stack gap="lg">
      <div>
        <Title order={2} className="page-heading">Roles & Permissions</Title>
        <Text className="page-description">View and edit users by role.</Text>
      </div>

      {loading && usersList.length === 0 ? (
        <Text size="sm" c="dimmed">Loading…</Text>
      ) : (
        <>
          {renderTable('Admins', admins, 'blue')}
          {renderTable('Employees', employees, 'green')}
          {renderTable('Users', users, 'gray')}
        </>
      )}

      <Modal opened={!!editing} onClose={() => setEditing(null)} title="Edit user">
        {editing && (
          <Stack gap="md">
            <TextInput label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <TextInput label="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <TextInput label="Username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
            <Select
              label="Role"
              value={form.role}
              onChange={v => v && setForm(f => ({ ...f, role: v }))}
              data={[{ value: 'admin', label: 'Admin' }, { value: 'employee', label: 'Employee' }, { value: 'user', label: 'User' }]}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setEditing(null)}>Cancel</Button>
              <Button className="bg-[#6366f1] hover:bg-[#4f46e5]" onClick={saveEdit}>Save</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
