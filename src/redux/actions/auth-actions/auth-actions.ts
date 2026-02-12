// Auth action functions are defined here...!

import { doc, setDoc, getDoc, query, where, getDocs } from "firebase/firestore";
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
  username?: string;
}

import { fetchAllUsers } from "../user-actions/user-actions";

// User-friendly auth error messages (no "firebase" or technical terms)
function getSignUpErrorMessage(err: unknown): string {
  const msg = (err as Error)?.message || '';
  if (msg.includes('auth/email-already-in-use')) return 'Email already exists. Use a different email.';
  if (msg.includes('auth/invalid-email')) return 'Invalid email address.';
  if (msg.includes('auth/weak-password')) return 'Password is too weak. Use at least 6 characters.';
  if (msg.includes('auth/operation-not-allowed')) return 'Sign up is not allowed. Contact support.';
  return 'Could not create account. Please try again.';
}

// Note: Sign up user
const signUpUser = (userData: UserData, avoidLogin: boolean = false) => {
  return async (dispatch: AppDispatch) => {
    try {
      const createUser = await createUserWithEmailAndPassword(
        auth,
        userData?.email,
        userData?.password
      );

      const saveUserData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        uid: createUser?.user?.uid,
        role: userData.role || 'user',
        username: userData.username || userData.name?.split(' ')[0]?.toLowerCase() || userData.email?.split('@')[0],
        createdAt: new Date().toISOString()
      };

      if (createUser) {
        await setDoc(doc(db, "Users", createUser.user.uid), saveUserData);

        if (!avoidLogin) {
          const userToken = await createUser.user.getIdToken();
          if (userToken) {
            setCookie('token', userToken);
            dispatch(LOGIN_USER({
              email: createUser.user.email,
              uid: createUser.user.uid,
              name: userData.name || null,
              role: userData.role || 'user',
              username: saveUserData.username
            }));
          }
          await dispatch(fetchAllUsers());
          window.location.href = '/login';
        } else {
          // If avoidLogin is true, we should probably sign out the newly created user 
          // to prevent the current session from being affected, though this is tricky on client-side.
          // However, in many cases, we might need a cloud function for true admin creation.
          // For now, let's at least skip the Redux state change and cookie setting.
          await dispatch(fetchAllUsers());
        }
      }
    } catch (error: unknown) {
      throw new Error(getSignUpErrorMessage(error));
    }
  };
};

// User-friendly login error messages
function getLoginErrorMessage(err: unknown): string {
  const msg = (err as Error)?.message || '';
  if (msg.includes('auth/user-not-found')) return 'User not found.';
  if (msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) return 'Incorrect password.';
  if (msg.includes('auth/invalid-email')) return 'Invalid email address.';
  if (msg.includes('auth/too-many-requests')) return 'Too many attempts. Try again later.';
  if (msg.includes('auth/user-disabled')) return 'This account has been disabled.';
  return 'Invalid email or password. Please try again.';
}

// Note: Log in user
const logInUser = (userData: UserData) => {
  return async (dispatch: AppDispatch) => {
    try {
      const res = await signInWithEmailAndPassword(
        auth,
        userData?.email,
        userData?.password
      );

      const userDocRef = doc(db, "Users", res.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      let userDataFromDB: Record<string, any> = {};
      if (userDocSnap.exists()) {
        userDataFromDB = userDocSnap.data();
      }

      const saveUser = {
        email: res?.user?.email,
        uid: res?.user?.uid,
        name: res?.user?.displayName || userDataFromDB.name || null,
        role: userDataFromDB.role || 'user',
        username: userDataFromDB.username || userDataFromDB.name || res?.user?.email?.split('@')[0],
        password: userDataFromDB.password || ''
      };

      const userToken = await res?.user?.getIdToken();
      if (userToken) {
        setCookie('token', userToken);
        dispatch(LOGIN_USER(saveUser));
        window.location.reload();
      }

      return Promise.resolve(res);
    } catch (error: unknown) {
      throw new Error(getLoginErrorMessage(error));
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

      window.location.href = '/login';
    } catch {
      // continue to redirect
    }
  }
}

export { signUpUser, logInUser, logOutUser };