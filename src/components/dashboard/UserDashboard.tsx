'use client';

import React from 'react';
import { Text, Paper, Button } from '@mantine/core';
import { IconReceipt } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

/**
 * Minimal dashboard for role: user only.
 * No admin/employee features, no management stats.
 */
export function UserDashboard() {
  const router = useRouter();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div>
        <Text className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
          User Dashboard
        </Text>
        <Text className="text-gray-500 text-sm mt-1">
          View your payment history and account activity.
        </Text>
      </div>

      <Paper p="xl" radius="md" withBorder className="border-gray-100 shadow-sm bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#6366f1]/10 flex items-center justify-center flex-shrink-0">
              <IconReceipt className="text-[#6366f1]" size={28} />
            </div>
            <div>
              <Text className="font-semibold text-gray-800">My payments</Text>
              <Text className="text-sm text-gray-500">See your payment records and balance.</Text>
            </div>
          </div>
          <Button
            className="bg-[#6366f1] hover:bg-[#4f46e5] flex-shrink-0"
            radius="md"
            onClick={() => router.push('/users/detail')}
          >
            View my payments
          </Button>
        </div>
      </Paper>

      <Text className="text-xs text-gray-400 text-center sm:text-left">
        You have access only to your own dashboard. Contact an administrator for more features.
      </Text>
    </div>
  );
}
