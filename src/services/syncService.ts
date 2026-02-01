import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

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
 * Creates monthly data entries for a new user based on their uploadEntry data
 * This function should be called when a new user is added to uploadEntry
 */
export const createMonthlyDataForUser = async (uploadEntryId: string, userData: any) => {
  try {
    // Calculate the current month and year
    const currentDate = new Date();
    const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // Calculate start and end dates for the month
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Extract relevant data from the upload entry
    const monthlyFee = userData.MonthlyFee || userData.monthlyFee || userData['Monthly Fee'] || 0;
    const advance = userData.advance || userData.Advance || 0;
    const profit = userData.Profit || userData.profit || 0;
    const name = userData.Username || userData.username || userData.name || userData.Name || userData.UserName || uploadEntryId;

    // Create the monthly data entry
    const newMonthlyData = {
      name,
      id_user: uploadEntryId,
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
    const docRef = await addDoc(collection(db, 'monthlydata'), newMonthlyData);

    console.log(`Monthly data created for user ${uploadEntryId} with ID: ${docRef.id}`);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating monthly data for user:', error);
    throw error;
  }
};

/**
 * Updates monthly data when uploadEntry is updated
 * This function should be called when a user's data is updated in uploadEntry
 */
export const updateMonthlyDataForUser = async (uploadEntryId: string, updatedUserData: any) => {
  try {
    // Get all monthly data for this user
    const monthlyQuery = query(
      collection(db, 'monthlydata'),
      where('id_user', '==', uploadEntryId)
    );
    const monthlySnapshot = await getDocs(monthlyQuery);

    // Update the name and other fields for all monthly entries of this user
    const monthlyFee = updatedUserData.MonthlyFee || updatedUserData.monthlyFee || updatedUserData['Monthly Fee'] || 0;
    const advance = updatedUserData.advance || updatedUserData.Advance || 0;
    const profit = updatedUserData.Profit || updatedUserData.profit || 0;
    const name = updatedUserData.Username || updatedUserData.username || updatedUserData.name || updatedUserData.Name || updatedUserData.UserName || uploadEntryId;

    for (const docSnapshot of monthlySnapshot.docs) {
      // Only update if the entry is not yet paid
      const monthlyData = docSnapshot.data();
      if (!monthlyData.isPaid) {
        const docRef = doc(db, 'monthlydata', docSnapshot.id);
        await updateDoc(docRef, {
          name,
          monthlyFee,
          advance,
          profit
        });
      }
    }

    console.log(`Monthly data updated for user ${uploadEntryId}`);
  } catch (error) {
    console.error('Error updating monthly data for user:', error);
    throw error;
  }
};

/**
 * Deletes all monthly data entries for a user when the user is deleted from uploadEntry
 */
export const deleteMonthlyDataForUser = async (uploadEntryId: string) => {
  try {
    // Get all monthly data for this user
    const monthlyQuery = query(
      collection(db, 'monthlydata'),
      where('id_user', '==', uploadEntryId)
    );
    const monthlySnapshot = await getDocs(monthlyQuery);

    // Delete all monthly data entries for this user
    for (const docSnapshot of monthlySnapshot.docs) {
      const docRef = doc(db, 'monthlydata', docSnapshot.id);
      await deleteDoc(docRef);
    }

    console.log(`Monthly data deleted for user ${uploadEntryId}`);
  } catch (error) {
    console.error('Error deleting monthly data for user:', error);
    throw error;
  }
};

/**
 * Syncs data from uploadEntry to monthlyData when a record is updated
 * This function updates the corresponding monthly data entries based on the uploadEntry data
 */
export const syncUploadEntryToMonthlyData = async (uploadEntryId: string, uploadEntryData: any) => {
  try {
    // Get all monthly data for this user
    const monthlyQuery = query(
      collection(db, 'monthlydata'),
      where('id_user', '==', uploadEntryId)
    );
    const monthlySnapshot = await getDocs(monthlyQuery);

    // Update the name and other fields for all monthly entries of this user
    const monthlyFee = uploadEntryData.MonthlyFee || uploadEntryData.monthlyFee || uploadEntryData['Monthly Fee'] || 0;
    const advance = uploadEntryData.advance || uploadEntryData.Advance || 0;
    const profit = uploadEntryData.Profit || uploadEntryData.profit || 0;
    const name = uploadEntryData.Username || uploadEntryData.username || uploadEntryData.name || uploadEntryData.Name || uploadEntryData.UserName || uploadEntryId;

    for (const docSnapshot of monthlySnapshot.docs) {
      // Only update if the entry is not yet paid
      const monthlyData = docSnapshot.data();
      if (!monthlyData.isPaid) {
        const docRef = doc(db, 'monthlydata', docSnapshot.id);
        await updateDoc(docRef, {
          name,
          monthlyFee,
          advance,
          profit
        });
      }
    }

    console.log(`Synced uploadEntry data to monthlyData for user ${uploadEntryId}`);
  } catch (error) {
    console.error('Error syncing uploadEntry to monthlyData:', error);
    throw error;
  }
};

/**
 * Creates monthly data entries for all users based on their uploadEntry data
 * This function creates a new entry for each month if one doesn't already exist
 */
export const generateMonthlyDataForAllUsers = async () => {
  try {
    // Get all upload entries
    const uploadQuery = query(collection(db, 'uploadEntry'), orderBy('uploadedAt', 'desc'));
    const uploadSnapshot = await getDocs(uploadQuery);

    const uploadEntries: any[] = [];
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

        const newMonthlyData = {
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

    console.log('Monthly data generated for all users');
  } catch (error) {
    console.error('Error generating monthly data for all users:', error);
    throw error;
  }
};

/**
 * Updates a user in both uploadEntry and monthlyData collections
 */
export const updateUserDataInBothCollections = async (uploadEntryId: string, updatedData: any) => {
  try {
    // Update in uploadEntry collection
    const uploadEntryRef = doc(db, 'uploadEntry', uploadEntryId);
    await updateDoc(uploadEntryRef, updatedData);

    // Sync to monthlyData collection
    await syncUploadEntryToMonthlyData(uploadEntryId, updatedData);

    console.log(`User data updated in both collections for user ${uploadEntryId}`);
  } catch (error) {
    console.error('Error updating user data in both collections:', error);
    throw error;
  }
};

/**
 * Deletes a user from both uploadEntry and monthlyData collections
 */
export const deleteUserDataFromBothCollections = async (uploadEntryId: string) => {
  try {
    // Delete from uploadEntry collection
    const uploadEntryRef = doc(db, 'uploadEntry', uploadEntryId);
    await deleteDoc(uploadEntryRef);

    // Delete corresponding monthly data
    await deleteMonthlyDataForUser(uploadEntryId);

    console.log(`User data deleted from both collections for user ${uploadEntryId}`);
  } catch (error) {
    console.error('Error deleting user data from both collections:', error);
    throw error;
  }
};