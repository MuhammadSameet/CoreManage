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
} from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { signUpUser } from '@/redux/actions/auth-actions/auth-actions';
import { notifications } from '@mantine/notifications';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { createMonthlyDataForUser } from '@/utils/monthlyDataUtils';

const Modal = MantineModal;
const TextInput = MantineTextInput;
const PasswordInput = MantinePasswordInput;
const Button = MantineButton;
const Stack = MantineStack;
const Select = MantineSelect;
const Group = MantineGroup;

interface CreationModalProps {
    opened: boolean;
    onClose: () => void;
    type: 'user' | 'employee' | 'attendance' | 'uploadEntry';
}

export function CreationModals({ opened, onClose, type }: CreationModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { usersList } = useSelector((state: RootState) => state.userStates);
    const [loading, setLoading] = useState(false);

    // Form states for uploadEntry type
    const [uploadEntryData, setUploadEntryData] = useState({
        'User ID': '',
        Username: '',
        Package: '',
        Amount: '',
        Address: '',
        Password: '',
        MonthlyFee: '0',
        Balance: '0',
        Profit: '0',
        isPaid: 'unpaid',
        Date: new Date().toISOString().split('T')[0],
    });

    const handleUploadEntrySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Add to uploadEntry collection in Firebase
            const docRef = await addDoc(collection(db, 'uploadEntry'), {
                ...uploadEntryData,
                uploadedAt: serverTimestamp(),
            });

            // Create corresponding monthly data entry
            await createMonthlyDataForUser(docRef.id, uploadEntryData);

            notifications.show({
                title: 'User Created',
                message: `New user ${uploadEntryData.Username} has been added to the billing system.`,
                color: 'green'
            });

            onClose();
            // Reset form
            setUploadEntryData({
                'User ID': '',
                Username: '',
                Package: '',
                Amount: '',
                Address: '',
                Password: '',
                MonthlyFee: '0',
                Balance: '0',
                Profit: '0',
                isPaid: 'unpaid',
                Date: new Date().toISOString().split('T')[0],
            });
        } catch (error: unknown) {
            notifications.show({
                title: 'Error',
                message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

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
            } else if (type === 'uploadEntry') {
                await handleUploadEntrySubmit(e);
            } else {
                await dispatch(signUpUser({
                    name: uploadEntryData.Username || 'N/A',
                    email: uploadEntryData['User ID'] || 'N/A',
                    password: uploadEntryData.Password,
                    role: 'User'
                }));
                notifications.show({
                    title: `${type === 'user' ? 'User' : 'Employee'} Created`,
                    message: `New ${type === 'user' ? 'user' : 'employee'} ${uploadEntryData.Username || 'N/A'} has been added.`,
                    color: 'blue'
                });
            }
            onClose();
            // Reset form
            setUploadEntryData({
                'User ID': '',
                Username: '',
                Package: '',
                Amount: '',
                Address: '',
                Password: '',
                MonthlyFee: '0',
                Balance: '0',
                Profit: '0',
                isPaid: 'unpaid',
                Date: new Date().toISOString().split('T')[0],
            });
        } catch (error: unknown) {
            notifications.show({
                title: 'Error',
                message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    const modalTitle = {
        user: 'Create New User',
        employee: 'Create New Employee',
        attendance: 'Add Attendance Record',
        uploadEntry: 'Create New Billing Entry'
    }[type];

    if (type === 'uploadEntry') {
        return (
            <Modal opened={opened} onClose={onClose} title={modalTitle} centered radius="md" size="lg">
                <form onSubmit={handleSubmit}>
                    <Stack gap="md">
                        <TextInput
                            required
                            label="User ID"
                            placeholder="Enter User ID"
                            value={uploadEntryData['User ID']}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEntryData({ ...uploadEntryData, 'User ID': e.target.value })}
                        />
                        <TextInput
                            required
                            label="Username"
                            placeholder="Enter Username"
                            value={uploadEntryData.Username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEntryData({ ...uploadEntryData, Username: e.target.value })}
                        />
                        <TextInput
                            required
                            label="Package"
                            placeholder="Enter Package"
                            value={uploadEntryData.Package}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEntryData({ ...uploadEntryData, Package: e.target.value })}
                        />
                        <TextInput
                            required
                            label="Amount"
                            placeholder="Enter Amount"
                            value={uploadEntryData.Amount}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEntryData({ ...uploadEntryData, Amount: e.target.value })}
                        />
                        <TextInput
                            required
                            label="Address"
                            placeholder="Enter Address"
                            value={uploadEntryData.Address}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEntryData({ ...uploadEntryData, Address: e.target.value })}
                        />
                        <PasswordInput
                            required
                            label="Password"
                            placeholder="Enter Password"
                            value={uploadEntryData.Password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEntryData({ ...uploadEntryData, Password: e.target.value })}
                        />
                        <TextInput
                            required
                            label="Monthly Fee"
                            placeholder="Enter Monthly Fee"
                            value={uploadEntryData.MonthlyFee}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEntryData({ ...uploadEntryData, MonthlyFee: e.target.value })}
                        />
                        <TextInput
                            label="Balance"
                            placeholder="Enter Balance (default 0)"
                            value={uploadEntryData.Balance}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEntryData({ ...uploadEntryData, Balance: e.target.value })}
                        />
                        <TextInput
                            label="Profit"
                            placeholder="Enter Profit (default 0)"
                            value={uploadEntryData.Profit}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEntryData({ ...uploadEntryData, Profit: e.target.value })}
                        />
                        <Select
                            label="Payment Status"
                            placeholder="Select Payment Status"
                            data={['paid', 'unpaid']}
                            value={uploadEntryData.isPaid}
                            onChange={(val: string | null) => setUploadEntryData({ ...uploadEntryData, isPaid: val || 'unpaid' })}
                        />
                        <TextInput
                            label="Date"
                            type="date"
                            value={uploadEntryData.Date}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEntryData({ ...uploadEntryData, Date: e.target.value })}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={onClose} disabled={loading}>Cancel</Button>
                            <Button type="submit" className="bg-[#1e40af]" loading={loading}>
                                Create Billing Entry
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        );
    }

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
                                value={uploadEntryData.Username}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEntryData({ ...uploadEntryData, Username: e.target.value })}
                            />
                            <TextInput
                                required
                                label="Email Address"
                                placeholder="hello@example.com"
                                value={uploadEntryData['User ID']}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEntryData({ ...uploadEntryData, 'User ID': e.target.value })}
                            />
                            <PasswordInput
                                required
                                label="Password"
                                placeholder="Create a password"
                                value={uploadEntryData.Password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEntryData({ ...uploadEntryData, Password: e.target.value })}
                            />
                            {type === 'employee' && (
                                <Select
                                    label="Department"
                                    placeholder="Select department"
                                    data={['Sales', 'Support', 'Development', 'Management']}
                                    defaultValue="Sales"
                                    onChange={(val: string | null) => setUploadEntryData({ ...uploadEntryData, 'User ID': `Employee - ${val || 'Sales'}` })}
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
                                data={usersList.map((u) => u.name || u.email)}
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
