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
    ActionIcon,
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { signUpUser } from '@/redux/actions/auth-actions/auth-actions';
import { notifications } from '@mantine/notifications';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { createMonthlyDataForUser } from '@/utils/monthlyDataUtils';
import { toast } from 'react-toastify';

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
        FullName: '',
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

            toast.success(`User ${uploadEntryData.Username} created successfully!`);

            onClose();
            // Reset form
            setUploadEntryData({
                'User ID': '',
                Username: '',
                FullName: '',
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
            toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (type === 'attendance') {
                toast.success('Attendance recorded successfully!');
            } else if (type === 'uploadEntry') {
                await handleUploadEntrySubmit(e);
            } else {
                // For user/employee creation, save to Firebase users collection
                await dispatch(signUpUser({
                    name: uploadEntryData.FullName || 'N/A',
                    email: uploadEntryData['User ID'] || `${uploadEntryData.Username}@example.com`,
                    password: uploadEntryData.Password || 'TempPass123!',
                    role: type === 'employee' ? 'employee' : 'user',
                    username: uploadEntryData.Username
                }, true));

                toast.success(`${type === 'user' ? 'User' : 'Employee'} created successfully!`);
            }
            onClose();
            // Reset form
            setUploadEntryData({
                'User ID': '',
                Username: '',
                FullName: '',
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
            toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
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
            <Modal opened={opened} onClose={onClose} title={modalTitle} centered radius="md" size="lg" withCloseButton={true} styles={{ close: { color: '#1e40af', scale: 1.2 } }}>
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
        <Modal
            opened={opened}
            onClose={onClose}
            title={modalTitle}
            centered
            radius="md"
            size="md"
            withCloseButton={true}
            styles={{
                title: { fontWeight: 700, fontSize: '1.2rem', color: '#1e40af' },
                close: { color: '#1e40af', scale: 1.2 }
            }}
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    {type !== 'attendance' && (
                        <>
                            <TextInput
                                required
                                label="Full Name"
                                placeholder="Enter full name"
                                value={uploadEntryData.FullName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEntryData({ ...uploadEntryData, FullName: e.target.value })}
                            />
                            <TextInput
                                required
                                label="Email Address"
                                placeholder="hello@example.com"
                                value={uploadEntryData['User ID']}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEntryData({ ...uploadEntryData, 'User ID': e.target.value })}
                            />
                            <TextInput
                                required
                                label="Username/ID"
                                placeholder="Enter username or ID"
                                value={uploadEntryData.Username}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEntryData({ ...uploadEntryData, Username: e.target.value })}
                            />
                            <PasswordInput
                                required
                                label="Password"
                                placeholder="Create a password"
                                value={uploadEntryData.Password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEntryData({ ...uploadEntryData, Password: e.target.value })}
                            />
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
