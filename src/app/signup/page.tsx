// Sign Up Page - Re-designed for STRICT Full Screen Impact
"use client";

import React, { useState } from "react";
import {
  TextInput as MantineTextInput,
  PasswordInput as MantinePasswordInput,
  Button as MantineButton,
  Text as MantineText,
  Group as MantineGroup,
  Anchor,
  Stack as MantineStack,
  Box,
  Title as MantineTitle
} from '@mantine/core';
import { useDispatch } from "react-redux";
import { signUpUser } from "@/redux/actions/auth-actions/auth-actions";
import { AppDispatch } from "@/redux/store";
import { IconUser, IconLock, IconAt, IconArrowLeft, IconRocket, IconStars } from '@tabler/icons-react';
import Link from 'next/link';

// React 19 type fixes
const TextInput = MantineTextInput as any;
const PasswordInput = MantinePasswordInput as any;
const Button = MantineButton as any;
const Text = MantineText as any;
const Group = MantineGroup as any;
const Stack = MantineStack as any;
const Title = MantineTitle as any;

const SignUp = () => {
  const [formStates, setFormStates] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    loading: false,
  });

  const dispatch = useDispatch<AppDispatch>();

  const clearAllStates = () => {
    setFormStates({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      loading: false,
    });
  };

  const signUpHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formStates.password !== formStates.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setFormStates(prev => ({ ...prev, loading: true }));
    try {
      await dispatch(signUpUser({
        name: formStates.name,
        email: formStates.email,
        password: formStates.password,
        role: 'User'
      }));
      clearAllStates();
    } finally {
      setFormStates(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Left Side: Hero Section with Elite Mesh */}
      <div className="hidden lg:flex w-[45%] h-full relative bg-[#0f172a] p-12 flex-col justify-between overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-blue-600 rounded-full blur-[180px] opacity-30 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[100%] bg-indigo-900 rounded-full blur-[160px] opacity-50" />

        <div className="relative z-10">
          <Group gap="xs" mb={60}>
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-2xl">
              <Box className="w-5 h-5 rounded-md bg-[#1e40af]" />
            </div>
            <Text className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              CoreManage
            </Text>
          </Group>

          <div className="max-w-md animate-in fade-in slide-in-from-left-8 duration-1000">
            <Group gap="xs" mb="lg">
              <IconStars className="text-blue-400" size={28} />
              <Text className="text-blue-400 font-black uppercase tracking-widest text-[10px]">Onboarding v4.0</Text>
            </Group>
            <Title order={1} className="text-[3.2rem] font-black text-white leading-tight mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Design <br />
              <span className="text-blue-400">excellence.</span>
            </Title>

            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
              <Group align="flex-start" gap="lg">
                <div className="p-3 rounded-2xl bg-blue-500/20 shadow-inner">
                  <IconRocket className="text-white" size={28} />
                </div>
                <div>
                  <Text className="text-white font-black text-xl mb-1">Elite Infrastructure</Text>
                  <Text className="text-blue-200/60 text-sm font-medium leading-relaxed">Instantly provision your management ecosystem with enterprise-grade stability.</Text>
                </div>
              </Group>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto opacity-30">
          <Text className="text-white text-xs font-semibold italic">Trusted by industry leaders worldwide.</Text>
        </div>
      </div>

      {/* Right Side: Signup Form - Optimised for zero-scroll */}
      <div className="w-full lg:w-[55%] h-full flex flex-col items-center justify-center p-6 md:p-12 bg-slate-50 overflow-hidden">
        <div className="w-full max-w-sm">
          <div className="text-center lg:hidden mb-8">
            <Group justify="center" gap="xs">
              <div className="w-10 h-10 rounded-lg bg-[#1e40af] flex items-center justify-center shadow-lg">
                <Box className="w-5 h-5 rounded-full bg-white" />
              </div>
              <Text className="text-2xl font-black text-[#0f172a]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                CoreManage
              </Text>
            </Group>
          </div>

          <div className="mb-6 text-center lg:text-left">
            <Title order={2} className="text-[1.75rem] font-black text-[#0f172a] mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Create account
            </Title>
            <Text c="dimmed" size="xs" className="font-bold">
              Join the elite platform for modern business.
            </Text>
          </div>

          <form onSubmit={signUpHandler}>
            <Stack gap="xs">
              <TextInput
                label="Full Name"
                placeholder="Enter your identify"
                required
                value={formStates.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormStates({ ...formStates, name: e.target.value })}
                radius="md"
                size="md"
                leftSection={<IconUser size={18} className="text-blue-500" />}
                className="font-bold"
              />
              <TextInput
                label="Work Email"
                placeholder="name@work.com"
                required
                value={formStates.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormStates({ ...formStates, email: e.target.value })}
                radius="md"
                size="md"
                leftSection={<IconAt size={18} className="text-blue-500" />}
                className="font-bold"
              />
              <PasswordInput
                label="Security Key"
                placeholder="Min. 8 characters"
                required
                value={formStates.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormStates({ ...formStates, password: e.target.value })}
                radius="md"
                size="md"
                leftSection={<IconLock size={18} className="text-blue-500" />}
                className="font-bold"
              />
              <PasswordInput
                label="Verify Key"
                placeholder="Confirm your key"
                required
                value={formStates.confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormStates({ ...formStates, confirmPassword: e.target.value })}
                radius="md"
                size="md"
                leftSection={<IconLock size={18} className="text-blue-500" />}
                className="font-bold"
              />

              <Button
                type="submit"
                fullWidth
                mt="lg"
                radius="xl"
                h={54}
                className="bg-[#1e40af] hover:bg-blue-800 transition-all shadow-2xl shadow-blue-200 text-lg font-black active:scale-[0.98]"
                loading={formStates.loading}
              >
                Initiate Onboarding
              </Button>
            </Stack>
          </form>

          <Text ta="center" size="xs" mt="md" className="text-gray-500 font-bold">
            Already unified?{' '}
            <Anchor component={Link} href="/login" className="text-blue-600 font-black hover:underline">
              Authenticate
            </Anchor>
          </Text>

          <div className="flex justify-center mt-12">
            <Anchor component={Link} href="/" size="xs" className="text-gray-400 hover:text-[#1e40af] flex items-center gap-1 font-black transition-colors">
              <IconArrowLeft size={12} /> Exit to Origin
            </Anchor>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
