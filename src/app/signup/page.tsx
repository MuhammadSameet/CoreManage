// Sign Up Page - Following the same design pattern as login page
"use client";

import React, { useState } from 'react';
import {
    TextInput as MantineTextInput,
    PasswordInput as MantinePasswordInput,
    Button as MantineButton,
    Text as MantineText,
    Group as MantineGroup,
    Anchor,
    Divider,
    Stack as MantineStack,
    Box,
    Title as MantineTitle,
    Select as MantineSelect
} from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from "@/redux/store";
import { signUpUser } from '@/redux/actions/auth-actions/auth-actions'; // Using auth-actions instead of signup-actions
import { IconLock, IconAt, IconUser, IconCircleCheckFilled } from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
import { notifications } from '@mantine/notifications';

// React 19 type fixes
const TextInput = MantineTextInput;
const PasswordInput = MantinePasswordInput;
const Button = MantineButton;
const MText = MantineText;
const MGroup = MantineGroup;
const MStack = MantineStack;
const MTitle = MantineTitle;
const MSelect = MantineSelect;

// Custom password strength checker
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
    const calculateStrength = (pwd: string) => {
        let score = 0;
        if (!pwd) return { score: 0, label: '', color: '' };

        // Length check
        if (pwd.length >= 8) score += 1;
        if (pwd.length >= 12) score += 1;

        // Character variety checks
        if (/[A-Z]/.test(pwd)) score += 1; // Uppercase
        if (/[a-z]/.test(pwd)) score += 1; // Lowercase
        if (/[0-9]/.test(pwd)) score += 1; // Numbers
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1; // Special chars

        if (score <= 2) return { score: 1, label: 'Weak', color: 'red' };
        if (score <= 4) return { score: 2, label: 'Medium', color: 'yellow' };
        return { score: 3, label: 'Strong', color: 'green' };
    };

    const { score, label, color } = calculateStrength(password);

    const strengthBars = [1, 2, 3].map((bar) => (
        <div
            key={bar}
            className={`h-1 w-8 mr-1 rounded-full ${bar <= score ? (color === 'red' ? 'bg-red-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`}
        />
    ));

    return (
        <div className="mt-1 mb-3">
            <div className="flex items-center">
                {strengthBars}
                {label && (
                    <span className={`ml-2 text-xs font-bold ${color === 'red' ? 'text-red-500' : color === 'yellow' ? 'text-yellow-500' : 'text-green-500'}`}>
                        {label}
                    </span>
                )}
            </div>
        </div>
    );
};

