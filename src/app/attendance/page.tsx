'use client';

import React from 'react';
import { Card, Text, Title } from '@mantine/core';

export default function AttendancePage() {
  return (
    <div className="p-6">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={2} className="mb-4">Attendance Center</Title>
        <Text>This is the Attendance Center page where staff attendance is managed.</Text>
      </Card>
    </div>
  );
}