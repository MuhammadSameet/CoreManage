"use client";

import { Provider } from "react-redux";
import store from "@/redux/store";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setCookie } from "cookies-next";
import { MantineProvider, MantineThemeOverride } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { LOGIN_USER, LOG_OUT_USER } from "@/redux/reducers/auth-reducer/auth-reducer";

const theme = {
    colorScheme: 'light' as 'light',
    primaryColor: 'blue',
} as MantineThemeOverride;

function AuthInit({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const fbToken = await user.getIdToken();
                setCookie('token', fbToken);

                dispatch(LOGIN_USER({
                    email: user.email,
                    uid: user.uid
                }));
            } else {
                dispatch(LOG_OUT_USER());
            }
        });

        return () => unsubscribe();
    }, [dispatch]);

    return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <MantineProvider theme={theme}>
            <Notifications position="top-right" zIndex={1000} />
            <Provider store={store}>
                <AuthInit>
                    {children}
                </AuthInit>
            </Provider>
        </MantineProvider>
    );
}
