'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Loader } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';

/**
 * Role-based dashboard. Block /users for role:user (redirect to /users/detail).
 */
export default function UsersPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.authStates);
  const role = (isAuthenticated?.role as string) || 'user';
  const roleLower = role.toLowerCase();

  useEffect(() => {
    if (roleLower === 'user' && isAuthenticated?.uid) {
      router.replace('/users/detail');
    }
  }, [roleLower, isAuthenticated?.uid, router]);

  if (!isAuthenticated?.uid) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader size="lg" />
      </div>
    );
  }

  if (roleLower === 'user') {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader size="lg" />
      </div>
    );
  }

  if (roleLower === 'admin') {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard />;
}
