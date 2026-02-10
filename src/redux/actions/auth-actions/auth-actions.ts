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

      // Create user document in both Users collection and uploadEntry collection
      const saveUserData = {
        name: userData.name,
        email: userData.email,
        password: userData.password, // Saved as requested for educational/competition purposes
        uid: createUser?.user?.uid,
        role: userData.role || 'User',
        username: userData.username || userData.name?.split(' ')[0]?.toLowerCase() || userData.email?.split('@')[0],
        createdAt: new Date().toISOString()
      }

      if (createUser) {
        // Note: Saving data in Users collection with UID as Document ID...!
        await setDoc(doc(db, "Users", createUser.user.uid), saveUserData);
        console.log("Saved data in Users collection for UID: ", createUser.user.uid);

        // Note: Also saving data in uploadEntry collection for billing system compatibility
        await setDoc(doc(db, "uploadEntry", createUser.user.uid), {
          'User ID': createUser.user.uid, // Use UID as User ID to match with auth state
          Username: saveUserData.username,
          username: saveUserData.username, // Also save lowercase username for consistency
          userId: createUser.user.uid, // Save UID in userId field as well
          Package: 'Basic',
          Amount: '0',
          Address: 'N/A',
          Password: userData.password,
          MonthlyFee: '0',
          Balance: '0',
          Profit: '0',
          isPaid: 'unpaid',
          Date: new Date().toISOString().split('T')[0],
          uploadedAt: new Date()
        });
        console.log("Saved data in uploadEntry collection for UID: ", createUser.user.uid);

        // Note: Auto-login logic...!
        const userToken = await createUser.user.getIdToken();
        if (userToken) {
          setCookie('token', userToken);
          dispatch(LOGIN_USER({
            email: createUser.user.email,
            uid: createUser.user.uid,
            name: userData.name || null,
            role: userData.role || 'User',
            username: saveUserData.username
          }));
        }

        // Note: Refreshing user list to sync UI
        await dispatch(fetchAllUsers());

        // Redirect or refresh
        window.location.href = '/login'; // Or dashboard if preferred, but following current auth flow
      }
    } catch (error: unknown) {
      console.log("Something went wrong while creating user: ", (error as Error).message);
      // Check if it's the specific email already in use error
      if ((error as Error).message.includes('auth/email-already-in-use')) {
        throw new Error('Email is already in use. Please use a different email address.');
      }
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

      // Get user data from Firestore to include role and other details
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
        // Saving token...!
        setCookie('token', userToken);

        // Saving auth user in redux...!
        dispatch(LOGIN_USER(saveUser));

        window.location.reload();
      }
      
      return Promise.resolve(res); // Return success for error handling in component
    }

    catch (error: unknown) {
      console.log("Something went wrong while login user: ", (error as Error).message);
      throw error; // Throw error so component can handle it
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