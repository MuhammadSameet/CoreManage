'use client';

import React, { useState } from 'react';
import { TextInput, PasswordInput, Button, Text, Group, Anchor, Divider, Stack, Box } from '@mantine/core';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { logInUser } from '@/redux/actions/auth-actions/auth-actions';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { setCookie } from 'cookies-next';
import { LOGIN_USER } from '@/redux/reducers/auth-reducer/auth-reducer';
import { IconBrandGoogle, IconLock, IconAt } from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
import { notifications } from '@mantine/notifications';
import logoIcon from '../../assets/images/logo.jpg';
import logoIconmini from '../../assets/images/logo2.jpg';

const provider = new GoogleAuthProvider();

export default function LoginPage() {
  const [formStates, setFormStates] = useState({
    identifier: '',
    password: '',
    loading: false,
  });
  const dispatch = useDispatch<AppDispatch>();

  const logInHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStates((prev) => ({ ...prev, loading: true }));
    try {
      await dispatch(logInUser({ email: formStates.identifier.trim(), password: formStates.password }));
      window.location.href = '/users';
    } catch (error: unknown) {
      notifications.show({
        title: 'Login Failed',
        message: (error as Error)?.message || 'Invalid email or password. Please try again.',
        color: 'red',
        position: 'top-right',
      });
    } finally {
      setFormStates((prev) => ({ ...prev, loading: false }));
    }
  };

  const googleSignInHandler = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      const user = res?.user;
      const token = await user?.getIdToken();
      if (token) {
        setCookie('token', token);
        dispatch(
          LOGIN_USER({
            email: user?.email ?? null,
            uid: user?.uid,
            name: user?.displayName ?? null,
            dp: user?.photoURL ?? null,
          })
        );
        window.location.reload();
      }
    } catch {
      notifications.show({
        title: 'Google Sign-in failed',
        message: 'Could not sign in with Google. Try again.',
        color: 'red',
        position: 'top-right',
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      <div className="hidden lg:flex lg:w-[42%] min-h-screen bg-[#1e40af] p-10 flex-col justify-center">
        <div className="max-w-sm mx-auto w-full">
          <Group gap="xs" mb="xl">
            <Box className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden">
              <Image src={logoIcon} alt="CoreManage" width={40} height={40} className="object-contain" />
            </Box>
            <Text className="font-bold text-white" style={{ fontSize: 'var(--text-lg)' }}>Core<span className='text-[#0f172a]'>Manage</span></Text>
          </Group>
          <Text className="font-bold text-white leading-tight mb-2" style={{ fontSize: 'var(--text-xl)' }}>
            Master your business ecosystem.
          </Text>
          <Text className="text-white/70 mb-8" style={{ fontSize: 'var(--text-sm)' }}>
            Sign in to access your dashboard and manage billing.
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

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-white">
        <div className="w-full max-w-[320px]">
          <div className="text-center lg:text-left mb-6">
            <div className="lg:hidden flex justify-center mb-4">
              {/* <Box className="w-9 h-9 rounded-lg bg-[#6366f1] flex items-center justify-center"> */}
              <Box className="w-[30px] h-[30px] rounded-lg bg-[#6366f1] flex items-center justify-center">
                <Image src={logoIconmini} alt="CoreManage" width={60} height={60} className="object-contain opacity-90" />
              </Box>
            </div>
            <Text className="font-bold text-gray-800" style={{ fontSize: 'var(--text-xl)' }}>Welcome back</Text>
            <Text className="text-gray-500 mt-0.5" style={{ fontSize: 'var(--text-sm)' }}>Sign in to continue</Text>
          </div>

          <Button
            fullWidth
            variant="outline"
            size="md"
            radius="md"
            leftSection={<IconBrandGoogle size={18} />}
            onClick={googleSignInHandler}
            className="font-semibold border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Continue with Google
          </Button>

          <Divider label="or" labelPosition="center" my="md" />

          <form onSubmit={logInHandler}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="name@company.com"
                required
                type="email"
                value={formStates.identifier}
                onChange={(e) => setFormStates((prev) => ({ ...prev, identifier: e.target.value }))}
                // leftSection={<IconAt size={18} className="text-gray-400" />}
                size="md"
                radius="md"
                classNames={{ input: 'font-normal' }}
              />
              <PasswordInput
                label="Password"
                placeholder="Enter password"
                required
                value={formStates.password}
                onChange={(e) => setFormStates((prev) => ({ ...prev, password: e.target.value }))}
                leftSection={<IconLock size={18} className="text-gray-400" />}
                size="md"
                radius="md"
                classNames={{ input: 'font-normal' }}
              />
              <Button
                type="submit"
                fullWidth
                size="md"
                radius="md"
                loading={formStates.loading}
                className="bg-[#6366f1] hover:bg-[#4f46e5] font-semibold"
              >
                Sign in
              </Button>
            </Stack>
          </form>

          <Text className="text-center text-sm text-gray-500 mt-6">
            New user?{' '}
            <Anchor component={Link} href="/signup" className="text-[#6366f1] font-semibold">
              Sign up
            </Anchor>
          </Text>
        </div>
      </div>
    </div>
  );
}
