'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Table, Text, Loader, Badge, Paper, LoadingOverlay, Select } from '@mantine/core';
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
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [dataTypes, setDataTypes] = useState<string[]>(['all']);
  const [currentUsername, setCurrentUsername] = useState<string>('');

  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.authStates);
  const role = (isAuthenticated as { role?: string })?.role?.toLowerCase() || 'user';

  useEffect(() => {
    if (role === 'admin' || role === 'employee') {
      router.replace('/users/collections');
    }
  }, [role, router]);

  // Fetch user's own data only (role: user). Do not run for admin/employee (they are redirected).
  useEffect(() => {
    if (role !== 'user') return;

    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Get the logged-in user's username and UID
        let loggedInUsername = isAuthenticated.username;
        const loggedInUid = isAuthenticated.uid;

        // Fallback: Fetch username from Firestore if missing from Redux
        if (!loggedInUsername && loggedInUid) {
          try {
            const userDocRef = doc(db, 'uploadEntry', loggedInUid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              loggedInUsername = userData.username || userData.Username || userData.name || userData.Name;
            }
          } catch {
            // fallback handled below
          }
        }

        setCurrentUsername(loggedInUsername || '');

        if (!loggedInUsername && !loggedInUid) {
          // Show no data if we cannot identify user
        }

        const paymentsQuery = query(collection(db, 'payments'), orderBy('date', 'desc'));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const paymentsData: PaymentRecord[] = [];

        // console.log("Total payment docs found:", paymentsSnapshot.size);

        for (const paymentDoc of paymentsSnapshot.docs) {
          const data = paymentDoc.data();
          // console.log("Processing payment doc:", paymentDoc.id, data);

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

          // Get the username from the user document in uploadEntry collection
          let username = 'N/A';
          if (data.userId) {
            try {
              const userDocRef = doc(db, 'uploadEntry', data.userId);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                username = userData.username || userData.Username || userData.name || userData.Name || data.userId;
              }
            } catch {
              username = data.userId;
            }
          }

        const isUsernameMatch = loggedInUsername && (
          (username.toLowerCase() === loggedInUsername.toLowerCase()) ||
          (data.userName && typeof data.userName === 'string' && data.userName.toLowerCase() === loggedInUsername.toLowerCase())
        );
        const shouldInclude = isUsernameMatch;

          if (!shouldInclude) {
            // console.log(`Payment Mismatch: Record username '${username}' !== LoggedIn '${loggedInUsername}'`);
          }

          if (shouldInclude) {
            paymentsData.push({
              id: paymentDoc.id,
              userId: data.userId || 'N/A',
              username: username,
              userName: data.userName || 'N/A',
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

        // console.log("Total uploadEntry docs found:", usersSnapshot.size);

        for (const userDoc of usersSnapshot.docs) {
          const data = userDoc.data();
          // console.log("Processing uploadEntry doc:", userDoc.id, data);

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

          // Get user information
          const userUsername = data.Username || data.username || data.name || data.Name || 'N/A';

          const isUsernameMatch = loggedInUsername && (userUsername.toLowerCase() === loggedInUsername.toLowerCase());
          const shouldInclude = isUsernameMatch;

          if (!shouldInclude) {
            // console.log(`User Record Mismatch: Record username '${userUsername}' !== LoggedIn '${loggedInUsername}'`);
          }

          if (shouldInclude) {
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

        // console.log("Payments found:", paymentsData.length);
        // console.log("UploadEntries found:", usersData.length);

        // Combine both datasets and sort by date (most recent first)
        const allRecords = [...paymentsData, ...usersData].sort((a, b) => {
          // Convert dates to comparable format for sorting
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA; // Descending order (most recent first)
        });

        // console.log("Combined records:", allRecords.length);
        setPaymentRecords(allRecords);
      } catch {
        setPaymentRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, role]);

  // Apply filters
  const filteredRecords = paymentRecords.filter(record => {
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

    // Status filter (All/Paid/Unpaid)
    let matchesStatus = true;
    if (dataTypes[0] && dataTypes[0] !== 'all') {
      if (dataTypes[0] === 'paid') {
        matchesStatus = record.isPaid === true;
      } else if (dataTypes[0] === 'unpaid') {
        matchesStatus = record.isPaid === false;
      }
    }

    return matchesDateRange && matchesStatus;
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

  if (role === 'admin' || role === 'employee') {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="xl" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #payment-table-container, #payment-table-container * {
            visibility: visible;
          }
          #payment-table-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .hidden-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="space-y-6">
        <div className="mb-8">
          <Text className="text-2xl font-bold text-gray-800">
            {currentUsername ? `${currentUsername} Dashboard` : 'User Dashboard'}
          </Text>
          <Text className="text-gray-600">View your personal records and transactions</Text>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="Total Amount Paid" value={formatCurrency(totalAmountPaid)} variant="green" />
          <StatsCard title="Total Unpaid Amount" value={formatCurrency(totalUnpaidAmount)} variant="orange" />
          <StatsCard title="Total Payable Amount" value={formatCurrency(totalPayableAmount)} variant="blue" />
        </div>

        {/* Filters */}
        <Paper radius="lg" withBorder className="p-6 bg-white border-gray-200 shadow-md">
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Text size="sm" className="mb-1 text-gray-600 font-medium">Start Date</Text>
                <input
                  type="date"
                  value={dateRange[0] ? new Date(dateRange[0]).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const newStart = e.currentTarget.value ? new Date(e.currentTarget.value) : null;
                    setDateRange([newStart, dateRange[1]]);
                  }}
                  className="w-full h-10 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <Text size="sm" className="mb-1 text-gray-600 font-medium">End Date</Text>
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
              <div>
                <Text size="sm" className="mb-2 text-gray-600 font-medium">
                  Status
                </Text>
                <Select
                  placeholder="All"
                  value={dataTypes[0]}
                  onChange={(value) => setDataTypes(value ? [value] : ['all'])}
                  data={[
                    { value: 'all', label: 'All' },
                    { value: 'paid', label: 'Paid' },
                    { value: 'unpaid', label: 'Unpaid' },
                  ]}
                  size="md"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </Paper>

        {/* Payment Records Table */}
        <div id="payment-table-container">
          <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
            <div className="w-full flex-1 min-w-0">
              <div className="w-full flex flex-col md:flex-row md:items-center gap-2">
                <Text className="text-xl font-bold text-gray-800 break-words">
                  User Payment Records
                </Text>
                <Badge color="blue" variant="light" className="text-xs px-3 py-1 flex-shrink-0 mt-1 md:mt-0">
                  {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
                </Badge>
              </div>
            </div>
            <Text className="text-sm text-gray-500 text-left md:text-right mt-1 md:mt-0 w-auto">
              Showing {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
            </Text>
          </div>

          {/* Responsive table container */}
          <div className="overflow-x-auto">
            {/* Desktop/Tablet view - Table */}
            <div className="hidden md:block">
              <Paper radius="md" withBorder className="overflow-hidden border-gray-100 shadow-sm">
                <Table verticalSpacing="sm" horizontalSpacing="lg" className="min-w-full">
                  <Table.Thead className="bg-gray-50/50">
                    <Table.Tr>
                      <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[100px] sm:min-w-[120px]">User ID</Table.Th>
                      <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[100px] sm:min-w-[120px]">Name</Table.Th>
                      <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[80px] sm:min-w-[100px]">Date</Table.Th>
                      <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[80px] sm:min-w-[100px]">Paid Date</Table.Th>
                      <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[100px] sm:min-w-[120px]">Paid By Name</Table.Th>
                      <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[80px] sm:min-w-[100px]">Paid Amount</Table.Th>
                      <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[60px] sm:min-w-[80px]">Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {loading ? (
                      <Table.Tr>
                        <Table.Td colSpan={7} className="text-center py-10">
                          <LoadingOverlay visible={true} overlayProps={{ radius: "sm", blur: 2 }} />
                          <Text className="text-center py-4">Loading payment records...</Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : filteredRecords.length > 0 ? (
                      filteredRecords.map((record) => (
                        <Table.Tr key={record.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-b-0">
                          <Table.Td className="font-semibold text-gray-700 py-2 px-2 sm:px-4 min-w-[100px] sm:min-w-[120px]">
                            {record.username}
                          </Table.Td>
                          <Table.Td className="py-2 px-2 sm:px-4 min-w-[100px] sm:min-w-[120px]">
                            {record.userName}
                          </Table.Td>
                          <Table.Td className="py-2 px-2 sm:px-4 min-w-[80px] sm:min-w-[100px]">
                            {typeof record.date === 'string'
                              ? record.date
                              : typeof record.date === 'object' && record.date && 'seconds' in record.date
                                ? new Date((record.date as any).seconds * 1000).toLocaleDateString()
                                : new Date(record.date).toLocaleDateString()}
                          </Table.Td>
                          <Table.Td className="py-2 px-2 sm:px-4 min-w-[80px] sm:min-w-[100px]">
                            {record.paidByTime ?
                              (typeof record.paidByTime === 'object' && 'seconds' in record.paidByTime
                                ? new Date((record.paidByTime as any).seconds * 1000).toLocaleDateString()
                                : new Date(record.paidByTime).toLocaleDateString())
                              : 'N/A'}
                          </Table.Td>
                          <Table.Td className="py-2 px-2 sm:px-4 min-w-[100px] sm:min-w-[120px]">
                            {record.paidByName}
                          </Table.Td>
                          <Table.Td className="font-bold text-gray-800 py-2 px-2 sm:px-4 min-w-[80px] sm:min-w-[100px]">
                            Rs. {record.amount.toFixed(2)}
                          </Table.Td>
                          <Table.Td className="py-2 px-2 sm:px-4 min-w-[60px] sm:min-w-[80px]">
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
                        <Table.Td colSpan={7} className="text-center py-10 text-gray-500">
                          {dateRange[0] || dateRange[1] || dataTypes[0] !== 'all'
                            ? 'No payment records found matching your filters'
                            : 'No payment records available'}
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Paper>
            </div>

            {/* Mobile view - Cards */}
            <div className="md:hidden">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <LoadingOverlay visible={true} overlayProps={{ radius: "sm", blur: 2 }} />
                  <Text className="text-center py-4">Loading payment records...</Text>
                </div>
              ) : filteredRecords.length > 0 ? (
                <div className="space-y-4">
                  {filteredRecords.map((record) => (
                    <Paper key={record.id} radius="md" withBorder className="p-4 border-gray-100 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Text size="xs" className="text-gray-500">User ID:</Text>
                          <Text className="font-semibold text-gray-700">{record.username}</Text>
                        </div>
                        <div>
                          <Text size="xs" className="text-gray-500">Name:</Text>
                          <Text className="text-gray-700">{record.userName}</Text>
                        </div>
                        <div>
                          <Text size="xs" className="text-gray-500">Date:</Text>
                          <Text className="text-gray-700">
                            {typeof record.date === 'string'
                              ? record.date
                              : typeof record.date === 'object' && record.date && 'seconds' in record.date
                                ? new Date((record.date as any).seconds * 1000).toLocaleDateString()
                                : new Date(record.date).toLocaleDateString()}
                          </Text>
                        </div>
                        <div>
                          <Text size="xs" className="text-gray-500">Paid Date:</Text>
                          <Text className="text-gray-700">
                            {record.paidByTime ?
                              (typeof record.paidByTime === 'object' && 'seconds' in record.paidByTime
                                ? new Date((record.paidByTime as any).seconds * 1000).toLocaleDateString()
                                : new Date(record.paidByTime).toLocaleDateString())
                              : 'N/A'}
                          </Text>
                        </div>
                        <div>
                          <Text size="xs" className="text-gray-500">Paid By:</Text>
                          <Text className="text-gray-700">{record.paidByName}</Text>
                        </div>
                        <div>
                          <Text size="xs" className="text-gray-500">Amount:</Text>
                          <Text className="font-bold text-gray-800">Rs. {record.amount.toFixed(2)}</Text>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <div>
                          <Text size="xs" className="text-gray-500">Status:</Text>
                          <Badge
                            variant="light"
                            color={record.isPaid ? 'green' : 'orange'}
                            radius="sm"
                            className="font-bold py-1 px-2 text-xs mt-1"
                          >
                            {record.isPaid ? 'PAID' : 'UNPAID'}
                          </Badge>
                        </div>
                      </div>
                    </Paper>
                  ))}
                </div>
              ) : (
                <Paper radius="md" withBorder className="p-6 text-center text-gray-500 border-gray-100 shadow-sm">
                  {dateRange[0] || dateRange[1] || dataTypes[0] !== 'all'
                    ? 'No payment records found matching your filters'
                    : 'No payment records available'}
                </Paper>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetailPage;