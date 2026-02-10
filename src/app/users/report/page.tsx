'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextInput, Text, Badge, LoadingOverlay, Table, Paper, Modal, Input, Group, Divider, Select, Alert } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSearch, IconX, IconCalendar, IconCoin, IconUser, IconId, IconPrinter, IconPencil, IconPlus } from '@tabler/icons-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, query, where, orderBy, doc as firestoreDoc, updateDoc, addDoc } from 'firebase/firestore';

// Define the data type for payment records
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

export default function UserReportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [paidStatus, setPaidStatus] = useState<string>('all'); // 'all', 'paid', 'unpaid'
  const [editingUser, setEditingUser] = useState<PaymentRecord | null>(null);
  const [editForm, setEditForm] = useState<Partial<PaymentRecord>>({});
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState<Omit<PaymentRecord, 'id'>>({
    userId: '',
    userName: '',
    date: new Date().toISOString().split('T')[0],
    paidByName: '',
    amount: 0,
    balance: 0,
    method: 'cash',
    isPaid: false
  });
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Function to fetch payment records from Firebase
  const fetchPaymentRecords = async () => {
    setIsLoading(true);
    try {
      // Query the payments collection for payment records
      const paymentsQuery = query(collection(db, 'payments'), orderBy('date', 'desc'));
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const paymentsData: PaymentRecord[] = [];

      for (const paymentDoc of paymentsSnapshot.docs) {
        const data = paymentDoc.data();

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
            const userDocRef = firestoreDoc(db, 'uploadEntry', data.userId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              username = userData.username || userData.Username || userData.name || userData.Name || data.userId;
            }
          } catch (err) {
            console.error('Error fetching user data:', err);
            username = data.userId; // Fallback to userId if user data fetch fails
          }
        }

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

      // Query the uploadEntry collection for user records
      const usersQuery = query(collection(db, 'uploadEntry'), orderBy('uploadedAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData: PaymentRecord[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const data = userDoc.data();

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

        // Calculate the total amount and balance
        const balance = getNumericValue(data.balance, 0);
        const monthlyFees = getNumericValue(data.monthlyFees, 0);
        const totalAmount = getNumericValue(data.totalAmount, 0) || getNumericValue(data.Total, 0) || getNumericValue(data.amount, 0) || (balance + monthlyFees);
        
        // Determine if the user is fully paid based on their balance
        const isPaid = balance <= 0;

        usersData.push({
          id: userDoc.id,
          userId: userDoc.id, // Use document ID as userId
          username: data.username || data.Username || data.name || data.Name || 'N/A',
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

      // Combine both datasets and sort by date (most recent first)
      const allRecords = [...paymentsData, ...usersData].sort((a, b) => {
        // Convert dates to comparable format for sorting
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Descending order (most recent first)
      });

      setPaymentRecords(allRecords);
    } catch (error) {
      console.error('Error fetching payment records:', error);
      setPaymentRecords([]);
      setAlertMessage({ type: 'error', message: 'Failed to load payment records. Please try again.' });
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Load payment records on component mount
  useEffect(() => {
    fetchPaymentRecords();
  }, []);

  // Filter payment records based on search term, date range, and paid status
  const filteredRecords = paymentRecords.filter(record => {
    // Search filter
    const matchesSearch =
      record.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.paidByName.toLowerCase().includes(searchTerm.toLowerCase());
    
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
    
    // Paid status filter
    let matchesPaidStatus = true;
    if (paidStatus === 'paid') {
      matchesPaidStatus = record.isPaid === true;
    } else if (paidStatus === 'unpaid') {
      matchesPaidStatus = record.isPaid === false;
    }
    
    return matchesSearch && matchesDateRange && matchesPaidStatus;
  });

  // Handle form input changes
  const handleInputChange = (field: keyof PaymentRecord, value: any) => {
    setEditForm(prev => {
      // Create a new object to ensure state updates properly
      const newForm = { ...prev };
      newForm[field] = value;
      return newForm;
    });
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!editingUser) return;

    try {
      const docRef = firestoreDoc(db, 'payments', editingUser.id);

      // Prepare update object - only allow updating editable fields
      const updateData: Partial<PaymentRecord> = {
        paidByName: editForm.paidByName,
        amount: editForm.amount,
        method: editForm.method,
      };

      await updateDoc(docRef, updateData);

      // Update local state
      setPaymentRecords(prev => prev.map(u =>
        u.id === editingUser.id ? { ...editingUser, ...updateData } : u
      ));

      setEditingUser(null);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingUser(null);
    setEditForm({});
  };

  // Handle new user form input changes
  const handleNewUserInputChange = (field: keyof Omit<PaymentRecord, 'id'>, value: any) => {
    setNewUserForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save new user
  const handleSaveNewUser = async () => {
    try {
      // Add the new payment record to the payments collection
      const docRef = await addDoc(collection(db, 'payments'), {
        ...newUserForm,
        createdAt: new Date()
      });

      // Add the new record to the local state
      const newRecord: PaymentRecord = {
        id: docRef.id,
        userId: (newUserForm.userId as string) || '',
        username: (newUserForm.username as string) || (newUserForm.userName as string) || 'N/A',
        userName: (newUserForm.userName as string) || 'N/A',
        date: (newUserForm.date as string) || new Date().toISOString().split('T')[0],
        paidByTime: (newUserForm.paidByTime as string) || undefined,
        paidByName: (newUserForm.paidByName as string) || '',
        amount: (newUserForm.amount as number) || 0,
        balance: (newUserForm.balance as number) || 0,
        method: (newUserForm.method as string) || 'cash',
        isPaid: (newUserForm.isPaid as boolean) || false,
        recordType: 'payment',
        ...newUserForm
      };
      
      setPaymentRecords(prev => [...prev, newRecord]);
      
      // Reset the form and close the modal
      setNewUserForm({
        userId: '',
        userName: '',
        date: new Date().toISOString().split('T')[0],
        paidByName: '',
        amount: 0,
        balance: 0,
        method: 'cash',
        isPaid: false
      });
      setIsNewUserModalOpen(false);
    } catch (error) {
      console.error("Error adding new payment record: ", error);
    }
  };

  // Close new user modal
  const closeNewUserModal = () => {
    setIsNewUserModalOpen(false);
    setNewUserForm({
      userId: '',
      userName: '',
      date: new Date().toISOString().split('T')[0],
      paidByName: '',
      amount: 0,
      balance: 0,
      method: 'cash',
      isPaid: false
    });
  };

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
        {alertMessage && (
          <div className={`p-4 rounded-lg ${alertMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="flex justify-between items-center">
              <span>{alertMessage.message}</span>
              <button 
                onClick={() => setAlertMessage(null)}
                className="text-lg font-bold"
              >
                &times;
              </button>
            </div>
          </div>
        )}
        
        <Paper radius="lg" withBorder className="p-6 bg-white border-gray-200 shadow-md">
          <div className="flex flex-col space-y-4">
            <div>
              <TextInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by user ID, name, or paid by name..."
                size="md"
                leftSection={<IconSearch size={16} />}
                rightSection={
                  searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <IconX size={16} />
                    </button>
                  )
                }
                className="w-full pr-10"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  value={paidStatus}
                  onChange={(value) => value && setPaidStatus(value)}
                  data={[
                    { value: 'all', label: 'All' },
                    { value: 'paid', label: 'Paid' },
                    { value: 'unpaid', label: 'Unpaid' },
                  ]}
                  size="md"
                  className="w-full"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    // Print functionality - print only the table
                    window.print();
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white flex items-center justify-center gap-2 w-full h-[44px] rounded-lg shadow-md transition-all duration-200"
                  size="md"
                  leftSection={<IconPrinter size={18} />}
                >
                  Print
                </Button>
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
                  Payment Records Report
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
                    {isLoading ? (
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
                          {searchTerm || dateRange[0] || dateRange[1] || paidStatus !== 'all'
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
              {isLoading ? (
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
                  {searchTerm || dateRange[0] || dateRange[1] || paidStatus !== 'all'
                    ? 'No payment records found matching your filters'
                    : 'No payment records available'}
                </Paper>
              )}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          opened={!!editingUser}
          onClose={closeEditModal}
          title={
            <Text className="flex items-center gap-2">
              <IconPencil className="text-blue-600" size={20} />
              Edit Payment Record: <span className="font-bold">{editingUser?.userName || editingUser?.userId}</span>
            </Text>
          }
          size="lg"
          overlayProps={{
            backgroundOpacity: 0.5,
            blur: 3,
          }}
        >
          {editingUser && (
            <div className="space-y-5">
              <Input.Wrapper label="User ID" description="This cannot be modified">
                <Input
                  placeholder="Cannot be modified"
                  value={editingUser.userId}
                  disabled
                  className="bg-gray-50"
                />
              </Input.Wrapper>

              <Input.Wrapper label="User Name" description="Update the user's name if needed">
                <Input
                  placeholder="Enter user name"
                  value={editForm.userName || ''}
                  onChange={(e) => handleInputChange('userName', e.currentTarget.value)}
                />
              </Input.Wrapper>

              <Input.Wrapper label="Date" description="Select the payment date">
                <Input
                  type="date"
                  value={editForm.date || ''}
                  onChange={(e) => handleInputChange('date', e.currentTarget.value)}
                />
              </Input.Wrapper>

              <Input.Wrapper label="Paid By Name" description="Name of person who made the payment">
                <Input
                  placeholder="Enter name of person who made payment"
                  value={editForm.paidByName || ''}
                  onChange={(e) => handleInputChange('paidByName', e.currentTarget.value)}
                />
              </Input.Wrapper>

              <Input.Wrapper label="Amount" description="Enter the payment amount">
                <Input
                  placeholder="Enter payment amount"
                  type="number"
                  value={editForm.amount !== undefined && editForm.amount !== null ? String(editForm.amount) : "0"}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.currentTarget.value) || 0)}
                />
              </Input.Wrapper>

              <Select
                label="Payment Method"
                description="Choose the payment method used"
                placeholder="Select payment method"
                value={editForm.method || 'cash'}
                onChange={(value) => value && handleInputChange('method', value)}
                data={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'bank', label: 'Bank Transfer' },
                  { value: 'mobile', label: 'Mobile Payment' },
                ]}
                leftSection={<IconCoin size={16} />}
              />

              <Divider my="sm" />

              <Group justify="right" mt="md">
                <Button variant="outline" onClick={closeEditModal} color="gray" className="border-gray-300">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveChanges} 
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-md"
                >
                  Save Changes
                </Button>
              </Group>
            </div>
          )}
        </Modal>

        {/* New Payment Record Modal */}
        <Modal
          opened={isNewUserModalOpen}
          onClose={closeNewUserModal}
          title={
            <Text className="flex items-center gap-2">
              <IconPlus className="text-green-600" size={20} />
              Add New Payment Record
            </Text>
          }
          size="lg"
          overlayProps={{
            backgroundOpacity: 0.5,
            blur: 3,
          }}
        >
          <div className="space-y-5">
            <Input.Wrapper label="User ID" description="Enter the user's ID">
              <Input
                placeholder="Enter user ID"
                value={String(newUserForm.userId || '')}
                onChange={(e) => handleNewUserInputChange('userId', e.currentTarget.value)}
              />
            </Input.Wrapper>

            <Input.Wrapper label="User Name" description="Enter the user's name">
              <Input
                placeholder="Enter user name"
                value={String(newUserForm.userName || '')}
                onChange={(e) => handleNewUserInputChange('userName', e.currentTarget.value)}
              />
            </Input.Wrapper>

            <Input.Wrapper label="Date" description="Select the payment date">
              <Input
                type="date"
                value={String(newUserForm.date || '')}
                onChange={(e) => handleNewUserInputChange('date', e.currentTarget.value)}
              />
            </Input.Wrapper>

            <Input.Wrapper label="Paid By Name" description="Enter name of person who made payment">
              <Input
                placeholder="Enter name of person who made payment"
                value={String(newUserForm.paidByName || '')}
                onChange={(e) => handleNewUserInputChange('paidByName', e.currentTarget.value)}
              />
            </Input.Wrapper>

            <Input.Wrapper label="Amount" description="Enter the payment amount">
              <Input
                placeholder="Enter payment amount"
                type="number"
                value={newUserForm.amount !== undefined && newUserForm.amount !== null ? String(newUserForm.amount) : ""}
                onChange={(e) => handleNewUserInputChange('amount', parseFloat(e.currentTarget.value) || 0)}
              />
            </Input.Wrapper>

            <Select
              label="Payment Method"
              description="Select the payment method used"
              placeholder="Select payment method"
              value={String(newUserForm.method || '')}
              onChange={(value) => value && handleNewUserInputChange('method', value)}
              data={[
                { value: 'cash', label: 'Cash' },
                { value: 'bank', label: 'Bank Transfer' },
                { value: 'mobile', label: 'Mobile Payment' },
              ]}
              leftSection={<IconCoin size={16} />}
            />


            <Divider my="sm" />

            <Group justify="right" mt="md">
              <Button variant="outline" onClick={closeNewUserModal} color="gray" className="border-gray-300">
                Cancel
              </Button>
              <Button 
                onClick={handleSaveNewUser} 
                className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white shadow-md"
              >
                Add Record
              </Button>
            </Group>
          </div>
        </Modal>
      </div>
    </>
  );
}