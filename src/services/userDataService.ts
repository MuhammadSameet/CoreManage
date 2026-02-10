import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

// Define the data type for user records
export interface UserData {
  id: string;                // Username / user ID
  name: string;              // User name (can be same as Username if name missing)
  phone: string;             // Default empty
  address: string;           // Default empty or from CSV if exists
  package: string;           // From CSV Package
  monthlyFees: number;       // Default 0 or Price from CSV
  data: UserMonthData[];     // Array of monthly data
}

export interface UserMonthData {
  startDate: string;         // First day of month from Date
  endDate: string;           // Last day of month from Date
  monthlyFees: number;       // Monthly fee (Price)
  balance: number;           // Remaining balance for month
  totalReceived: number;     // Total received so far
  isPaid: boolean;           // Fully paid flag
  payments: PaymentData[];   // Array of payments
}

export interface PaymentData {
  received: number;          // Payment received
  paidByName: string;        // Name of payer
  paidByDateTime: string;    // ISO string of payment time
  balanceAfterPayment: number;
}

/**
 * Creates or updates a user in the users collection based on CSV data
 * If user exists, merges new data with existing data and adds new month if not present
 * If user is new, creates full user record with defaults
 */
export const createUserOrUpdateData = async (csvRow: Record<string, any>) => {
  try {
    // Extract required fields from CSV
    const userId = csvRow['User ID'] || csvRow['Username'] || csvRow['username'] || csvRow['id'] || csvRow['ID'];
    const username = csvRow['Username'] || csvRow['username'] || csvRow['User ID'] || csvRow['id'] || csvRow['ID'];
    const packageName = csvRow['Package'] || csvRow['package'] || '';
    const price = parseFloat(csvRow['Price'] || csvRow['price'] || csvRow['Monthly Fee'] || csvRow['monthlyFee'] || '0') || 0;
    const dateStr = csvRow['Date'] || csvRow['date'] || csvRow['Start Date'] || csvRow['startDate'] || '';
    const address = csvRow['Address'] || csvRow['address'] || '';
    const phone = csvRow['Phone'] || csvRow['phone'] || '';

    if (!userId) {
      throw new Error('User ID or Username is required in CSV data');
    }

    // Parse the date to determine the month/year
    let date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // If the date is invalid, use current date
      date = new Date();
    }

    // Calculate start and end dates for the month
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // Format dates as strings
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Reference to the user document
    const userDocRef = doc(db, 'users', userId);

    // Check if user already exists
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // User exists - merge new data with existing data and add new month if not present
      const existingUserData = userDocSnap.data() as UserData;

      // Check if this month's data already exists
      const monthExists = existingUserData.data.some(
        monthData => monthData.startDate === startDateStr && monthData.endDate === endDateStr
      );

      let newDataArray = [...existingUserData.data];
      if (!monthExists) {
        // Add new month data to existing user
        const newMonthData: UserMonthData = {
          startDate: startDateStr,
          endDate: endDateStr,
          monthlyFees: price,
          balance: price, // Initially balance equals the monthly fee
          totalReceived: 0,
          isPaid: false,
          payments: []
        };
        newDataArray = [...existingUserData.data, newMonthData];
      }

      // Update the user document with merged data
      await updateDoc(userDocRef, {
        name: username || existingUserData.name || userId, // Update name if provided in CSV
        package: packageName || existingUserData.package,
        monthlyFees: price || existingUserData.monthlyFees,
        address: address || existingUserData.address,
        phone: phone || existingUserData.phone,
        data: newDataArray,
        updatedAt: serverTimestamp()
      });
    } else {
      // User is new - create full user record with defaults
      const newUser: UserData = {
        id: userId,
        name: username || userId, // Use username as name if name is not provided in CSV, fallback to ID
        phone: phone, // Use phone from CSV if provided
        address: address, // From CSV if exists, otherwise empty
        package: packageName,
        monthlyFees: price,
        data: [{
          startDate: startDateStr,
          endDate: endDateStr,
          monthlyFees: price,
          balance: price, // Initially balance equals the monthly fee
          totalReceived: 0,
          isPaid: false,
          payments: []
        }]
      };

      // Add the new user to the users collection
      await setDoc(userDocRef, newUser);
    }

    console.log(`User data processed successfully for user: ${userId}`);
    return userId;
  } catch (error) {
    console.error('Error processing user data:', error);
    throw error;
  }
};

/**
 * Checks if a user exists in the database
 */
export const checkUserExists = async (userId: string): Promise<boolean> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists();
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
};

/**
 * Gets user data by ID
 */
export const getUserById = async (userId: string): Promise<UserData | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

/**
 * Adds a new month of data to an existing user
 */
export const addMonthDataToUser = async (userId: string, monthData: UserMonthData) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      throw new Error(`User with ID ${userId} does not exist`);
    }

    const userData = userDocSnap.data() as UserData;

    // Check if this month's data already exists
    const monthExists = userData.data.some(
      data => data.startDate === monthData.startDate && data.endDate === monthData.endDate
    );

    if (!monthExists) {
      // Update the user document by adding new month data
      await updateDoc(userDocRef, {
        data: [...userData.data, monthData]
      });
    }

    console.log(`Month data added successfully for user: ${userId}`);
  } catch (error) {
    console.error('Error adding month data to user:', error);
    throw error;
  }
};