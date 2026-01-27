'use client';
import React, { useState } from 'react';
import {
    Modal as MantineModal,
    TextInput as MantineTextInput,
    PasswordInput as MantinePasswordInput,
    Button as MantineButton,
    Stack as MantineStack,
    Select as MantineSelect,
    Group as MantineGroup,
    ModalProps,
    TextInputProps,
    PasswordInputProps,
    ButtonProps,
    StackProps,
    SelectProps,
    GroupProps
} from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { signUpUser } from '@/redux/actions/auth-actions/auth-actions';
import { notifications } from '@mantine/notifications';

// React 19 type fixes - using any as temporary bypass for Mantine 8 / React 19 type alignment issues
const Modal = MantineModal as any;
const TextInput = MantineTextInput as any;
const PasswordInput = MantinePasswordInput as any;
const Button = MantineButton as any;
const Stack = MantineStack as any;
const Select = MantineSelect as any;
const Group = MantineGroup as any;

interface CreationModalProps {
    opened: boolean;
    onClose: () => void;
    type: 'user' | 'employee' | 'attendance';
}

export function CreationModals({ opened, onClose, type }: CreationModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { usersList } = useSelector((state: RootState) => state.userStates);
    const [loading, setLoading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: type === 'employee' ? 'Employee' : 'User'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (type === 'attendance') {
                notifications.show({
                    title: 'Attendance Added',
                    message: 'Attendance record has been successfully recorded.',
                    color: 'green'
                });
            } else {
                await dispatch(signUpUser({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                }));
                notifications.show({
                    title: `${type === 'user' ? 'User' : 'Employee'} Created`,
                    message: `New ${type === 'user' ? 'user' : 'employee'} ${formData.name} has been added.`,
                    color: 'blue'
                });
            }
            onClose();
            setFormData({ name: '', email: '', password: '', role: type === 'employee' ? 'Employee' : 'User' });
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.message || 'Something went wrong. Please try again.',
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    const modalTitle = {
        user: 'Create New User',
        employee: 'Create New Employee',
        attendance: 'Add Attendance Record'
    }[type];

    return (
        <Modal opened={opened} onClose={onClose} title={modalTitle} centered radius="md" size="md">
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    {type !== 'attendance' && (
                        <>
                            <TextInput
                                required
                                label="Full Name"
                                placeholder="Enter full name"
                                value={formData.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <TextInput
                                required
                                label="Email Address"
                                placeholder="hello@example.com"
                                value={formData.email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <PasswordInput
                                required
                                label="Password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                            />
                            {type === 'employee' && (
                                <Select
                                    label="Department"
                                    placeholder="Select department"
                                    data={['Sales', 'Support', 'Development', 'Management']}
                                    defaultValue="Sales"
                                    onChange={(val: string) => setFormData({ ...formData, role: `Employee - ${val}` })}
                                />
                            )}
                        </>
                    )}

                    {type === 'attendance' && (
                        <>
                            <Select
                                required
                                label="Select Employee"
                                placeholder="Pick an employee"
                                data={usersList.map((u: any) => u.name || u.email)}
                            />
                            <Select
                                required
                                label="Status"
                                placeholder="Pick status"
                                data={['Present', 'Absent', 'Late', 'Half Day']}
                                defaultValue="Present"
                            />
                            <TextInput
                                label="Date"
                                type="date"
                                defaultValue={new Date().toISOString().split('T')[0]}
                            />
                        </>
                    )}

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button type="submit" className="bg-[#1e40af]" loading={loading}>
                            {type === 'attendance' ? 'Submit Attendance' : `Create ${type}`}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
