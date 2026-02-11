"use client";

import { Provider } from "react-redux";
import store from "@/redux/store";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { setCookie } from "cookies-next";
import { MantineProvider, MantineThemeOverride } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { ToastContainer } from 'react-toastify';
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { LOGIN_USER, LOG_OUT_USER } from "@/redux/reducers/auth-reducer/auth-reducer";

const theme: MantineThemeOverride = {
    primaryColor: 'blue',
};

function AuthInit({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const fbToken = await user.getIdToken();
                setCookie('token', fbToken);

                let role = 'user';
                let username = '';
                let name = user.displayName || null;
                try {
                    const userDoc = await getDoc(doc(db, 'Users', user.uid));
                    if (userDoc.exists()) {
                        const d = userDoc.data();
                        role = d.role || 'user';
                        username = d.username || d.Username || '';
                        name = d.name || d.Name || user.displayName || null;
                    }
                } catch {
                    // keep defaults
                }

                dispatch(LOGIN_USER({
                    email: user.email ?? null,
                    uid: user.uid,
                    name,
                    role,
                    username
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
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <Provider store={store}>
                <AuthInit>
                    {children}
                </AuthInit>
            </Provider>
        </MantineProvider>
    );
}
