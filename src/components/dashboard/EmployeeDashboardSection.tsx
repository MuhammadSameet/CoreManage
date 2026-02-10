'use client';
import {
    SimpleGrid as MantineSimpleGrid,
    Text as MantineText,
    Button as MantineButton,
    Loader as MantineLoader,
    Badge as MantineBadge
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
const Badge = MantineBadge;

export function EmployeeDashboardSection() {
    const dispatch = useDispatch<AppDispatch>();
    const { usersList, loading } = useSelector((state: RootState) => state.userStates);
    
    // Separate disclosure hooks for different modal types
    const [attendanceModalOpened, { open: openAttendanceModal, close: closeAttendanceModal }] = useDisclosure(false);
    const [employeeModalOpened, { open: openEmployeeModal, close: closeEmployeeModal }] = useDisclosure(false);
    const [userModalOpened, { open: openUserModal, close: closeUserModal }] = useDisclosure(false);

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    // Dynamic employee data
    const employees = usersList.filter((u) => (u.role || '').toLowerCase().includes('employee') || (u.role || '').toLowerCase().includes('admin'));
    const newHires = [...usersList].reverse().slice(0, 3);
    const totalEmployeesCount = employees.length;

    if (loading && usersList.length === 0) {
        return <div className="flex justify-center py-20"><Loader size="md" /></div>;
    }

    return (
        <div className="w-full mt-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center">
                <Text className="text-2xl font-black text-gray-800 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Employee Command
                </Text>
                <div className="flex gap-2">
                    <Button
                        variant="light"
                        radius="md"
                        onClick={openUserModal}
                        className="font-bold border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    >
                        Create User
                    </Button>
                    <Button
                        variant="light"
                        radius="md"
                        onClick={openEmployeeModal}
                        className="font-bold border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    >
                        Create Employee
                    </Button>
                    <Button
                        variant="light"
                        radius="md"
                        onClick={openAttendanceModal}
                        className="font-bold border-indigo-100"
                    >
                        Mark Attendance
                    </Button>
                </div>
            </div>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                <StatsCard title="Personnel Count" value={totalEmployeesCount.toLocaleString()} variant="blue" />
                <StatsCard title="System Uptime" value="100%" variant="green" />
                <StatsCard title="Monthly Absences" value="12" variant="orange" />
            </SimpleGrid>

            {/* Tables Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Employee List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <Text className="font-bold text-gray-800 text-lg tracking-tight">Enterprise Roster</Text>
                        <Badge variant="dot">Live Feed</Badge>
                    </div>

                    <div className="flex text-[10px] uppercase font-bold text-gray-400 mb-3 px-2 tracking-widest">
                        <span className="w-10">Ref</span>
                        <span className="flex-1">Identity</span>
                        <span className="w-24 text-center">Status</span>
                    </div>

                    <div className="space-y-1">
                        {employees.slice(0, 6).map((user, i) => (
                            <div key={user.uid || i} className="flex items-center py-3 px-2 rounded-lg hover:bg-slate-50 transition-colors group">
                                <span className="text-gray-300 w-10 font-mono text-[10px]">#0{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <Text size="sm" fw={700} className="text-gray-700 truncate">{user.name || 'Anonymous'}</Text>
                                    <Text size="xs" color="dimmed" className="truncate tracking-tighter uppercase font-medium">{user.role || 'Personnel'}</Text>
                                </div>
                                <div className="w-24 flex justify-center">
                                    <Badge size="xs" variant="light" color="indigo" radius="sm">Verified</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* New Hires List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <Text className="font-bold text-gray-800 text-lg tracking-tight">Recent Onboarding</Text>
                    </div>

                    <div className="flex text-[10px] uppercase font-bold text-gray-400 mb-3 px-2 tracking-widest">
                        <span className="w-10">Ref</span>
                        <span className="flex-1">Identity</span>
                        <span className="w-24 text-center">Protocol</span>
                    </div>

                    <div className="space-y-1">
                        {newHires.map((user, i) => (
                            <div key={user.uid || i} className="flex items-center py-3 px-2 rounded-lg hover:bg-slate-50 transition-colors group">
                                <span className="text-gray-300 w-10 font-mono text-[10px]">#E{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <Text size="sm" fw={700} className="text-gray-700 truncate">{user.name || user.email}</Text>
                                    <Text size="xs" color="dimmed" className="truncate tracking-tighter uppercase font-medium">Provisioned</Text>
                                </div>
                                <div className="w-24 flex justify-center">
                                    <Badge size="xs" variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }} radius="sm">New</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <CreationModals opened={attendanceModalOpened} onClose={closeAttendanceModal} type="attendance" />
            <CreationModals opened={employeeModalOpened} onClose={closeEmployeeModal} type="employee" />
            <CreationModals opened={userModalOpened} onClose={closeUserModal} type="user" />
        </div>
    );
}
