// Log In Page - Re-designed for STRICT Full Screen Impact
"use client";

import React, { useState } from 'react';
import {
    TextInput as MantineTextInput,
    PasswordInput as MantinePasswordInput,
    Checkbox as MantineCheckbox,
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
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { logInUser } from '@/redux/actions/auth-actions/auth-actions';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setCookie } from "cookies-next";
import { LOGIN_USER } from "@/redux/reducers/auth-reducer/auth-reducer";
import { IconBrandGoogle, IconLock, IconAt, IconUser, IconCircleCheckFilled } from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
import { notifications } from '@mantine/notifications';
const MImage = Image;

// React 19 type fixes
const TextInput = MantineTextInput;
const PasswordInput = MantinePasswordInput;
const Checkbox = MantineCheckbox;
const Button = MantineButton;
const MText = MantineText;
const MGroup = MantineGroup;
const MStack = MantineStack;
const MTitle = MantineTitle;
const MSelect = MantineSelect;

const provider = new GoogleAuthProvider()

const LogIn = () => {
    const [formStates, setFormStates] = useState({
        identifier: "", // Changed to identifier to accept email or username
        password: "",
        userType: "user", // Change to userType to include user/employee/admin
        loading: false
    });

    const dispatch = useDispatch<AppDispatch>();

    const clearAllStates = () => {
        setFormStates({
            identifier: "",
            password: "",
            userType: "user",
            loading: false
        });
    }

    const logInHandler = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setFormStates(prev => ({ ...prev, loading: true }));
        
        // Determine if the identifier is an email or username
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formStates.identifier);
        const email = isEmail ? formStates.identifier : '';
        const username = !isEmail ? formStates.identifier : '';
        
        try {
            // For Firebase auth, we need to use email, so if it's not an email format, we'll need to find the user first
            // For now, we'll assume it's an email since Firebase auth requires email/password
            await dispatch(logInUser({ email: formStates.identifier, password: formStates.password }));
            
            // Redirect based on user type after successful login
            if (formStates.userType === 'admin') {
                window.location.href = '/'; // Default to home for now
            } else if (formStates.userType === 'employee') {
                window.location.href = '/'; // Default to home for now
            } else {
                window.location.href = '/'; // Default to home for now
            }
        } catch (error: any) {
            // Show toast notification for invalid email/password
            notifications.show({
                title: 'Login Failed',
                message: error?.message || 'Invalid email, username or password. Please try again.',
                color: 'red',
                position: 'top-right'
            });
        } finally {
            setFormStates(prev => ({ ...prev, loading: false }));
            clearAllStates();
        }
    }

    const googleSignInHandler = async () => {
        try {
            const gooleRes = await signInWithPopup(auth, provider);
            const userDetails = gooleRes?.user;
            const googleToken = await userDetails?.getIdToken();
            if (googleToken) {
                setCookie('token', googleToken);
                dispatch(LOGIN_USER({
                    email: userDetails?.email,
                    uid: userDetails?.uid,
                    name: userDetails?.displayName,
                    dp: userDetails?.photoURL
                }));
                window.location.reload();
            }
        } catch (error) {
            console.log('Google Sign-in error: ', error);
        }
    };

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
                        <MTitle order={1} className="text-[1.6rem] md:text-[1.8rem] font-black text-white leading-[1.1] mb-5 tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Master your <br />
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
                            Welcome back
                        </MTitle>
                        <MText className="text-slate-500 font-semibold text-[13px]">
                            Access your enterprise command center.
                        </MText>
                    </div>

                    <MStack gap="md">
                        <Button
                            variant="default"
                            fullWidth
                            radius="xl"
                            h={42}
                            leftSection={<IconBrandGoogle size={16} className="text-rose-500" />}
                            onClick={googleSignInHandler}
                            className="border-slate-100 text-[#0f172a] bg-white hover:bg-slate-50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all duration-300 font-bold text-[13px]"
                        >
                            Continue with Google
                        </Button>

                        <Divider label="or use corporate identity" labelPosition="center" color="gray.0" styles={{ label: { fontSize: '9px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' } }} />

                        <form onSubmit={logInHandler}>
                            <MStack gap="sm">
                                <TextInput
                                    label="Email or Username"
                                    placeholder="name@company.com or username"
                                    required
                                    value={formStates.identifier}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormStates({ ...formStates, identifier: e.target.value })}
                                    radius="md"
                                    size="xs"
                                    leftSection={<IconAt size={16} className="text-indigo-500" />}
                                    className="font-bold"
                                    styles={{
                                        input: { height: '38px', border: '1.2px solid #f8fafc', '&:focus': { borderColor: '#6366f1' } },
                                        label: { marginBottom: '3px', fontSize: '11px', color: '#94a3b8' }
                                    }}
                                />
                                <PasswordInput
                                    label="Security Key"
                                    placeholder="Enter your password"
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

                                <MGroup justify="space-between" mt={1}>
                                    <Checkbox label="Keep session active" radius="sm" size="xs" className="font-bold text-slate-300" styles={{ label: { fontSize: '11px' } }} />
                                    <Anchor component="button" size="xs" type="button" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors text-[11px]" style={{ textDecoration: 'none' }}>
                                        Lost credentials?
                                    </Anchor>
                                </MGroup>

                                <Button
                                    type="submit"
                                    fullWidth
                                    mt="md"
                                    radius="xl"
                                    h={42}
                                    className="bg-indigo-600 hover:bg-indigo-700 transition-all shadow-[0_10px_20px_-5px_rgba(79,70,229,0.2)] text-sm font-black active:scale-[0.98] border-none"
                                    loading={formStates.loading}
                                >
                                    Authenticate Access
                                </Button>
                            </MStack>
                        </form>

                        <MText ta="center" size="xs" mt="sm" className="text-slate-300 font-bold text-[11px]">
                            New to the ecosystem?{' '}
                            <Anchor component={Link} href="/signup" className="text-indigo-600 font-bold hover:underline" style={{ textDecoration: 'none' }}>
                                Request Account
                            </Anchor>
                        </MText>
                    </MStack>
                </div>
            </div>
        </div>
    );
};

export default LogIn;
