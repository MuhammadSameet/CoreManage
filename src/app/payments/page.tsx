'use client';

import React from 'react';
import {
    SimpleGrid as MantineSimpleGrid,
    Text as MantineText,
    Badge as MantineBadge,
    Table as MantineTable,
    Paper as MantinePaper,
    ActionIcon as MantineActionIcon
} from '@mantine/core';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { IconDownload, IconDotsVertical, IconCheck, IconClock, IconAlertCircle } from '@tabler/icons-react';

const SimpleGrid = MantineSimpleGrid;
const Table = MantineTable;
const Text = MantineText;
const Paper = MantinePaper;
const Badge = MantineBadge;
const ActionIcon = MantineActionIcon;

const paymentHistory = [
    { id: '#PAY-8821', user: 'Ama Houton', date: 'Oct 12, 2023', amount: '$1,200', status: 'Completed', method: 'Credit Card' },
    { id: '#PAY-8822', user: 'John Doe', date: 'Oct 14, 2023', amount: '$850', status: 'Pending', method: 'Bank Transfer' },
    { id: '#PAY-8825', user: 'Jane Smith', date: 'Oct 15, 2023', amount: '$2,400', status: 'Completed', method: 'PayPal' },
    { id: '#PAY-8829', user: 'Mike Johnson', date: 'Oct 18, 2023', amount: '$1,100', status: 'Failed', method: 'Credit Card' },
    { id: '#PAY-8831', user: 'Sarah Wilson', date: 'Oct 20, 2023', amount: '$920', status: 'Completed', method: 'Wire' },
];

const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        Completed: 'green',
        Pending: 'orange',
        Failed: 'red'
    };

    const icons: Record<string, React.ReactNode> = {
        Completed: <IconCheck size={12} />,
        Pending: <IconClock size={12} />,
        Failed: <IconAlertCircle size={12} />
    };

    return (
        <Badge
            variant="light"
            color={colors[status]}
            radius="sm"
            leftSection={icons[status]}
            className="font-bold py-3"
        >
            {status}
        </Badge>
    );
};

export default function PaymentsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center">
                <Text className="text-2xl font-bold text-gray-800">Payments Management</Text>
            </div>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
                <StatsCard title="Total Revenue" value="$125,400" variant="blue" />
                <StatsCard title="Pending Invoices" value="45" variant="orange" />
                <StatsCard title="Successful Transactions" value="1,120" variant="green" />
            </SimpleGrid>

            <div>
                <Text className="text-lg font-bold text-gray-800 mb-4">Transaction History</Text>
                <Paper radius="md" withBorder className="overflow-hidden border-gray-100 shadow-sm">
                    <Table verticalSpacing="md" horizontalSpacing="xl" className="min-w-[800px]">
                        <Table.Thead className="bg-gray-50/50">
                            <Table.Tr>
                                <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Transaction ID</Table.Th>
                                <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">User</Table.Th>
                                <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Date</Table.Th>
                                <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Amount</Table.Th>
                                <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Status</Table.Th>
                                <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Method</Table.Th>
                                <Table.Th aria-label="Actions" />
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {paymentHistory.map((item) => (
                                <Table.Tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <Table.Td className="font-semibold text-gray-700">{item.id}</Table.Td>
                                    <Table.Td>
                                        <Text size="sm" fw={600} className="text-gray-800">{item.user}</Text>
                                    </Table.Td>
                                    <Table.Td className="text-gray-400 text-sm">{item.date}</Table.Td>
                                    <Table.Td className="font-bold text-gray-800">{item.amount}</Table.Td>
                                    <Table.Td>
                                        <StatusBadge status={item.status} />
                                    </Table.Td>
                                    <Table.Td className="text-gray-400 text-sm">{item.method}</Table.Td>
                                    <Table.Td>
                                        <div className="flex gap-1">
                                            <ActionIcon variant="subtle" color="gray"><IconDownload size={16} /></ActionIcon>
                                            <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16} /></ActionIcon>
                                        </div>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Paper>
            </div>
        </div>
    );
}
