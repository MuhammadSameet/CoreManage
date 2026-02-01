// Auth action functions are defined here...!

import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { LOGIN_USER, LOG_OUT_USER } from "@/redux/reducers/auth-reducer/auth-reducer";
import { setCookie, deleteCookie } from "cookies-next";
import { AppDispatch } from "@/redux/store";

interface UserData {
  name?: string;
  email: string;
  password: string;
  role?: string;
}

import { fetchAllUsers } from "../user-actions/user-actions";

// Note: Sign up user...!
const signUpUser = (userData: UserData) => {
  return async (dispatch: AppDispatch) => {
    console.log("User: ", userData);

    try {
      const createUser = await createUserWithEmailAndPassword(
        auth,
        userData?.email,
        userData?.password
      );
      console.log(createUser);

      const saveUserData = {
        name: userData.name,
        email: userData.email,
        password: userData.password, // Saved as requested for educational/competition purposes
        uid: createUser?.user?.uid,
        role: userData.role || 'User',
        createdAt: new Date().toISOString()
      }

      if (createUser) {
        // Note: Saving data in DB with UID as Document ID...!
        await setDoc(doc(db, "Users", createUser.user.uid), saveUserData);
        console.log("Saved data in DB for UID: ", createUser.user.uid);

        // Note: Auto-login logic...!
        const userToken = await createUser.user.getIdToken();
        if (userToken) {
          setCookie('token', userToken);
          dispatch(LOGIN_USER({
            email: createUser.user.email,
            uid: createUser.user.uid,
            name: userData.name
          }));
        }

        // Note: Refreshing user list to sync UI
        await dispatch(fetchAllUsers());

        // Redirect or refresh
        window.location.href = '/login'; // Or dashboard if preferred, but following current auth flow
      }
    } catch (error: unknown) {
      console.log("Something wnet wrong while creating user: ", (error as Error).message);
      throw error; // Rethrow to allow component to catch
    }
  };
};

// Note: Log in user...!
const logInUser = (userData: UserData) => {
  return async (dispatch: AppDispatch) => {
    console.log("User: ", userData);

    try {
      const res = await signInWithEmailAndPassword(
        auth,
        userData?.email,
        userData?.password
      );
      console.log('Login response: ', res);

      const saveUser = {
        email: res?.user?.email,
        uid: res?.user?.uid,
        name: res?.user?.displayName
      };

      const userToken = await res?.user?.getIdToken();
      if (userToken) {
        // Saving token...!
        setCookie('token', userToken);

        // Saving auth user in redux...!
        dispatch(LOGIN_USER(saveUser));

        window.location.reload();
      }
    }

    catch (error: unknown) {
      console.log("Something went wrong while login user: ", (error as Error).message);
    }
  };
};

// Note: Log out user...!
const logOutUser = () => {
  return async (dispatch: AppDispatch) => {
    try {
      // Removing user auth from FB authentication...!
      await signOut(auth);

      // Removing user from redux...!
      dispatch(LOG_OUT_USER());

      // Removing user cookies...!
      deleteCookie('token');

      // Navigate to home/landing instead of alert/reload
      window.location.href = '/';
    } catch (error: unknown) {
      console.log("Error logging out: ", (error as Error).message);
    }
  }
}

export { signUpUser, logInUser, logOutUser };