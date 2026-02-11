import { createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Define the async thunk for fetching stats data
export const fetchStatsData = createAsyncThunk(
  'stats/fetchStatsData',
  async (_, { rejectWithValue }) => {
    try {
      // Calculate Payments Received from payments collection
      const paymentsQuery = query(collection(db, 'payments'));
      const paymentsSnapshot = await getDocs(paymentsQuery);
      let paymentsReceived = 0;
      let paidUsersSet = new Set<string>(); // Track unique users who made payments
      
      paymentsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (typeof data.amount === 'number') {
          paymentsReceived += data.amount;
        }
        if (data.userId) {
          paidUsersSet.add(data.userId);
        }
      });

      // Calculate data from uploadEntry collection
      const uploadEntryQuery = query(collection(db, 'uploadEntry'));
      const uploadEntrySnapshot = await getDocs(uploadEntryQuery);
      let currentBalance = 0; // Sum of all original payment amounts from uploadEntry
      let totalUsers = 0;
      let unpaidUsersCount = 0;
      let totalUploadEntryOriginalAmounts = 0; // Total original amounts from uploadEntry records
      
      uploadEntrySnapshot.forEach((doc) => {
        const data = doc.data();
        totalUsers++;
        
        // Calculate total original payment amount for current balance stat (sum of all original amounts from uploadEntry)
        // Look for potential amount fields that could represent the total payment
        const potentialAmountFields = [
          data.Total, data.total, data.Amount, data.amount, data['Total Amount'], data.totalAmount, data.TotalAmount,
          data.total_amount, data.Total_Amount, data.payment, data.Payment, data.paymentAmount, data.PaymentAmount,
          data.payment_amount, data.Payment_Amount, data.fee, data.Fee, data.fees, data.Fees, data.Price, data.price
        ];

        // Find the first valid amount value
        let originalAmount = 0;
        for (const field of potentialAmountFields) {
          if (field !== undefined && field !== null) {
            const parsed = typeof field === 'number' ? field :
                          typeof field === 'string' ? parseFloat(field) || 0 :
                          Number(field) || 0;
            if (parsed !== 0) {
              originalAmount = parsed;
              break;
            }
          }
        }

        // If no specific amount was found, use monthlyFees as fallback
        if (originalAmount === 0) {
          const monthlyFees = typeof data.monthlyFees === 'number' ? data.monthlyFees :
                             typeof data.MonthlyFees === 'number' ? data.MonthlyFees :
                             typeof data.monthly_fee === 'number' ? data.monthly_fee :
                             typeof data.Monthly_Fee === 'number' ? data.Monthly_Fee : 0;
          originalAmount = monthlyFees;
        }

        currentBalance += originalAmount; // This will now show the total payment amount
        
        // Calculate total original amounts from uploadEntry records (the original payment amount)
        totalUploadEntryOriginalAmounts += originalAmount;
        
        // Count unpaid users (those with balance > 0 or isPaid: false)
        const balance = typeof data.balance === 'number' ? data.balance : 
                       typeof data.balance === 'string' ? parseFloat(data.balance) || 0 : 0;
        const isPaid = typeof data.isPaid === 'boolean' ? data.isPaid : 
                      typeof data.isPaid === 'string' ? data.isPaid.toLowerCase() === 'true' : false;
        if (!isPaid && balance > 0) {
          unpaidUsersCount++;
        }
      });

      // Calculate total payments (sum of payments from payments collection + original amounts from uploadEntry)
      const totalPayments = paymentsReceived + totalUploadEntryOriginalAmounts;

      // Calculate paid users count
      const paidUsersCount = totalUsers - unpaidUsersCount;

      return {
        paymentsReceived,
        currentBalance, // This is now the sum of all original payment amounts from uploadEntry
        totalPayments, // This is now the combined total from both collections
        paidUsers: paidUsersSet.size, // Count of unique users who made payments
        unpaidUsers: totalUsers, // This is the count of ALL users from uploadEntry (as requested)
        totalUsers
      };
    } catch {
      return rejectWithValue('Failed to fetch stats data');
    }
  }
);