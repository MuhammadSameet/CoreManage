'use client';

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchStatsData } from '@/redux/actions/stats-actions/stats-actions';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SimpleGrid } from '@mantine/core';
import { useAppSelector, AppDispatch } from '@/redux/store';

export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading } = useAppSelector((state: { stats: { stats: any; loading: boolean; error: string | null } }) => state.stats);

  useEffect(() => {
    dispatch(fetchStatsData());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="w-full">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" className="mb-6">
          <StatsCard
            title="Payments Received"
            value={`Rs. ${stats.paymentsReceived.toLocaleString()}`}
            variant="blue"
          />
          <StatsCard
            title="Current Balance"
            value={`Rs. ${stats.currentBalance.toLocaleString()}`}
            variant="blue"
          />
          <StatsCard
            title="Total Payments"
            value={`Rs. ${stats.totalPayments.toLocaleString()}`}
            variant="blue"
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          <StatsCard
            title="Paid Users"
            value={stats.paidUsers.toLocaleString()}
            variant="green"
          />
          <StatsCard
            title="Unpaid Users"
            value={stats.unpaidUsers.toLocaleString()}
            variant="orange"
          />
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            variant="blue"
          />
        </SimpleGrid>
      </div>
    </div>
  );
}
