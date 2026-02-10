'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Table, Text, Loader, Badge, Group, Button, TextInput, Select, Stack } from '@mantine/core';
import { IconSearch, IconCalendar, IconUser, IconCash, IconCreditCard } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';

// Import StatsCard component
import { StatsCard } from '@/components/dashboard/StatsCard';

// Define the data type to match users/report page
type PaymentRecord = {
  id: string; // Firebase document ID
  userId: string; // User ID (Firebase doc ID from uploadEntry)
  username: string; // Username from user record
  userName: string; // User name
  date: string; // Payment date
  paidByTime?: string; // Time when payment was made
  paidByName: string; // Name of person who made the payment
  amount: number; // Payment amount
  balance: number; // Remaining balance after payment
  method: string; // Payment method
  isPaid: boolean; // Whether the payment completed the full amount
  recordType: 'payment' | 'user'; // To distinguish between payment records and user records
  [key: string]: unknown; // Allow dynamic properties
};

const UserDetailPage = () => {
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [dataTypes, setDataTypes] = useState<string[]>(['all']);

  const { isAuthenticated } = useSelector((state: RootState) => state.authStates);

  // Fetch user's data from Firebase - similar to users/report page
  useEffect(() => {
    const fetchData = async () => {
      // Check if user is authenticated first
      if (!isAuthenticated) {
        console.log("User not authenticated");
        setLoading(false);
        return;
      }

      console.log("isAuthenticated object:", isAuthenticated);

      setLoading(true);

      try {
        // Use the actual logged-in user's username from Redux store
        const usernameToUse = isAuthenticated.username;
        const userIdToUse = isAuthenticated.uid;
        console.log("Fetching data for user - Username:", usernameToUse, "UserID:", userIdToUse);

        // If username is not available, we can't filter properly
        if (!usernameToUse && !userIdToUse) {
          console.log("Username and UserID not available, cannot filter data");
          setLoading(false);
          return;
        }

        // Query the payments collection for payment records
        const paymentsQuery = query(collection(db, 'payments'), orderBy('date', 'desc'));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const paymentsData: PaymentRecord[] = [];

        console.log("Total payment docs found:", paymentsSnapshot.size);

        for (const paymentDoc of paymentsSnapshot.docs) {
          const data = paymentDoc.data();
          console.log("Processing payment doc:", paymentDoc.id, data);

          // Helper function to convert Firestore timestamp to string
          const convertTimestamp = (timestamp: any) => {
            if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
              return new Date(timestamp.seconds * 1000).toISOString();
            }
            return timestamp || '';
          };

          // Helper function to convert Firestore timestamp to date string
          const convertToDateStr = (timestamp: any) => {
            if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
              return new Date(timestamp.seconds * 1000).toISOString().split('T')[0];
            }
            return typeof timestamp === 'string' ? timestamp.split('T')[0] :
                   new Date().toISOString().split('T')[0];
          };

          // Helper function to safely extract numeric values
          const getNumericValue = (value: any, defaultValue: number = 0) => {
            if (typeof value === 'number') return value;
            if (typeof value === 'string') return parseFloat(value) || defaultValue;
            if (value && typeof value === 'object' && 'seconds' in value) return defaultValue; // Handle Firestore timestamps
            return Number(value) || defaultValue;
          };

          // Check if this payment record belongs to the current user by checking multiple possible fields
          // First, try to get the username from the user document in uploadEntry collection (similar to users/report page)
          let username = 'N/A';
          let userIdFromLookup = null;
          
          if (data.userId) {
            try {
              const userDocRef = doc(db, 'uploadEntry', data.userId);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                username = userData.username || userData.Username || userData.name || userData.Name || data.userId;
                userIdFromLookup = data.userId;
              }
            } catch (err) {
              console.error('Error fetching user data:', err);
              username = data.userId; // Fallback to userId if user data fetch fails
              userIdFromLookup = data.userId;
            }
          }

          // If we still don't have a username from the lookup, try other fields in the payment record
          if (username === 'N/A' || username === data.userId) {
            // Check if the username is directly in the payment record
            username = data.userName || data.username || data.name || data.Name || data.userId || 'N/A';
          }

          console.log("Comparing payment username:", username, "with target:", usernameToUse);
          console.log("Comparing payment userId:", data.userId, "with target:", userIdToUse);
          console.log("Comparing payment userIdFromLookup:", userIdFromLookup, "with target:", userIdToUse);

          // Check if this payment record belongs to the current user by username OR userId
          const isUsernameMatch = usernameToUse && username.toLowerCase() === usernameToUse.toLowerCase();
          const isUserIdMatch = userIdToUse && (data.userId === userIdToUse || userIdFromLookup === userIdToUse);

          console.log("isUsernameMatch:", isUsernameMatch, "isUserIdMatch:", isUserIdMatch);

          if (isUsernameMatch || isUserIdMatch) {
            console.log("Match found for payment:", paymentDoc.id);
            paymentsData.push({
              id: paymentDoc.id,
              userId: data.userId || 'N/A',
              username: username,
              userName: data.userName || data.username || 'N/A',
              date: convertToDateStr(data.date),
              paidByTime: convertTimestamp(data.paidByTime || data.paidByDateTime),
              paidByName: data.paidByName || 'System',
              amount: getNumericValue(data.amount, 0),
              balance: getNumericValue(data.newBalance, 0) || getNumericValue(data.balance, 0),
              method: typeof data.method === 'string' ? data.method : 'cash',
              isPaid: typeof data.isPaid === 'boolean' ? data.isPaid : false,
              recordType: 'payment',
              ...data
            });
          }
        }

        // Query the uploadEntry collection for user records
        const usersQuery = query(collection(db, 'uploadEntry'), orderBy('uploadedAt', 'desc'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData: PaymentRecord[] = [];

        console.log("Total uploadEntry docs found:", usersSnapshot.size);

        for (const userDoc of usersSnapshot.docs) {
          const data = userDoc.data();
          console.log("Processing uploadEntry doc:", userDoc.id, data);

          // Helper function to convert Firestore timestamp to string
          const convertTimestamp = (timestamp: any) => {
            if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
              return new Date(timestamp.seconds * 1000).toISOString();
            }
            return timestamp || '';
          };

          // Helper function to convert Firestore timestamp to date string
          const convertToDateStr = (timestamp: any) => {
            if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
              return new Date(timestamp.seconds * 1000).toISOString().split('T')[0];
            }
            return typeof timestamp === 'string' ? timestamp.split('T')[0] :
                   new Date().toISOString().split('T')[0];
          };

          // Helper function to safely extract numeric values
          const getNumericValue = (value: any, defaultValue: number = 0) => {
            if (typeof value === 'number') return value;
            if (typeof value === 'string') return parseFloat(value) || defaultValue;
            if (value && typeof value === 'object' && 'seconds' in value) return defaultValue; // Handle Firestore timestamps
            return Number(value) || defaultValue;
          };

          // Check if this user record belongs to the current user by username
          const userUsername = data.Username || data.username || data.name || data.Name || 'N/A';
          console.log("Checking uploadEntry for user:", userUsername, "vs", usernameToUse);
          
          const isUserUsernameMatch = usernameToUse && userUsername.toLowerCase() === usernameToUse.toLowerCase();
          const isUserIdMatch = userIdToUse && userDoc.id === userIdToUse;
          
          console.log("isUserUsernameMatch:", isUserUsernameMatch, "isUserIdMatch:", isUserIdMatch);

          if (isUserUsernameMatch || isUserIdMatch) {
            console.log("Match found for uploadEntry:", userDoc.id);
            // Calculate the total amount and balance
            const balance = getNumericValue(data.balance, 0);
            const monthlyFees = getNumericValue(data.monthlyFees, 0);
            const totalAmount = getNumericValue(data.totalAmount, 0) || getNumericValue(data.Total, 0) || getNumericValue(data.amount, 0) || (balance + monthlyFees);

            // Determine if the user is fully paid based on their balance
            const isPaid = balance <= 0;

            usersData.push({
              id: userDoc.id,
              userId: userDoc.id, // Use document ID as userId
              username: userUsername,
              userName: data.name || data.Name || data.username || data.Username || 'N/A',
              date: convertToDateStr(data.uploadedAt || data.createdAt || data.date || data.Date || new Date()),
              paidByTime: undefined,
              paidByName: 'System', // Default value for user records
              amount: totalAmount,
              balance: balance,
              method: 'N/A', // Default value for user records
              isPaid: isPaid,
              recordType: 'user',
              ...data
            });
          }
        }

        console.log("Payments found:", paymentsData.length);
        console.log("UploadEntries found:", usersData.length);

        // Combine both datasets and sort by date (most recent first)
        const allRecords = [...paymentsData, ...usersData].sort((a, b) => {
          // Convert dates to comparable format for sorting
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA; // Descending order (most recent first)
        });

        console.log("Combined records:", allRecords.length);
        setPaymentRecords(allRecords);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [JSON.stringify(isAuthenticated)]); // Use JSON.stringify to avoid dependency array size changes

  // Apply filters
  const filteredRecords = paymentRecords.filter(record => {
    // Search filter - now includes User ID (username), Name (userName), and Paid By Name
    const matchesSearch =
      record.username.toLowerCase().includes(searchTerm.toLowerCase()) ||  // User ID
      record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||  // Name
      record.paidByName.toLowerCase().includes(searchTerm.toLowerCase());  // Paid By Name

    // Date range filter
    let matchesDateRange = true;
    if (dateRange[0] || dateRange[1]) {
      // Convert record date to Date object for comparison
      let recordDateObj: Date;
      if (typeof record.date === 'string') {
        // If record.date is in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
          recordDateObj = new Date(record.date);
        } else {
          // If record.date is in ISO format
          recordDateObj = new Date(record.date);
        }
      } else if (typeof record.date === 'object' && record.date && 'seconds' in record.date) {
        // If record.date is a Firestore timestamp
        recordDateObj = new Date((record.date as any).seconds * 1000);
      } else {
        // Fallback to current date if format is unknown
        recordDateObj = new Date(record.date);
      }

      // Adjust for timezone by setting to start/end of day
      const adjustedRecordDate = new Date(recordDateObj.setHours(0, 0, 0, 0));

      if (dateRange[0] && dateRange[1]) {
        const startOfDay = new Date(dateRange[0]);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateRange[1]);
        endOfDay.setHours(23, 59, 59, 999);
        matchesDateRange = adjustedRecordDate >= startOfDay && adjustedRecordDate <= endOfDay;
      } else if (dateRange[0]) {
        const startOfDay = new Date(dateRange[0]);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateRange[0]);
        endOfDay.setHours(23, 59, 59, 999);
        matchesDateRange = adjustedRecordDate >= startOfDay && adjustedRecordDate <= endOfDay;
      } else if (dateRange[1]) {
        const startOfDay = new Date(dateRange[1]);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateRange[1]);
        endOfDay.setHours(23, 59, 59, 999);
        matchesDateRange = adjustedRecordDate >= startOfDay && adjustedRecordDate <= endOfDay;
      }
    }

    // Status filter (All/Paid/Unpaid) - replacing the previous recordType filter
    let matchesStatus = true;
    if (dataTypes[0] && dataTypes[0] !== 'all') {
      if (dataTypes[0] === 'paid') {
        matchesStatus = record.isPaid === true;
      } else if (dataTypes[0] === 'unpaid') {
        matchesStatus = record.isPaid === false;
      }
    }

    return matchesSearch && matchesDateRange && matchesStatus;
  });

  // Calculate statistics
  const totalAmountPaid = filteredRecords.filter(r => r.recordType === 'payment').reduce((sum, record) => sum + record.amount, 0);
  const totalUnpaidAmount = filteredRecords.filter(r => r.recordType === 'user').reduce((sum, record) => sum + (record.amount || 0), 0);
  const totalPayableAmount = totalAmountPaid + totalUnpaidAmount; // Sum of paid and unpaid amounts

  // Format currency
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? '0' : `Rs. ${num.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <Text className="text-2xl font-bold text-gray-800">User Dashboard</Text>
        <Text className="text-gray-600">View your personal records and transactions</Text>
      </div>

      {/* Filters */}
      <Stack gap="md" className="mb-6 p-4 bg-gray-50 rounded-lg">
        <Group justify="space-between">
          <TextInput
            placeholder="Search by ID, name, or paid by name..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            className="flex-1 max-w-md"
          />
          
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange[0] ? new Date(dateRange[0]).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const newStart = e.currentTarget.value ? new Date(e.currentTarget.value) : null;
                setDateRange([newStart, dateRange[1]]);
              }}
              className="w-full h-10 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange[1] ? new Date(dateRange[1]).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const newEnd = e.currentTarget.value ? new Date(e.currentTarget.value) : null;
                setDateRange([dateRange[0], newEnd]);
              }}
              className="w-full h-10 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <Select
            placeholder="Select status"
            data={[
              { value: 'all', label: 'All' },
              { value: 'paid', label: 'Paid' },
              { value: 'unpaid', label: 'Unpaid' },
            ]}
            value={dataTypes[0]}
            onChange={(value) => setDataTypes(value ? [value] : [])}
            className="flex-1 max-w-xs"
          />
        </Group>
      </Stack>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard title="Total Amount Paid" value={formatCurrency(totalAmountPaid)} variant="green" />
        <StatsCard title="Total Unpaid Amount" value={formatCurrency(totalUnpaidAmount)} variant="orange" />
        <StatsCard title="Total Payable Amount" value={formatCurrency(totalPayableAmount)} variant="blue" />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">User ID</Table.Th>
              <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Name</Table.Th>
              <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Date</Table.Th>
              <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Paid Date</Table.Th>
              <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Paid By Name</Table.Th>
              <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Paid Amount</Table.Th>
              <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => (
                <Table.Tr key={`${record.recordType}-${record.id}-${index}`} className="hover:bg-gray-50">
                  <Table.Td className="font-semibold text-gray-700">
                    {record.username}
                  </Table.Td>
                  <Table.Td>
                    {record.userName}
                  </Table.Td>
                  <Table.Td>
                    {typeof record.date === 'string'
                      ? record.date
                      : typeof record.date === 'object' && record.date && 'seconds' in record.date
                        ? new Date((record.date as any).seconds * 1000).toLocaleDateString()
                        : new Date(record.date).toLocaleDateString()}
                  </Table.Td>
                  <Table.Td>
                    {record.paidByTime ?
                      (typeof record.paidByTime === 'object' && 'seconds' in record.paidByTime
                        ? new Date((record.paidByTime as any).seconds * 1000).toLocaleDateString()
                        : new Date(record.paidByTime).toLocaleDateString())
                      : 'N/A'}
                  </Table.Td>
                  <Table.Td>
                    {record.paidByName}
                  </Table.Td>
                  <Table.Td className="font-bold text-gray-800">
                    Rs. {record.amount.toFixed(2)}
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      variant="light"
                      color={record.isPaid ? 'green' : 'orange'}
                      radius="sm"
                      className="font-bold py-2 px-3 text-xs"
                    >
                      {record.isPaid ? 'PAID' : 'UNPAID'}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={7} className="text-center py-8">
                  <Text className="text-gray-500">
                    {searchTerm || dateRange[0] || dateRange[1] 
                      ? 'No records found matching your filters' 
                      : 'No records available'}
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </div>
    </div>
  );
};

export default UserDetailPage;