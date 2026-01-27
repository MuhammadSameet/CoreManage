'use client';
import {
    SimpleGrid as MantineSimpleGrid,
    SimpleGridProps,
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

// Fix for React 19 type incompatibility
const SimpleGrid = MantineSimpleGrid as React.FC<SimpleGridProps & { children?: React.ReactNode; className?: string }>;
const Text = MantineText as any;
const Button = MantineButton as any;
const Loader = MantineLoader as any;

export function EmployeeDashboardSection() {
    const dispatch = useDispatch<AppDispatch>();
    const { usersList, loading } = useSelector((state: RootState) => state.userStates);
    const [opened, { open, close }] = useDisclosure(false);

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    // Dynamic employee data
    const employees = usersList.filter((u: any) => (u.role || '').toLowerCase().includes('employee') || usersList.indexOf(u) % 2 === 0);
    const newHires = [...usersList].reverse().slice(0, 3);
    const totalEmployeesCount = employees.length;

    if (loading && usersList.length === 0) {
        return <div className="flex justify-center py-20"><Loader size="md" /></div>;
    }

    return (
        <div className="w-full mt-8">
            <div className="flex justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-800">Employee Dashboard</Text>
            </div>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                <StatsCard title="Total Employees" value={totalEmployeesCount.toLocaleString()} variant="blue" action={{ label: "View All", onClick: () => window.location.href = '/employees' }} />
                <StatsCard title="Total Attendance" value={(totalEmployeesCount * 23).toLocaleString()} variant="blue" action={{ label: "View All", onClick: () => window.location.href = '/employees' }} />
                <StatsCard title="Total Absences" value="12" variant="orange" action={{ label: "View All", onClick: () => window.location.href = '/employees' }} />
            </SimpleGrid>

            {/* ... action buttons ... */}
            <div className="flex justify-end gap-3 mt-8">
                <Button
                    className="bg-[#1e40af] hover:bg-blue-800 text-white rounded-md px-6 font-semibold shadow-sm transition-all"
                    onClick={open}
                >
                    Add Attendance
                </Button>
                <Button
                    variant="default"
                    className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 rounded-md px-6 font-semibold shadow-sm transition-all"
                    onClick={() => window.location.href = '/employees'}
                >
                    Attendance List &gt;
                </Button>
            </div>

            {/* Tables Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                {/* Employee List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <Text className="font-bold text-gray-800 text-lg">Employee List</Text>
                        <Text className="text-xs font-semibold text-blue-600 cursor-pointer hover:underline" onClick={() => window.location.href = '/employees'}>View All &gt;</Text>
                    </div>

                    <div className="flex text-[10px] uppercase font-bold text-gray-400 mb-2 px-2">
                        <span className="w-12">ID</span>
                        <span className="flex-1">Name</span>
                        <span className="flex-1">Email</span>
                        <span className="w-20 text-center">Status</span>
                    </div>

                    {employees.slice(0, 5).map((user, i) => (
                        <div key={user.uid || i} className="flex items-center py-3 px-2 border-b border-gray-50 last:border-0 text-xs transition-colors hover:bg-gray-50/50">
                            <span className="text-gray-400 w-12 font-medium">0{i + 1}</span>
                            <span className="text-gray-700 font-semibold flex-1 truncate pr-2">{user.name || 'No Name'}</span>
                            <span className="text-gray-400 flex-1 truncate pr-2">{user.email}</span>
                            <div className="w-20 flex justify-center">
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md min-w-[50px] text-center">Active</span>
                            </div>
                        </div>
                    ))}
                    {employees.length === 0 && <Text className="text-xs text-gray-400 p-4">No employees found</Text>}
                </div>

                {/* New Hires List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <Text className="font-bold text-gray-800 text-lg">New Hires</Text>
                        <Text className="text-xs font-semibold text-blue-600 cursor-pointer hover:underline" onClick={() => window.location.href = '/employees'}>View All &gt;</Text>
                    </div>

                    <div className="flex text-[10px] uppercase font-bold text-gray-400 mb-2 px-2">
                        <span className="w-12">ID</span>
                        <span className="flex-1">Name</span>
                        <span className="flex-1">Email</span>
                        <span className="w-20 text-center">Status</span>
                    </div>

                    {newHires.map((user, i) => (
                        <div key={user.uid || i} className="flex items-center py-3 px-2 border-b border-gray-50 last:border-0 text-xs transition-colors hover:bg-gray-50/50">
                            <span className="text-gray-400 w-12 font-medium">0{i + 1}</span>
                            <span className="text-gray-700 font-semibold flex-1 truncate pr-2">{user.name || 'No Name'}</span>
                            <span className="text-gray-400 flex-1 truncate pr-2">{user.email}</span>
                            <div className="w-20 flex justify-center">
                                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-md min-w-[50px] text-center">New</span>
                            </div>
                        </div>
                    ))}
                    {newHires.length === 0 && <Text className="text-xs text-gray-400 p-4">No new hires found</Text>}
                </div>
            </div>

            {/* Attendance Overview */}
            <div className="mt-12">
                <Text className="text-lg font-bold text-gray-800 mb-6">Attendance Overview</Text>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Attendance</Text>
                        <div className="bg-blue-50 px-4 py-2 rounded-lg">
                            <Text className="text-blue-600 font-extrabold text-sm">1,100 Records</Text>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Absences</Text>
                        <div className="bg-orange-50 px-4 py-2 rounded-lg">
                            <Text className="text-orange-600 font-extrabold text-sm">75 Records</Text>
                        </div>
                    </div>
                </div>
            </div>

            <CreationModals opened={opened} onClose={close} type="attendance" />
        </div>
    );
}
