'use client';

import React from 'react';
import { Card, Text, Title } from '@mantine/core';

export default function LeaveManagementPage() {
  return (
    <div className="p-6">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={2} className="mb-4">Leave Management</Title>
        <Text>This is the Leave Management page where staff leave requests are handled.</Text>
      </Card>
    </div>
  );
}