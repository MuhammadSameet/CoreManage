import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

interface SignUpResponse {
  uid: string;
  name: string;
  email: string;
  role: string;
}

export const signUpUser = createAsyncThunk<
  SignUpResponse,
  SignUpCredentials,
  { rejectValue: string }
>(
  'auth/signUpUser',
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      // Validate password length
      if (password.length < 8) {
        return rejectWithValue('Password must be at least 8 characters long');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return rejectWithValue('Please enter a valid email address');
      }

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's profile with the name
      await updateProfile(user, { displayName: name });

      // Create user document in Firestore
      const userDoc = {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        username: name.split(' ')[0].toLowerCase(), // Extract username from name
        password: password, // Store password for reference (should be hashed in production)
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), userDoc);

      return {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
      };
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        return rejectWithValue('Email is already in use');
      } else if (error.code === 'auth/weak-password') {
        return rejectWithValue('Password is too weak');
      } else if (error.code === 'auth/invalid-email') {
        return rejectWithValue('Invalid email format');
      }
      return rejectWithValue(error.message || 'An error occurred during signup');
    }
  }
);