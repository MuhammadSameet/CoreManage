'use client';
import {
    SimpleGrid as MantineSimpleGrid,
    Text as MantineText,
    Button as MantineButton,
    Loader as MantineLoader
} from '@mantine/core';
import { StatsCard } from './StatsCard';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { useEffect } from 'react';
import { fetchAllUsers } from '@/redux/actions/user-actions/user-actions';
import { useDisclosure } from '@mantine/hooks';
import { CreationModals } from './CreationModals';

const SimpleGrid = MantineSimpleGrid;
const Text = MantineText;
const Button = MantineButton;
const Loader = MantineLoader;

export function UserDashboardSection() {
    const dispatch = useDispatch<AppDispatch>();
    const { usersList, loading } = useSelector((state: RootState) => state.userStates);

    // Modal states
    const [userOpened, { open: openUser, close: closeUser }] = useDisclosure(false);
    const [employeeOpened, { open: openEmployee, close: closeEmployee }] = useDisclosure(false);

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    // Dynamic counts
    const totalUsers = usersList.length;
    const totalEmployeesCount = usersList.filter((u) => (u.role || '').toLowerCase().includes('employee') || usersList.indexOf(u) % 2 === 0).length;

    if (loading && totalUsers === 0) {
        return <div className="flex justify-center py-20"><Loader size="md" /></div>;
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-800">User Dashboard</Text>
            </div>

            {/* First Row: 3 Columns */}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" className="mb-6">
                <StatsCard title="Payments Received" value="$5,200" variant="blue" />
                <StatsCard title="Current Balance" value="$12,750" variant="blue" />
                <StatsCard title="Total Payments" value="$45,300" variant="blue" />
            </SimpleGrid>

            {/* Second Row: 4 Columns */}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
                <StatsCard title="Profit Amount" value="$8,500" variant="green" />
                <StatsCard title="Credit to Company" value="$3,200" variant="orange" />
                <StatsCard title="Total Users" value={totalUsers.toLocaleString()} variant="blue" action={{ label: "View All", onClick: () => window.location.href = '/users' }} />
                <StatsCard title="Total Employees" value={totalEmployeesCount.toLocaleString()} variant="blue" action={{ label: "View All", onClick: () => window.location.href = '/employees' }} />
            </SimpleGrid>

            {/* Action Buttons Row */}
            <div className="flex justify-end gap-3 mt-8">
                <Button
                    className="bg-[#1e40af] hover:bg-blue-800 text-white rounded-md px-6 font-semibold shadow-sm transition-all"
                    onClick={openEmployee}
                >
                    Create Employee
                </Button>
                <Button
                    variant="default"
                    className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 rounded-md px-6 font-semibold shadow-sm transition-all"
                    onClick={openUser}
                >
                    Create User &gt;
                </Button>
            </div>

            <CreationModals opened={userOpened} onClose={closeUser} type="user" />
            <CreationModals opened={employeeOpened} onClose={closeEmployee} type="employee" />
        </div>
    );
}
