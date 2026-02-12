'use client';

import React, { useState } from 'react';
import { TextInput, PasswordInput, Button, Text, Group, Anchor, Stack, Box, Select } from '@mantine/core';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { signUpUser } from '@/redux/actions/auth-actions/auth-actions';
import { IconLock, IconAt, IconUser } from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
import { notifications } from '@mantine/notifications';

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const bars = score <= 2 ? 1 : score <= 4 ? 2 : 3;
  const barColor = score <= 2 ? '#ef4444' : score <= 4 ? '#eab308' : '#22c55e';
  const textColor = score <= 2 ? '#ef4444' : score <= 4 ? '#ca8a04' : '#16a34a';
  const label = score <= 2 ? 'Weak' : score <= 4 ? 'Medium' : 'Strong';
  return (
    <div className="flex items-center gap-2 mt-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-1 flex-1 max-w-8 rounded-full bg-gray-200"
          style={i <= bars ? { backgroundColor: barColor } : undefined}
        />
      ))}
      <span className="text-xs font-medium" style={{ color: textColor }}>{label}</span>
    </div>
  );
}

export default function SignupPage() {
  const [formStates, setFormStates] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    userType: 'user',
    loading: false,
  });
  const dispatch = useDispatch<AppDispatch>();

  const signUpHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStates((prev) => ({ ...prev, loading: true }));
    try {
      await dispatch(
        signUpUser({
          name: formStates.name,
          email: formStates.email,
          password: formStates.password,
          role: formStates.userType as 'admin' | 'user' | 'employee',
          username: formStates.username,
        })
      );
      notifications.show({
        title: 'Account created',
        message: 'Redirecting to login...',
        color: 'green',
        position: 'top-right',
      });
      setFormStates({ name: '', email: '', username: '', password: '', userType: 'user', loading: false });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1200);
    } catch (err: unknown) {
      notifications.show({
        title: 'Sign up failed',
        message: (err as Error)?.message || 'Could not create account. Please try again.',
        color: 'red',
        position: 'top-right',
      });
    } finally {
      setFormStates((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="flex h-[100vh] w-full bg-white">
      {/* <div className="flex min-h-screen w-full bg-white"> */}
      <div className="hidden lg:flex lg:w-[42%] min-h-screen bg-[#1e40af] p-10 flex-col justify-center">
        <div className="max-w-sm mx-auto w-full">
          <Group gap="xs" mb="xl">
            <Box className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden">
              <Image src="/image/logo.png" alt="CoreManage" width={26} height={26} className="object-contain" />
            </Box>
            <Text className="font-bold text-white" style={{ fontSize: 'var(--text-lg)' }}>CoreManage</Text>
          </Group>
          <Text className="font-bold text-white leading-tight mb-2" style={{ fontSize: 'var(--text-xl)' }}>
            Join our business ecosystem.
          </Text>
          <Text className="text-white/70 mb-8" style={{ fontSize: 'var(--text-sm)' }}>
            Create an account to get started.
          </Text>
          <Stack gap="xs">
            {['Intelligent Billing', 'User Hierarchy', 'Live Dashboard'].map((title, i) => (
              <Group key={i} gap="sm" className="p-3 rounded-lg bg-white/[0.05] border border-white/10">
                <Box className="w-8 h-8 rounded-md bg-[#6366f1]/20 flex items-center justify-center">
                  <Box className="w-2 h-2 rounded-full bg-[#6366f1]" />
                </Box>
                <Text className="text-white font-semibold text-sm">{title}</Text>
              </Group>
            ))}
          </Stack>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-6 sm:p-8 bg-white overflow-auto">
        <div className="w-full max-w-[320px] py-4">
          <div className="text-center lg:text-left mb-3">
            <div className="lg:hidden flex justify-center mb-4">
              <Box className="w-9 h-9 rounded-lg bg-[#6366f1] flex items-center justify-center">
                <Image src="/image/logo.png" alt="CoreManage" width={22} height={22} className="object-contain opacity-90" />
              </Box>
            </div>
            <Text className="font-bold text-gray-800" style={{ fontSize: 'var(--text-xl)' }}>Create account</Text>
            {/* <Text className="text-gray-500 mt-0.5" style={{ fontSize: 'var(--text-sm)' }}>Fill in your details</Text> */}
          </div>

          <form onSubmit={signUpHandler}>
            <Stack gap="md">
              <TextInput
                label="Full name"
                placeholder="John Doe"
                required
                value={formStates.name}
                onChange={(e) => setFormStates((prev) => ({ ...prev, name: e.target.value }))}
                // leftSection={<IconUser size={18} className="text-gray-400" />}
                size="md"
                radius="md"
              />
              <TextInput
                label="Email"
                placeholder="name@company.com"
                required
                type="email"
                value={formStates.email}
                onChange={(e) => setFormStates((prev) => ({ ...prev, email: e.target.value }))}
                // leftSection={<IconAt size={18} className="text-gray-400" />}
                size="md"
                radius="md"
              />
              <TextInput
                label="Username"
                placeholder="johndoe"
                required
                value={formStates.username}
                onChange={(e) => setFormStates((prev) => ({ ...prev, username: e.target.value }))}
                // leftSection={<IconUser size={18} className="text-gray-400" />}
                size="md"
                radius="md"
              />
              <PasswordInput
                label="Password"
                placeholder="Create a strong password"
                required
                value={formStates.password}
                onChange={(e) => setFormStates((prev) => ({ ...prev, password: e.target.value }))}
                // leftSection={<IconLock size={18} className="text-gray-400" />}
                size="md"
                radius="md"
              />
              <PasswordStrength password={formStates.password} />
              <Select
                label="Role"
                placeholder="Select role"
                value={formStates.userType}
                onChange={(v) => setFormStates((prev) => ({ ...prev, userType: v || 'user' }))}
                data={[
                  { value: 'user', label: 'User' },
                  { value: 'employee', label: 'Employee' },
                  { value: 'admin', label: 'Admin' },
                ]}
                size="md"
                radius="md"
              />
              <Button
                type="submit"
                fullWidth
                size="md"
                radius="md"
                loading={formStates.loading}
                className="bg-[#6366f1] hover:bg-[#4f46e5] font-semibold"
              >
                Create account
              </Button>
            </Stack>
          </form>

          <Text className="text-center text-sm text-gray-500 mt-3">
            Already have an account?{' '}
            <Anchor component={Link} href="/login" className="text-[#6366f1] font-semibold">
              Sign in
            </Anchor>
          </Text>
        </div>
      </div>
    </div>
  );
}
