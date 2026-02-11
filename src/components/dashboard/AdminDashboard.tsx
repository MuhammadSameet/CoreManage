'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchStatsData } from '@/redux/actions/stats-actions/stats-actions';
import { fetchAllUsers } from '@/redux/actions/user-actions/user-actions';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { SimpleGrid, Text, Button, Loader, Paper, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUsers, IconPlus, IconSearch, IconDatabaseExport } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import { CreationModals } from './CreationModals';

/**
 * Admin dashboard: full stats, management cards, create user/employee.
 */
export function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { stats, loading } = useSelector((state: RootState) => state.stats);
  const { usersList } = useSelector((state: RootState) => state.userStates);
  const [userOpened, { open: openUser, close: closeUser }] = useDisclosure(false);
  const [employeeOpened, { open: openEmployee, close: closeEmployee }] = useDisclosure(false);

  useEffect(() => {
    dispatch(fetchStatsData());
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const totalUsers = usersList.length;
  const totalEmployees = usersList.filter((u) => (u.role || '').toLowerCase() === 'employee').length;

  if (loading && stats.totalUsers === 0 && stats.paymentsReceived === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Text className="page-heading font-bold text-gray-800">
            Admin Dashboard
          </Text>
          <Text className="page-description mt-1">
            Full overview and management.
          </Text>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            className="bg-[#6366f1] hover:bg-[#4f46e5]"
            radius="md"
            leftSection={<IconUsers size={16} />}
            onClick={openUser}
          >
            Create User
          </Button>
          <Button
            variant="light"
            className="text-[#6366f1] border border-[#6366f1]/30"
            radius="md"
            leftSection={<IconUsers size={16} />}
            onClick={openEmployee}
          >
            Create Employee
          </Button>
        </div>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        <StatsCard
          title="Payments Received"
          value={`Rs. ${(stats?.paymentsReceived ?? 0).toLocaleString()}`}
          variant="blue"
        />
        <StatsCard
          title="Current Balance"
          value={`Rs. ${(stats?.currentBalance ?? 0).toLocaleString()}`}
          variant="blue"
        />
        <StatsCard
          title="Total Payments"
          value={`Rs. ${(stats?.totalPayments ?? 0).toLocaleString()}`}
          variant="blue"
        />
        <StatsCard
          title="Paid Users"
          value={(stats?.paidUsers ?? 0).toLocaleString()}
          variant="green"
        />
        <StatsCard
          title="Unpaid Users"
          value={(stats?.unpaidUsers ?? 0).toLocaleString()}
          variant="orange"
        />
        <StatsCard
          title="Total Users"
          value={(stats?.totalUsers ?? totalUsers).toLocaleString()}
          variant="blue"
          action={{ label: 'View all', onClick: () => router.push('/users/roles') }}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <StatsCard
          title="Registered users"
          value={totalUsers.toLocaleString()}
          variant="default"
          action={{ label: 'Roles', onClick: () => router.push('/users/roles') }}
        />
        <StatsCard
          title="Employees"
          value={totalEmployees.toLocaleString()}
          variant="default"
        />
      </SimpleGrid>

      <DashboardCharts />

      <CreationModals opened={userOpened} onClose={closeUser} type="user" />
      <CreationModals opened={employeeOpened} onClose={closeEmployee} type="employee" />
    </div>
  );
}
