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
  Select as MantineSelect,
  Stack as MantineStack,
  Box,
  Title as MantineTitle
} from '@mantine/core';
import { useDispatch } from "react-redux";
import { signUpUser } from "@/redux/actions/auth-actions/auth-actions";
import { AppDispatch } from "@/redux/store";
import { IconUser, IconLock, IconAt, IconArrowLeft, IconStars, IconCircleCheckFilled } from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
const MImage = Image;

// React 19 type fixes
const TextInput = MantineTextInput;
const PasswordInput = MantinePasswordInput;
const Select = MantineSelect;
const Button = MantineButton;
const MText = MantineText;
const MGroup = MantineGroup;
const MStack = MantineStack;
const MTitle = MantineTitle;

const SignUp = () => {
  const [formStates, setFormStates] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "User",
    loading: false,
  });

  const dispatch = useDispatch<AppDispatch>();

  const clearAllStates = () => {
    setFormStates({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "User",
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
        role: formStates.role
      }));
      clearAllStates();
    } finally {
      setFormStates(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Left Side: Hero Section with Elite Mesh */}
      <div className="hidden lg:flex w-[45%] h-full relative bg-[#060b18] p-12 flex-col justify-center overflow-hidden">
        <div className="absolute top-[-25%] left-[-20%] w-[120%] h-[120%] bg-indigo-600 rounded-full blur-[180px] opacity-20 animate-pulse duration-[10000ms]" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[130%] h-[130%] bg-indigo-900 rounded-full blur-[200px] opacity-40 animate-pulse duration-[8000ms]" />

        <div className="relative z-10 max-w-xl mx-auto px-8">
          <MGroup gap="xs" mb={20} justify="center" className="animate-in fade-in slide-in-from-top-6 duration-1000">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(79,70,229,0.2)] transform hover:rotate-6 transition-transform overflow-hidden relative p-1">
              <MImage
                src="/image/logo.png"
                alt="CoreManage Logo"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <MText className="text-xl font-black text-white tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
              CoreManage
            </MText>
          </MGroup>

          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 text-center">
            <MGroup gap="xs" mb="xs" justify="center">
              <IconStars className="text-indigo-400" size={16} />
              <MText className="text-indigo-400 font-extrabold uppercase tracking-[0.4em] text-[7px]">Onboarding v4.0.2</MText>
            </MGroup>
            <MTitle order={1} className="text-[1.8rem] md:text-[2rem] font-black text-white leading-[1.1] mb-5 tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Build with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-white to-indigo-200">precision.</span>
            </MTitle>

            <MStack gap="xs" mt={15} align="center">
              {[
                { title: "Attendance Tracking", desc: "Enterprise-grade presence monitoring." },
                { title: "Payment Hub", desc: "Financial engineering for billing." },
                { title: "Team Management", desc: "Collaborative controls for workforces." }
              ].map((item, i) => (
                <MGroup key={i} align="center" gap="sm" className="w-full justify-start p-3 rounded-lg bg-white/[0.03] backdrop-blur-[2px] border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all duration-500 group cursor-default">
                  <div className="flex-shrink-0 w-8 h-8 rounded-md bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconCircleCheckFilled className="text-indigo-400" size={18} />
                  </div>
                  <div className="text-left">
                    <MText className="text-white font-extrabold text-base mb-0 tracking-tight">{item.title}</MText>
                    <MText className="text-indigo-200/40 text-[11px] font-medium leading-tight">{item.desc}</MText>
                  </div>
                </MGroup>
              ))}
            </MStack>
          </div>
        </div>

        <div className="absolute bottom-10 left-0 w-full text-center z-10 opacity-20 hover:opacity-100 transition-opacity">
          <MText className="text-white text-[10px] font-bold tracking-[0.5em] uppercase">Modular Management Solutions</MText>
        </div>
      </div>

      {/* Right Side: Signup Form - Optimised for zero-scroll */}
      <div className="w-full lg:w-[55%] h-full flex flex-col items-center justify-center p-6 md:p-12 bg-white relative overflow-hidden">
        {/* Subtle Right-Side Decorative Elements */}
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="w-full max-w-[310px] relative z-10">
          <div className="text-center lg:hidden mb-6">
            <MGroup justify="center" gap="xs">
              <div className="w-7 h-7 rounded-md bg-[#6366f1] flex items-center justify-center shadow-lg">
                <Box className="w-3 h-3 rounded-full bg-white" />
              </div>
              <MText className="text-lg font-black text-[#0f172a]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                CoreManage
              </MText>
            </MGroup>
          </div>

          <div className="mb-5 text-center lg:text-left animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <MTitle order={2} className="text-2xl font-black text-[#0f172a] mb-1 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Create account
            </MTitle>
            <MText className="text-slate-500 font-semibold text-[13px]">
              Join the elite platform for business.
            </MText>
          </div>

          <form onSubmit={signUpHandler}>
            <MStack gap="xs">
              <TextInput
                label="Full Name"
                placeholder="Name"
                required
                value={formStates.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormStates({ ...formStates, name: e.target.value })}
                radius="md"
                size="xs"
                leftSection={<IconUser size={16} className="text-indigo-500" />}
                className="font-bold"
                styles={{
                  input: { height: '36px', border: '1.2px solid #f8fafc', '&:focus': { borderColor: '#6366f1' } },
                  label: { marginBottom: '2px', fontSize: '11px', color: '#94a3b8' }
                }}
              />
              <TextInput
                label="Work Email"
                placeholder="Email"
                required
                value={formStates.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormStates({ ...formStates, email: e.target.value })}
                radius="md"
                size="xs"
                leftSection={<IconAt size={16} className="text-indigo-500" />}
                className="font-bold"
                styles={{
                  input: { height: '36px', border: '1.2px solid #f8fafc', '&:focus': { borderColor: '#6366f1' } },
                  label: { marginBottom: '2px', fontSize: '11px', color: '#94a3b8' }
                }}
              />
              {/* Roll (Role) Selection */}
              <Select
                label="Select Role"
                placeholder="Role"
                required
                data={[
                  { value: 'Admin', label: 'Admin' },
                  { value: 'User', label: 'User' },
                  { value: 'Employee', label: 'Employee' },
                ]}
                value={formStates.role}
                onChange={(value: string | null) => setFormStates({ ...formStates, role: value || "User" })}
                radius="md"
                size="xs"
                leftSection={<IconStars size={16} className="text-indigo-500" />}
                className="font-bold"
                styles={{
                  input: { height: '36px', border: '1.2px solid #f8fafc', '&:focus': { borderColor: '#6366f1' } },
                  label: { marginBottom: '2px', fontSize: '11px', color: '#94a3b8' }
                }}
              />
              <PasswordInput
                label="Security Key"
                placeholder="Password"
                required
                value={formStates.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormStates({ ...formStates, password: e.target.value })}
                radius="md"
                size="xs"
                leftSection={<IconLock size={16} className="text-indigo-500" />}
                className="font-bold"
                styles={{
                  input: { height: '36px', border: '1.2px solid #f8fafc', '&:focus': { borderColor: '#6366f1' } },
                  label: { marginBottom: '2px', fontSize: '11px', color: '#94a3b8' }
                }}
              />
              <PasswordInput
                label="Verify Key"
                placeholder="Confirm"
                required
                value={formStates.confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormStates({ ...formStates, confirmPassword: e.target.value })}
                radius="md"
                size="xs"
                leftSection={<IconLock size={16} className="text-indigo-500" />}
                className="font-bold"
                styles={{
                  input: { height: '36px', border: '1.2px solid #f8fafc', '&:focus': { borderColor: '#6366f1' } },
                  label: { marginBottom: '2px', fontSize: '11px', color: '#94a3b8' }
                }}
              />

              <Button
                type="submit"
                fullWidth
                mt="sm"
                radius="xl"
                h={42}
                className="bg-indigo-600 hover:bg-indigo-700 transition-all shadow-[0_10px_20px_-5px_rgba(79,70,229,0.2)] text-sm font-black active:scale-[0.98] border-none"
                loading={formStates.loading}
              >
                Initiate Onboarding
              </Button>
            </MStack>
          </form>

          <MText ta="center" size="xs" mt="sm" className="text-slate-400 font-bold">
            Already unified?{' '}
            <Anchor component={Link} href="/login" className="text-indigo-600 font-bold hover:underline" style={{ textDecoration: 'none' }}>
              Authenticate
            </Anchor>
          </MText>

          <div className="flex justify-center mt-4">
            <Anchor component={Link} href="/" size="xs" className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 font-extrabold transition-colors" style={{ textDecoration: 'none' }}>
              <IconArrowLeft size={14} /> Exit to Origin
            </Anchor>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
