import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

// Define the data type for monthly data
export type MonthlyData = {
  id?: string;
  name: string;
  id_user: string; // Using id_user to avoid confusion with the document id
  monthlyFee: number;
  balance: number;
  advance: number;
  isPaid: boolean;
  paidByTime?: string;
  profit: number;
  startDate: string;
  endDate: string;
  monthYear: string; // Format: YYYY-MM
  totalAmount: number; // monthlyFee + any additional charges
  createdAt: any; // Firestore timestamp
};

// Define the data type for upload entry
export type UploadEntry = {
  id: string;
  [key: string]: any; // Allow dynamic properties
};

/**
 * Generates monthly data entries for all users based on their uploadEntry data
 * Creates a new entry for each month if one doesn't already exist
 */
export const generateMonthlyDataForAllUsers = async () => {
  try {
    // Get all upload entries
    const uploadQuery = query(collection(db, 'uploadEntry'), orderBy('uploadedAt', 'desc'));
    const uploadSnapshot = await getDocs(uploadQuery);
    
    const uploadEntries: UploadEntry[] = [];
    uploadSnapshot.forEach((doc) => {
      uploadEntries.push({ id: doc.id, ...doc.data() });
    });

    // For each upload entry, generate monthly data for the current month if it doesn't exist
    const currentDate = new Date();
    const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    for (const entry of uploadEntries) {
      // Check if monthly data already exists for this user for the current month
      const monthlyQuery = query(
        collection(db, 'monthlydata'),
        where('id_user', '==', entry.id),
        where('monthYear', '==', currentMonthYear)
      );
      const monthlySnapshot = await getDocs(monthlyQuery);
      
      if (monthlySnapshot.empty) {
        // Create new monthly data entry for this user
        const monthlyFee = entry.MonthlyFee || entry.monthlyFee || entry['Monthly Fee'] || 0;
        const advance = entry.advance || entry.Advance || 0;
        const profit = entry.Profit || entry.profit || 0;
        const name = entry.Username || entry.username || entry.name || entry.Name || entry.UserName || entry.id;
        
        // Calculate start and end dates for the month
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const newMonthlyData: MonthlyData = {
          name,
          id_user: entry.id,
          monthlyFee,
          balance: monthlyFee, // Initially, balance equals the monthly fee
          advance,
          isPaid: false,
          profit,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          monthYear: currentMonthYear,
          totalAmount: monthlyFee,
          createdAt: serverTimestamp()
        };
        
        // Add to monthlydata collection
        await addDoc(collection(db, 'monthlydata'), newMonthlyData);
      }
    }
  } catch (error) {
    console.error('Error generating monthly data:', error);
    throw error;
  }
};

/**
 * Updates the balance when a payment is made
 */
export const updateBalanceOnPayment = async (userId: string, amountPaid: number) => {
  try {
    // Get all unpaid monthly data for the user
    const unpaidQuery = query(
      collection(db, 'monthlydata'),
      where('id_user', '==', userId),
      where('isPaid', '==', false),
      orderBy('startDate')
    );
    const unpaidSnapshot = await getDocs(unpaidQuery);
    
    let remainingAmount = amountPaid;
    
    // Process payments starting from the oldest unpaid entry
    for (const docSnapshot of unpaidSnapshot.docs) {
      if (remainingAmount <= 0) break;
      
      const monthlyData = docSnapshot.data() as MonthlyData;
      const docRef = doc(db, 'monthlydata', docSnapshot.id);
      
      if (monthlyData.balance <= remainingAmount) {
        // Full payment for this month
        await updateDoc(docRef, {
          isPaid: true,
          paidByTime: new Date().toISOString(),
          balance: 0
        });
        remainingAmount -= monthlyData.balance;
      } else {
        // Partial payment for this month
        await updateDoc(docRef, {
          balance: monthlyData.balance - remainingAmount,
        });
        remainingAmount = 0;
      }
    }
  } catch (error) {
    console.error('Error updating balance on payment:', error);
    throw error;
  }
};

/**
 * Gets all monthly data for a specific user
 */
export const getUserMonthlyData = async (userId: string) => {
  try {
    const userMonthlyQuery = query(
      collection(db, 'monthlydata'),
      where('id_user', '==', userId),
      orderBy('startDate', 'desc')
    );
    const userMonthlySnapshot = await getDocs(userMonthlyQuery);
    
    const monthlyData: MonthlyData[] = [];
    userMonthlySnapshot.forEach((doc) => {
      monthlyData.push({ id: doc.id, ...doc.data() } as MonthlyData);
    });
    
    return monthlyData;
  } catch (error) {
    console.error('Error getting user monthly data:', error);
    throw error;
  }
};

/**
 * Gets all unpaid monthly data for a specific user
 */
export const getUnpaidUserMonthlyData = async (userId: string) => {
  try {
    const unpaidQuery = query(
      collection(db, 'monthlydata'),
      where('id_user', '==', userId),
      where('isPaid', '==', false),
      orderBy('startDate', 'asc')
    );
    const unpaidSnapshot = await getDocs(unpaidQuery);
    
    const unpaidData: MonthlyData[] = [];
    unpaidSnapshot.forEach((doc) => {
      unpaidData.push({ id: doc.id, ...doc.data() } as MonthlyData);
    });
    
    return unpaidData;
  } catch (error) {
    console.error('Error getting unpaid user monthly data:', error);
    throw error;
  }
};

/**
 * Calculates the total outstanding amount for a user
 */
export const calculateTotalOutstanding = async (userId: string) => {
  try {
    const unpaidData = await getUnpaidUserMonthlyData(userId);
    return unpaidData.reduce((total, item) => total + item.balance, 0);
  } catch (error) {
    console.error('Error calculating total outstanding:', error);
    return 0;
  }
};