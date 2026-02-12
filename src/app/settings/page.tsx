'use client';

import React, { useState, useEffect } from 'react';
import {
    Text as MantineText,
    Paper as MantinePaper,
    Group as MantineGroup,
    Divider as MantineDivider,
    TextInput as MantineTextInput,
    Avatar,
    Button as MantineButton,
    Stack as MantineStack,
    PasswordInput as MantinePasswordInput,
} from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'react-toastify';
import { CreationModals } from '@/components/dashboard/CreationModals';

const Text = MantineText;
const Group = MantineGroup;
const TextInput = MantineTextInput;
const Button = MantineButton;
const Stack = MantineStack;
const Paper = MantinePaper;
const Divider = MantineDivider;
const PasswordInput = MantinePasswordInput;

export default function SettingsPage() {
    const { isAuthenticated } = useSelector((state: RootState) => state.authStates);
    const dispatch = useDispatch<AppDispatch>();
    const [userInfo, setUserInfo] = useState<{ name: string; email: string; role: string; username: string; profileImageUrl: string | null }>({
        name: '',
        email: '',
        role: 'user',
        username: '',
        profileImageUrl: null
    });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);
    const [userModal, setUserModal] = useState<{ opened: boolean; type: 'user' | 'employee' }>({ opened: false, type: 'user' });

    useEffect(() => {
        const load = async () => {
            if (!isAuthenticated?.uid) return;
            try {
                const userDocRef = doc(db, 'Users', isAuthenticated.uid);
                const snap = await getDoc(userDocRef);
                if (snap.exists()) {
                    const d = snap.data();
                    setUserInfo({
                        name: d.name || d.Name || isAuthenticated.name || '',
                        email: d.email || isAuthenticated.email || '',
                        role: d.role || isAuthenticated.role || 'user',
                        username: d.username || d.Username || '',
                        profileImageUrl: d.profileImageUrl || d.photoURL || null
                    });
                } else {
                    setUserInfo({
                        name: isAuthenticated.name || '',
                        email: isAuthenticated.email || '',
                        role: (isAuthenticated.role as string) || 'user',
                        username: (isAuthenticated.username as string) || '',
                        profileImageUrl: null
                    });
                }
            } catch {
                setUserInfo(prev => ({
                    ...prev,
                    name: isAuthenticated?.name || '',
                    email: isAuthenticated?.email || '',
                    role: (isAuthenticated?.role as string) || 'user',
                    username: (isAuthenticated?.username as string) || ''
                }));
            }
        };
        load();
    }, [isAuthenticated?.uid, isAuthenticated?.email, isAuthenticated?.name, isAuthenticated?.role, isAuthenticated?.username]);

    const roleLower = (userInfo.role || 'user').toLowerCase();
    const canCreateUser = roleLower === 'admin' || roleLower === 'employee';

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }
        const user = auth.currentUser;
        if (!user?.email) {
            toast.error('You must be signed in to change password.');
            return;
        }
        setChangingPassword(true);
        try {
            const cred = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, cred);
            await updatePassword(user, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            toast.success('Your password has been updated!');
        } catch (err: unknown) {
            const msg = (err as Error)?.message || '';
            if (msg.includes('wrong-password') || msg.includes('invalid-credential')) {
                toast.error('Current password is incorrect.');
            } else {
                toast.error('Could not update password. Try again.');
            }
        } finally {
            setChangingPassword(false);
        }
    };

    const initials = userInfo.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <Text className="font-bold text-gray-800 mb-1" style={{ fontSize: 'var(--text-2xl)' }}>Settings</Text>
                <Text className="text-gray-500" style={{ fontSize: 'var(--text-base)' }}>Your account information and password.</Text>
            </div>

            <Paper p="xl" radius="md" withBorder className="border-gray-100 shadow-sm">
                <Group mb="xl" gap="xl" wrap="wrap">
                    <Avatar
                        size={80}
                        radius="xl"
                        color="blue"
                        src={userInfo.profileImageUrl || undefined}
                    >
                        {initials || 'U'}
                    </Avatar>
                    <div>
                        <Text fw={700} style={{ fontSize: 'var(--text-lg)' }}>{userInfo.name || '—'}</Text>
                        <Text className="text-gray-500 capitalize" style={{ fontSize: 'var(--text-sm)' }}>{userInfo.role || 'user'}</Text>
                    </div>
                </Group>

                <Divider mb="xl" />

                <Stack gap="md">
                    <TextInput label="Email" value={userInfo.email} readOnly radius="md" size="md" />
                    <TextInput label="Role" value={userInfo.role} readOnly radius="md" size="md" />
                    <TextInput label="Name" value={userInfo.name} readOnly radius="md" size="md" />
                    <TextInput label="Username" value={userInfo.username} readOnly radius="md" size="md" />
                </Stack>

                <Divider my="xl" />

                <Text fw={700} className="text-gray-800 mb-3" style={{ fontSize: 'var(--text-base)' }}>Change password</Text>
                <form onSubmit={handleChangePassword}>
                    <Stack gap="sm">
                        <PasswordInput
                            label="Current password"
                            placeholder="Enter current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            radius="md"
                        />
                        <PasswordInput
                            label="New password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            radius="md"
                        />
                        <PasswordInput
                            label="Confirm new password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            radius="md"
                        />
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 font-semibold h-[46px] transition-all active:scale-[0.98]"
                            radius="md"
                            size="md"
                            loading={changingPassword}
                        >
                            Update password
                        </Button>
                    </Stack>
                </form>

                {canCreateUser && (
                    <>
                        <Divider my="xl" />
                        <Group gap="sm">
                            <Button
                                variant="light"
                                className="bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 font-semibold"
                                radius="md"
                                size="md"
                                onClick={() => setUserModal({ opened: true, type: 'user' })}
                            >
                                Create User
                            </Button>
                            <Button
                                variant="light"
                                className="bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 font-semibold"
                                radius="md"
                                size="md"
                                onClick={() => setUserModal({ opened: true, type: 'employee' })}
                            >
                                Create Employee
                            </Button>
                        </Group>
                    </>
                )}
            </Paper>

            <CreationModals
                opened={userModal.opened}
                onClose={() => setUserModal(prev => ({ ...prev, opened: false }))}
                type={userModal.type}
            />
        </div>
    );
}