const SignUp = () => {
    const [formStates, setFormStates] = useState({
        name: "",
        email: "",
        username: "", // Username field that will be saved as User ID in uploadEntry
        password: "",
        userType: "user", // Changed to userType to include user/employee/admin
        loading: false
    });

    const [error, setError] = useState<string | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const authState = useSelector((state: RootState) => state.authStates); // Changed to authStates

    const clearAllStates = () => {
        setFormStates({
            name: "",
            email: "",
            username: "",
            password: "",
            userType: "user",
            loading: false
        });
    }

    const signUpHandler = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setFormStates(prev => ({ ...prev, loading: true }));
        try {
            // Using the auth action instead of signup action to ensure consistency
            await dispatch(signUpUser({
                name: formStates.name,
                email: formStates.email,
                password: formStates.password,
                role: formStates.userType as 'admin' | 'user' | 'employee', // Pass userType as role
                username: formStates.username // Pass username for uploadEntry
            }));

            // Show success notification
            notifications.show({
                title: 'Success',
                message: 'Account created successfully! Redirecting to login...',
                color: 'green',
                position: 'top-right'
            });

            // Reset form on successful signup
            clearAllStates();
            
            // Redirect to login after a short delay
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } catch (err: any) {
            // Show error notification
            notifications.show({
                title: 'Sign Up Failed',
                message: err.message || 'An error occurred during sign up. Please try again.',
                color: 'red',
                position: 'top-right'
            });
        } finally {
            setFormStates(prev => ({ ...prev, loading: false }));
        }
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white">
            {/* Left Side: Hero Section with Mesh Gradient */}
            <div className="hidden lg:flex w-[45%] h-full relative bg-[#060b18] p-12 flex-col justify-center overflow-hidden">
                {/* Advanced Animated Mesh Gradient */}
                <div className="absolute top-[-25%] left-[-20%] w-[120%] h-[120%] bg-indigo-600 rounded-full blur-[180px] opacity-20 animate-pulse duration-[10000ms]" />
                <div className="absolute bottom-[-30%] right-[-15%] w-[130%] h-[130%] bg-indigo-900 rounded-full blur-[200px] opacity-40 animate-pulse duration-[8000ms]" />
                <div className="absolute top-[10%] right-[-10%] w-[70%] h-[70%] bg-violet-600 rounded-full blur-[150px] opacity-20" />

                <div className="relative z-10 max-w-lg mx-auto px-8">
                    <MGroup gap="xs" mb={25} justify="center" className="animate-in fade-in slide-in-from-top-6 duration-1000">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(79,70,229,0.2)] transform hover:rotate-6 transition-transform overflow-hidden relative p-1">
                            <Image
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
                        <MTitle order={1} className="text-[1.6rem] md:text-[1.8rem] font-black text-white leading-[1.1] mb-5 tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Join our <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-white to-indigo-200">business ecosystem.</span>
                        </MTitle>

                        <MStack gap="xs" mt={20} align="center">
                            {[
                                { title: "Intelligent Billing", desc: "Automate complex reconciliation and invoicing." },
                                { title: "User Hierarchy", desc: "Secure multi-tier access for global teams." },
                                { title: "Live Dashboard", desc: "Real-time analytics engine for control." }
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

                <div className="absolute bottom-6 left-0 w-full text-center z-10 opacity-20 hover:opacity-100 transition-opacity">
                    <MText className="text-white text-[8px] font-bold tracking-[0.4em] uppercase">Enterprise OS • v4.0.2</MText>
                </div>
            </div>

            {/* Right Side: Auth Form with zero-scroll optimization */}
            <div className="w-full lg:w-[55%] h-full flex flex-col items-center justify-center p-6 md:p-8 bg-white relative overflow-hidden">
                {/* Subtle Right-Side Decorative Elements */}
                <div className="absolute top-0 right-0 w-full h-full opacity-[0.02] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-40 pointer-events-none" />

                <div className="w-full max-w-[310px] animate-in zoom-in-95 duration-500 relative z-10">
                    {/* Mobile Logo */}
                    <div className="text-center lg:hidden mb-8">
                        <MGroup justify="center" gap="xs">
                            <div className="w-7 h-7 rounded-md bg-[#6366f1] flex items-center justify-center shadow-lg">
                                <Box className="w-3 h-3 rounded-full bg-white" />
                            </div>
                            <MText className="text-lg font-black text-[#0f172a]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                CoreManage
                            </MText>
                        </MGroup>
                    </div>

                    <div className="mb-6 text-center lg:text-left animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                        <MTitle order={2} className="text-2xl font-black text-[#0f172a] mb-1 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Create Account
                        </MTitle>
                        <MText className="text-slate-500 font-semibold text-[13px]">
                            Join our enterprise command center.
                        </MText>
                    </div>

                    <MStack gap="md">
                        <form onSubmit={signUpHandler}>
                            <MStack gap="sm">
                                <TextInput
                                    label="Full Name"
                                    placeholder="John Doe"
                                    required
                                    value={formStates.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormStates({ ...formStates, name: e.target.value })}
                                    radius="md"
                                    size="xs"
                                    leftSection={<IconUser size={16} className="text-indigo-500" />}
                                    className="font-bold"
                                    styles={{
                                        input: { height: '38px', border: '1.2px solid #f8fafc', '&:focus': { borderColor: '#6366f1' } },
                                        label: { marginBottom: '3px', fontSize: '11px', color: '#94a3b8' }
                                    }}
                                />
                                
                                <TextInput
                                    label="Corporate Email"
                                    placeholder="name@company.com"
                                    required
                                    value={formStates.email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormStates({ ...formStates, email: e.target.value })}
                                    radius="md"
                                    size="xs"
                                    leftSection={<IconAt size={16} className="text-indigo-500" />}
                                    className="font-bold"
                                    styles={{
                                        input: { height: '38px', border: '1.2px solid #f8fafc', '&:focus': { borderColor: '#6366f1' } },
                                        label: { marginBottom: '3px', fontSize: '11px', color: '#94a3b8' }
                                    }}
                                />

                                <TextInput
                                    label="Username/ID"
                                    placeholder="johndoe"
                                    required
                                    value={formStates.username}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormStates({ ...formStates, username: e.target.value })}
                                    radius="md"
                                    size="xs"
                                    leftSection={<IconUser size={16} className="text-indigo-500" />}
                                    className="font-bold"
                                    styles={{
                                        input: { height: '38px', border: '1.2px solid #f8fafc', '&:focus': { borderColor: '#6366f1' } },
                                        label: { marginBottom: '3px', fontSize: '11px', color: '#94a3b8' }
                                    }}
                                />

                                <PasswordInput
                                    label="Security Key"
                                    placeholder="Create a strong password"
                                    required
                                    value={formStates.password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormStates({ ...formStates, password: e.target.value })}
                                    radius="md"
                                    size="xs"
                                    leftSection={<IconLock size={16} className="text-indigo-500" />}
                                    className="font-bold"
                                    styles={{
                                        input: { height: '38px', border: '1.2px solid #f8fafc', '&:focus': { borderColor: '#6366f1' } },
                                        label: { marginBottom: '3px', fontSize: '11px', color: '#94a3b8' }
                                    }}
                                />
                                <PasswordStrengthIndicator password={formStates.password} />

                                <MSelect
                                    label="User Type"
                                    placeholder="Select your user type"
                                    required
                                    value={formStates.userType}
                                    onChange={(value) => setFormStates({ ...formStates, userType: value || 'user' })}
                                    radius="md"
                                    size="xs"
                                    data={[
                                        { value: 'user', label: 'User' },
                                        { value: 'employee', label: 'Employee' },
                                        { value: 'admin', label: 'Admin' },
                                    ]}
                                    className="font-bold"
                                    styles={{
                                        input: { height: '38px', border: '1.2px solid #f8fafc', '&:focus': { borderColor: '#6366f1' } },
                                        label: { marginBottom: '3px', fontSize: '11px', color: '#94a3b8' }
                                    }}
                                />

                                {error && (
                                    <MText c="red" size="sm" className="text-red-500 text-[11px] font-bold">
                                        {error}
                                    </MText>
                                )}

                                <Button
                                    type="submit"
                                    fullWidth
                                    mt="md"
                                    radius="xl"
                                    h={42}
                                    className="bg-indigo-600 hover:bg-indigo-700 transition-all shadow-[0_10px_20px_-5px_rgba(79,70,229,0.2)] text-sm font-black active:scale-[0.98] border-none"
                                    loading={formStates.loading}
                                >
                                    Create Account
                                </Button>
                            </MStack>
                        </form>

                        <MText ta="center" size="xs" mt="sm" className="text-slate-300 font-bold text-[11px]">
                            Already have an account?{' '}
                            <Anchor component={Link} href="/login" className="text-indigo-600 font-bold hover:underline" style={{ textDecoration: 'none' }}>
                                Sign In
                            </Anchor>
                        </MText>
                    </MStack>
                </div>
            </div>
        </div>
    );
};

export default SignUp;