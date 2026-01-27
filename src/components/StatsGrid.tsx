'use client'
import { SimpleGrid as MantineSimpleGrid, SimpleGridProps } from '@mantine/core';

// Fix for React 19 type incompatibility where children is not implicit
const SimpleGrid = MantineSimpleGrid as React.FC<SimpleGridProps & { children?: React.ReactNode; className?: string }>;
import { StatsCard } from './StatsCard';

export function StatsGrid() {
    const data = [
        { title: 'Payments Received', value: '$5,200', hasViewAll: false },
        { title: 'Current Balance', value: '$12,750', hasViewAll: false },
        { title: 'Total Payments', value: '$45,300', hasViewAll: false },
        { title: 'Profit Amount', value: '$8,500', hasViewAll: false },
        { title: 'Credit to Company', value: '$3,200', hasViewAll: false },
        { title: 'Total Users', value: '1,250', hasViewAll: false },
        { title: 'Total Employees', value: '150', hasViewAll: false },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">User Dashboard</h2>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                    <StatsCard title="Payments Received" value="$5,200" />
                    <StatsCard title="Current Balance" value="$12,750" />
                    <StatsCard title="Total Payments" value="$45,300" />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" className="mt-6">
                    <StatsCard title="Profit Amount" value="$8,500" />
                    <StatsCard title="Credit to Company" value="$3,200" />
                    <StatsCard title="Total Users" value="1,250" />
                    <StatsCard title="Total Employees" value="150" />
                </SimpleGrid>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">User Management</h2>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                    <StatsCard title="Total Users" value="1,250" hasViewAll />
                    <StatsCard title="Paid Users" value="850" hasViewAll />
                    <StatsCard title="Unpaid Users" value="400" hasViewAll />
                </SimpleGrid>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Employee Dashboard</h2>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                    <StatsCard title="Total Employees" value="150" />
                    <StatsCard title="Total Attendance" value="1,100" />
                    <StatsCard title="Total Absences" value="75" />
                </SimpleGrid>
            </div>
        </div>
    );
}
