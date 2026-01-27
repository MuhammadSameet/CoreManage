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
    Title as MantineTitle
} from '@mantine/core';
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { logInUser } from '@/redux/actions/auth-actions/auth-actions';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setCookie } from "cookies-next";
import { LOGIN_USER } from "@/redux/reducers/auth-reducer/auth-reducer";
import { IconBrandGoogle, IconLock, IconAt, IconCircleCheckFilled } from '@tabler/icons-react';
import Link from 'next/link';

// React 19 type fixes
const TextInput = MantineTextInput as any;
const PasswordInput = MantinePasswordInput as any;
const Checkbox = MantineCheckbox as any;
const Button = MantineButton as any;
const Text = MantineText as any;
const Group = MantineGroup as any;
const Stack = MantineStack as any;
const Title = MantineTitle as any;

const provider = new GoogleAuthProvider()

const LogIn = () => {
    const [formStates, setFormStates] = useState({
        email: "",
        password: "",
        loading: false
    });

    const dispatch = useDispatch<AppDispatch>();

    const clearAllStates = () => {
        setFormStates({
            email: "",
            password: "",
            loading: false
        });
    }

    const logInHandler = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setFormStates(prev => ({ ...prev, loading: true }));
        try {
            await dispatch(logInUser({ email: formStates.email, password: formStates.password }));
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
            <div className="hidden lg:flex w-[45%] h-full relative bg-[#0f172a] p-12 flex-col justify-between overflow-hidden">
                {/* Mesh Gradient Background */}
                <div className="absolute top-[-15%] left-[-15%] w-[100%] h-[100%] bg-blue-600 rounded-full blur-[160px] opacity-40 animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[120%] h-[120%] bg-indigo-900 rounded-full blur-[180px] opacity-60" />
                <div className="absolute top-[20%] right-[-5%] w-[60%] h-[60%] bg-cyan-500 rounded-full blur-[140px] opacity-30" />

                <div className="relative z-10">
                    <Group gap="xs" mb={60}>
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-2xl">
                            <Box className="w-5 h-5 rounded-md bg-[#1e40af]" />
                        </div>
                        <Text className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            CoreManage
                        </Text>
                    </Group>

                    <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
                        <Title order={1} className="text-[3.5rem] font-black text-white leading-tight mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Master your <br />
                            <span className="text-blue-400">ecosystem.</span>
                        </Title>

                        <Stack gap="xl" mt={40}>
                            {[
                                { title: "Intelligent Monitoring", desc: "Real-time insights at your fingertips." },
                                { title: "Global Operations", desc: "Scale without boundaries or limits." },
                                { title: "Elite Security", desc: "Enterprise-grade protection by default." }
                            ].map((item, i) => (
                                <Group key={i} align="flex-start" gap="md">
                                    <div className="mt-1">
                                        <IconCircleCheckFilled className="text-blue-400" size={22} />
                                    </div>
                                    <div>
                                        <Text className="text-white font-bold text-lg leading-none mb-1">{item.title}</Text>
                                        <Text className="text-blue-200/60 text-sm font-medium">{item.desc}</Text>
                                    </div>
                                </Group>
                            ))}
                        </Stack>
                    </div>
                </div>

                <div className="relative z-10 mt-auto opacity-30">
                    <Text className="text-white text-xs font-semibold tracking-widest uppercase">Elite Management System v4.0</Text>
                </div>
            </div>

            {/* Right Side: Auth Form with zero-scroll optimization */}
            <div className="w-full lg:w-[55%] h-full flex flex-col items-center justify-center p-6 md:p-12 bg-slate-50 overflow-hidden">
                <div className="w-full max-w-sm animate-in zoom-in-95 duration-500">
                    {/* Mobile Logo */}
                    <div className="text-center lg:hidden mb-12">
                        <Group justify="center" gap="xs">
                            <div className="w-10 h-10 rounded-lg bg-[#1e40af] flex items-center justify-center shadow-lg">
                                <Box className="w-5 h-5 rounded-full bg-white" />
                            </div>
                            <Text className="text-2xl font-black text-[#0f172a]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                CoreManage
                            </Text>
                        </Group>
                    </div>

                    <div className="mb-8 text-center lg:text-left">
                        <Title order={2} className="text-3xl font-black text-[#0f172a] mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Welcome back
                        </Title>
                        <Text c="dimmed" size="sm" className="font-semibold">
                            Securely access your business dashboard
                        </Text>
                    </div>

                    <Stack gap="lg">
                        <Button
                            variant="default"
                            fullWidth
                            radius="xl"
                            h={54}
                            leftSection={<IconBrandGoogle size={20} className="text-red-500" />}
                            onClick={googleSignInHandler}
                            className="border-gray-200 text-[#0f172a] bg-white hover:bg-white hover:shadow-md transition-all font-bold"
                        >
                            Sign in with Google
                        </Button>

                        <Divider label="or use corporate email" labelPosition="center" color="gray.2" />

                        <form onSubmit={logInHandler}>
                            <Stack gap="md">
                                <TextInput
                                    label="Corporate Email"
                                    placeholder="name@company.com"
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
                                    placeholder="Enter your password"
                                    required
                                    value={formStates.password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormStates({ ...formStates, password: e.target.value })}
                                    radius="md"
                                    size="md"
                                    leftSection={<IconLock size={18} className="text-blue-500" />}
                                    className="font-bold"
                                />

                                <Group justify="space-between" mt={4}>
                                    <Checkbox label="Keep me active" radius="sm" size="xs" className="font-bold text-gray-500" />
                                    <Anchor component="button" size="xs" type="button" className="text-blue-600 font-black hover:underline">
                                        Lost access?
                                    </Anchor>
                                </Group>

                                <Button
                                    type="submit"
                                    fullWidth
                                    mt="xl"
                                    radius="xl"
                                    h={54}
                                    className="bg-[#1e40af] hover:bg-blue-800 transition-all shadow-2xl shadow-blue-200 text-lg font-black active:scale-[0.98]"
                                    loading={formStates.loading}
                                >
                                    Access Global Hub
                                </Button>
                            </Stack>
                        </form>

                        <Text ta="center" size="sm" mt="sm" className="text-gray-500 font-bold">
                            Don't have access?{' '}
                            <Anchor component={Link} href="/signup" className="text-blue-600 font-black hover:underline">
                                Request Account
                            </Anchor>
                        </Text>
                    </Stack>
                </div>
            </div>
        </div>
    );
};

export default LogIn;
