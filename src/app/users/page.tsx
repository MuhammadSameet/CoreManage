'use client';

import React from 'react';
import { UserManagementSection } from '@/components/dashboard/UserManagementSection';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <UserManagementSection />
      {/* The list/table and stats are now unified in the UserManagementSection */}
    </div>
  );
}
