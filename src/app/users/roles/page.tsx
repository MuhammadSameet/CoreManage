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
      <div className="overflow-x-auto -mx-2 sm:mx-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-2">
        <Table verticalSpacing="md" highlightOnHover className="mantine-Table-root min-w-[500px]">
          <Table.Thead className="bg-gray-50/50">
            <Table.Tr>
              <Table.Th className="py-4 text-gray-500 font-bold uppercase tracking-wider" style={{ fontSize: 'var(--text-sm)' }}>Name</Table.Th>
              <Table.Th className="py-4 text-gray-500 font-bold uppercase tracking-wider" style={{ fontSize: 'var(--text-sm)' }}>Email</Table.Th>
              <Table.Th className="py-4 text-gray-500 font-bold uppercase tracking-wider" style={{ fontSize: 'var(--text-sm)' }}>Username</Table.Th>
              <Table.Th className="py-4 text-gray-500 font-bold uppercase tracking-wider" style={{ fontSize: 'var(--text-sm)' }}>Role</Table.Th>
              <Table.Th className="py-4 text-gray-500 font-bold uppercase tracking-wider text-right" style={{ fontSize: 'var(--text-sm)' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {list.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} className="py-8 text-center text-gray-400 italic">No users in this role.</Table.Td>
              </Table.Tr>
            ) : (
              list.map((row) => (
                <Table.Tr key={row.docId} className="hover:bg-gray-50/40 transition-colors">
                  <Table.Td className="py-3"><Text fw={700} style={{ fontSize: 'var(--text-base)' }}>{row.name || '—'}</Text></Table.Td>
                  <Table.Td className="py-3"><Text style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>{row.email || '—'}</Text></Table.Td>
                  <Table.Td className="py-3"><Text style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)' }}>{(row as UserRow & { username?: string }).username || '—'}</Text></Table.Td>
                  <Table.Td className="py-3">
                    <Badge color={color} variant="light" size="lg" radius="sm" className="font-bold">{row.role || 'user'}</Badge>
                  </Table.Td>
                  <Table.Td className="py-3">
                    <Group gap="xs" justify="flex-end">
                      <ActionIcon variant="light" color="blue" onClick={() => openEdit(row)} className="rounded-md">
                        <IconEdit size={18} />
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
    <Stack gap="xl" className="max-w-[1400px] mx-auto w-full">
      <div className="mb-6">
        <Title order={1} className="page-heading" style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Roles & Permissions</Title>
        <Text className="page-description mt-2" style={{ fontSize: 'var(--text-lg)' }}>Manage access levels and oversee user roles across the platform.</Text>
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
