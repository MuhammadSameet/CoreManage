'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchStatsData } from '@/redux/actions/stats-actions/stats-actions';
import { fetchAllUsers } from '@/redux/actions/user-actions/user-actions';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { SimpleGrid, Text, Button, Loader, Paper, Title, Menu, ActionIcon, rem, Badge } from '@mantine/core';
import { IconUsers, IconPlus, IconSearch, IconDatabaseExport, IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <Text className="page-heading font-bold text-gray-800">
            Admin Dashboard
          </Text>
          <Text className="page-description mt-1">
            Full overview and management.
          </Text>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Button
            className="bg-gradient-to-r from-[#00A5A8] to-[#25C4DD] hover:from-[#008e91] hover:to-[#1fa9c0] h-[46px] flex-1 lg:flex-none text-white border-none shadow-md hover:shadow-lg active:scale-95 transition-all"
            radius="md"
            leftSection={<IconPlus size={18} />}
            onClick={openUser}
          >
            Create User
          </Button>
          <Button
            variant="outline"
            className="text-[#00A5A8] border-[#00A5A8]/30 hover:bg-[#00A5A8]/5 h-[46px] flex-1 lg:flex-none shadow-sm hover:shadow-md active:scale-95 transition-all"
            radius="md"
            leftSection={<IconPlus size={18} />}
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
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <StatsCard
          title="Registered users"
          value={totalUsers.toLocaleString()}
          variant="default"
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
