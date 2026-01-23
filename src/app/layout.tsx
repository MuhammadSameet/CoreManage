"use client";

import { Provider } from "react-redux";
import store from "@/redux/store";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setCookie } from "cookies-next";
import '@mantine/core/styles.css';
import { MantineProvider, MantineThemeOverride } from '@mantine/core';
import Layout from './component/sidebar/Layout';
import { Text } from '@mantine/core';


const theme = {
  colorScheme: 'light' as 'light',
  primaryColor: 'blue',
} as  MantineThemeOverride;



const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {


  const fetchAuthUser = () => {
    onAuthStateChanged(auth, async (user) => {
      // console.log('Auth User Status: ', user);
      // console.log(user?.uid)

      // const fbToken = await user?.getIdToken();
      // console.log('Token: ', fbToken);

      // if (user && fbToken) {
      //   // Saving token...!
      //   setCookie('token', fbToken);
      // }
    });
  };

  // Mounted hook..!
  useEffect(() => {
    fetchAuthUser();
  }, []);

  return (
    <html lang="en">
      <body>
        <MantineProvider theme={theme}>
          <Provider store={store}>
            <Layout>
            {children} 
            </Layout>
          </Provider>
        </MantineProvider>
      </body>
    </html>
  );
};

export default RootLayout;
