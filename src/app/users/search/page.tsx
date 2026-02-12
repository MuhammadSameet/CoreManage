'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextInput, Text, Badge, LoadingOverlay, Table, Paper, ActionIcon, Modal, Input, Group, Divider, Menu, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSearch, IconDotsVertical, IconX, IconCalendar, IconCoin, IconUser, IconId, IconPencil, IconTrash, IconPlus } from '@tabler/icons-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc, addDoc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Define the data type for user
type User = {
  id: string; // Firebase document ID
  name: string; // Name that user can edit
  username: string; // CSV username which serves as user ID
  address: string;
  startDate: string;
  totalAmount: number; // Final payment amount user needs to pay
  balance: number; // Remaining amount after payments
  isPaid: boolean;
  monthlyFees: number;
  package: string;
  phone: string;
  totalPayment: number; // Total payment (balance + monthly fees)
  recordType: 'user' | 'payment';
  [key: string]: unknown; // Allow dynamic properties
};

export default function UploadEntrySearchTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState<Omit<User, 'id' | 'totalPayment'>>({
    name: '',
    username: '',
    address: '',
    startDate: new Date().toISOString().split('T')[0],
    totalAmount: 0,
    balance: 0,
    isPaid: false,
    monthlyFees: 0,
    package: '',
    phone: ''
  });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isMakePaymentModalOpen, setIsMakePaymentModalOpen] = useState(false);
  const [isPaidPaymentModalOpen, setIsPaidPaymentModalOpen] = useState(false);
  const [isTotalPaymentModalOpen, setIsTotalPaymentModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paidPaymentAmount, setPaidPaymentAmount] = useState<number>(0);
  const [totalPaymentAmount, setTotalPaymentAmount] = useState<number>(0);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'make' | 'paid'>('make');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [authUser, setAuthUser] = useState<any>(null);
  const [loggedInUser, setLoggedInUser] = useState<string>('System User');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [slipData, setSlipData] = useState<{ paidByName: string; paidDate: string; username: string; name: string; payableAmount: number; currentBalance: number; paymentType: string } | null>(null);

  // Get the authenticated user on component mount
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, get their details
        setAuthUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email || 'Unknown User'
        });
      } else {
        // User is signed out
        setAuthUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Use the authenticated user's name from the Firebase Users collection
  useEffect(() => {
    const fetchLoggedInUserName = async () => {
      if (authUser?.uid) {
        try {
          // Fetch the user's actual name from the Users collection in Firebase
          const userDocRef = doc(db, 'Users', authUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const name = userData.name || userData.Name || userData.username || userData.Username || authUser.displayName || authUser.email?.split('@')[0] || 'System User';
            setLoggedInUser(name);
          } else {
            // Fallback to display name, email, or default if Firebase doc doesn't exist
            setLoggedInUser(authUser.displayName || authUser.email?.split('@')[0] || 'System User');
          }
        } catch {
          setLoggedInUser(authUser.displayName || authUser.email?.split('@')[0] || 'System User');
        }
      }
    };

    fetchLoggedInUserName();
  }, [authUser?.uid, authUser?.displayName, authUser?.email]);

  // Function to fetch users from Firebase
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Query the uploadEntry collection for user data
      const q = query(collection(db, 'uploadEntry'), orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const usersData: User[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Calculate totalAmount and balance based on your data structure
        const rawBalance = data.Balance || data.balance || data.currentBalance || data.CurrentBalance || data.remaining || data.Remaining ||
          data.current_balance || data.Current_Balance || data.remaining_amount || data.Remaining_Amount ||
          data.currentAmount || data.CurrentAmount || data.current_amount || data.Current_Amount || 0;
        const balance = typeof rawBalance === 'number' ? rawBalance :
          typeof rawBalance === 'string' ? parseFloat(rawBalance) || 0 :
            typeof rawBalance === 'object' && rawBalance && 'seconds' in rawBalance ? 0 : // Handle Firestore timestamps
              Number(rawBalance) || 0;

        const rawMonthlyFees = data.monthlyFees || data.MonthlyFees || data.monthly_fee || data.Monthly_Fee ||
          data.monthly_fees || data.Monthly_Fees || data.monthlyFee || data.MonthlyFee || 0;
        const monthlyFees = typeof rawMonthlyFees === 'number' ? rawMonthlyFees :
          typeof rawMonthlyFees === 'string' ? parseFloat(rawMonthlyFees) || 0 :
            Number(rawMonthlyFees) || 0;

        // Look for potential amount fields that could represent the total payment
        const potentialAmountFields = [
          data.Total, data.total, data.Amount, data.amount, data['Total Amount'], data.totalAmount, data.TotalAmount,
          data.total_amount, data.Total_Amount, data.payment, data.Payment, data.paymentAmount, data.PaymentAmount,
          data.payment_amount, data.Payment_Amount, data.fee, data.Fee, data.fees, data.Fees
        ];

        // Find the first valid amount value
        let totalAmount = 0;
        for (const field of potentialAmountFields) {
          if (field !== undefined && field !== null) {
            const parsed = typeof field === 'number' ? field :
              typeof field === 'string' ? parseFloat(field) || 0 :
                Number(field) || 0;
            if (parsed !== 0) {
              totalAmount = parsed;
              break;
            }
          }
        }

        // If no specific amount was found, use monthlyFees as fallback
        if (totalAmount === 0) {
          totalAmount = monthlyFees;
        }

        const totalPayment = isNaN(balance) ? 0 : balance; // Total payment is the remaining balance to be paid

        // Determine if the user is fully paid based on the original data from Firebase
        const calculatedIsPaid = data.isPaid !== undefined ? data.isPaid : data.IsPaid !== undefined ? data.IsPaid : (balance <= 0);

        usersData.push({
          id: doc.id,
          name: data.name || data.Name || data.username || data.Username || 'N/A',
          username: data.Username || data.username || data.name || 'N/A', // CSV username as user ID
          address: data.address || data.Address || data.location || data.Location || '',
          startDate: data.StartDate || data.startDate || data.Date || 'N/A',
          totalAmount: totalAmount,
          balance: balance,
          isPaid: calculatedIsPaid, // User is paid when balance is cleared
          monthlyFees: monthlyFees,
          totalPayment: totalPayment, // Total payment (remaining balance)
          package: data.package || data.Package || '',
          phone: data.phone || data.Phone || data.mobile || '',
          recordType: 'user',
          ...data
        });
      });

      // Create a map for quick user lookup from the already fetched usersData
      const usersMap = new Map<string, User>();
      usersData.forEach(user => {
        usersMap.set(user.id, user);
      });

      // Also fetch payment records to show in the table
      const paymentsQuery = query(collection(db, 'payments'), orderBy('date', 'desc'));
      const paymentsSnapshot = await getDocs(paymentsQuery);

      for (const paymentDoc of paymentsSnapshot.docs) {
        const data = paymentDoc.data();
        let username = 'N/A';
        let userAddress = 'Payment Record';
        let userPackage = 'Payment';
        let userName = data.userName || 'N/A';

        // Try to find user in map first (efficient)
        if (data.userId && usersMap.has(data.userId)) {
          const user = usersMap.get(data.userId)!;
          username = user.username;
          userAddress = user.address;
          userPackage = user.package;
          userName = user.name; // Use current user name
        } else if (data.userId) {
          // Fallback: Fetch if not in current list (legacy or deleted?)
          try {
            const userDocRef = doc(db, 'uploadEntry', data.userId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              username = userData.username || userData.Username || userData.name || userData.Name || data.userId;
              userAddress = userData.address || userData.Address || userAddress;
              userPackage = userData.package || userData.Package || userPackage;
              userName = userData.name || userData.Name || userName;
            } else {
              username = data.userId;
            }
          } catch {
            username = data.userId;
          }
        }

        usersData.push({
          id: paymentDoc.id,
          name: userName,
          username: username,
          address: userAddress,
          startDate: data.date || 'N/A', // Keep payment date as start date
          totalAmount: data.amount || 0,
          balance: data.balance || 0,
          isPaid: data.isPaid || false,
          monthlyFees: 0,
          package: userPackage,
          phone: 'N/A',
          totalPayment: data.amount || 0,
          recordType: 'payment',
          ...data
        });
      }

      setUsers(usersData);
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term and date range
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.package.toLowerCase().includes(searchTerm.toLowerCase());

    // Date range filter
    let matchesDateRange = true;
    if (dateRange[0] || dateRange[1]) {
      // Convert user start date to Date object for comparison
      let userDateObj: Date;
      if (typeof user.startDate === 'string') {
        // If user.startDate is in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(user.startDate)) {
          userDateObj = new Date(user.startDate);
        } else {
          // If user.startDate is in ISO format
          userDateObj = new Date(user.startDate);
        }
      } else {
        // Fallback to current date if format is unknown
        userDateObj = new Date(String(user.startDate));
      }

      // Adjust for timezone by setting to start/end of day
      const adjustedUserDate = new Date(userDateObj.setHours(0, 0, 0, 0));

      if (dateRange[0] && dateRange[1]) {
        const startOfDay = new Date(dateRange[0]!);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateRange[1]!);
        endOfDay.setHours(23, 59, 59, 999);
        matchesDateRange = adjustedUserDate >= startOfDay && adjustedUserDate <= endOfDay;
      } else if (dateRange[0]) {
        const startOfDay = new Date(dateRange[0]!);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateRange[0]!);
        endOfDay.setHours(23, 59, 59, 999);
        matchesDateRange = adjustedUserDate >= startOfDay && adjustedUserDate <= endOfDay;
      } else if (dateRange[1]) {
        const startOfDay = new Date(dateRange[1]!);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateRange[1]!);
        endOfDay.setHours(23, 59, 59, 999);
        matchesDateRange = adjustedUserDate >= startOfDay && adjustedUserDate <= endOfDay;
      }
    }

    return matchesSearch && matchesDateRange;
  });

  // Handle edit button click
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    // Initialize form with user data
    setEditForm({
      ...user
    });
  };

  // Handle form input changes
  const handleInputChange = (field: keyof User, value: any) => {
    setEditForm(prev => {
      // Create a new object to ensure state updates properly
      const newForm = { ...prev };
      newForm[field] = value;
      return newForm;
    });
  };

  // Handle save changes (updates uploadEntry and Data collection for consistency)
  const handleSaveChanges = async () => {
    if (!editingUser) return;

    try {
      const docRef = doc(db, 'uploadEntry', editingUser.id);
      const updateData: Partial<User> = {
        name: editForm.name,
        address: editForm.address,
        monthlyFees: editForm.monthlyFees,
        package: editForm.package,
        phone: editForm.phone,
      };

      await updateDoc(docRef, updateData);

      const dataRef = doc(db, 'Data', editingUser.username);
      const dataSnap = await getDoc(dataRef);
      if (dataSnap.exists()) {
        await updateDoc(dataRef, {
          name: updateData.name,
          address: updateData.address,
          package: updateData.package,
          phone: updateData.phone,
          monthlyFees: updateData.monthlyFees
        });
      }

      setUsers(prev => prev.map(u =>
        u.id === editingUser.id ? { ...editingUser, ...updateData } : u
      ));
      setEditingUser(null);
      notifications.show({
        title: 'Saved',
        message: 'User details updated.',
        color: 'green',
        position: 'top-right'
      });
    } catch {
      notifications.show({
        title: 'Update failed',
        message: 'Could not save changes. Try again.',
        color: 'red',
        position: 'top-right'
      });
    }
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingUser(null);
    setEditForm({});
  };

  // Handle new user form input changes
  const handleNewUserInputChange = (field: keyof Omit<User, 'id' | 'totalPayment'>, value: any) => {
    setNewUserForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save new user
  const handleSaveNewUser = async () => {
    try {
      // Add the new user to the uploadEntry collection
      const docRef = await addDoc(collection(db, 'uploadEntry'), {
        ...newUserForm,
        uploadedAt: new Date()
      });

      // Add the new user to the local state
      const newUser: User = {
        id: docRef.id,
        name: String(newUserForm.name || ''),
        username: String(newUserForm.username || ''),
        address: String(newUserForm.address || ''),
        startDate: String(newUserForm.startDate || ''),
        totalAmount: Number(newUserForm.totalAmount || 0),
        balance: Number(newUserForm.balance || 0),
        isPaid: Boolean(newUserForm.isPaid || false),
        monthlyFees: Number(newUserForm.monthlyFees || 0),
        package: String(newUserForm.package || ''),
        phone: String(newUserForm.phone || ''),
        totalPayment: Number(newUserForm.balance || 0), // Total payment is the remaining balance to be paid
        recordType: 'user',
        ...newUserForm
      };

      setUsers(prev => [...prev, newUser]);

      // Reset the form and close the modal
      setNewUserForm({
        name: '',
        username: '',
        address: '',
        startDate: new Date().toISOString().split('T')[0],
        totalAmount: 0,
        balance: 0,
        isPaid: false,
        monthlyFees: 0,
        package: '',
        phone: ''
      });
      setIsNewUserModalOpen(false);
    } catch {
      notifications.show({ title: 'Error', message: 'Could not add user.', color: 'red', position: 'top-right' });
    }
  };

  // Close new user modal
  const closeNewUserModal = () => {
    setIsNewUserModalOpen(false);
    setNewUserForm({
      name: '',
      username: '',
      address: '',
      startDate: new Date().toISOString().split('T')[0],
      totalAmount: 0,
      balance: 0,
      isPaid: false,
      monthlyFees: 0,
      package: '',
      phone: ''
    });
  };

  // Handle paid payment
  const handlePaidPayment = async () => {
    if (!selectedUser) {
      notifications.show({
        title: 'Error',
        message: "No user selected for payment",
        color: 'red',
        position: 'top-right'
      });
      return;
    }

    if (paidPaymentAmount <= 0) {
      notifications.show({
        title: 'Error',
        message: "Payment amount must be greater than 0",
        color: 'red',
        position: 'top-right'
      });
      return;
    }

    if (paidPaymentAmount > (selectedUser.balance + (selectedUser.monthlyFees || 0))) {
      notifications.show({
        title: 'Error',
        message: `Payment amount exceeds total payable amount of Rs. ${(selectedUser.balance + (selectedUser.monthlyFees || 0)).toFixed(2)}`,
        color: 'red',
        position: 'top-right'
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Update the user's balance in the uploadEntry collection
      const userDocRef = doc(db, 'uploadEntry', selectedUser.id);

      let newBalance = selectedUser.balance;
      let newMonthlyFees = selectedUser.monthlyFees || 0;
      let isPaid = false;

      // Paid payment reduces balance first, then monthly fees if balance is cleared
      if (paidPaymentAmount <= selectedUser.balance) {
        // Payment only affects balance
        newBalance = selectedUser.balance - paidPaymentAmount;
        newMonthlyFees = selectedUser.monthlyFees || 0;
      } else {
        // Payment exceeds balance, so apply remainder to monthly fees
        const excessPayment = paidPaymentAmount - selectedUser.balance;
        newBalance = 0;
        newMonthlyFees = Math.max(0, (selectedUser.monthlyFees || 0) - excessPayment);
      }
      isPaid = newBalance <= 0 && newMonthlyFees <= 0;

      await updateDoc(userDocRef, {
        balance: newBalance,
        monthlyFees: newMonthlyFees,
        isPaid: isPaid
      });

      const paidDateStr = new Date().toISOString();
      await addDoc(collection(db, 'payments'), {
        amount: paidPaymentAmount,
        date: paidDateStr,
        isPaid: true,
        newBalance: newBalance,
        newMonthlyFees: newMonthlyFees,
        previousBalance: selectedUser.balance,
        previousMonthlyFees: selectedUser.monthlyFees || 0,
        method: paymentMethod,
        userId: selectedUser.id,
        userName: selectedUser.name,
        paidByName: loggedInUser,
        paidByDateTime: paidDateStr
      });

      const payableAmount = selectedUser.balance + (selectedUser.monthlyFees || 0);
      if (isPaid && newBalance <= 0 && newMonthlyFees <= 0) {
        await deleteDoc(doc(db, 'uploadEntry', selectedUser.id));
        setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      } else {
        setUsers(prev => prev.map(u =>
          u.id === selectedUser.id
            ? { ...u, balance: newBalance, monthlyFees: newMonthlyFees, isPaid: isPaid }
            : u
        ));
      }

      setIsPaidPaymentModalOpen(false);
      setPaidPaymentAmount(0);
      setSelectedUser(null);

      const methodLabel = paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'bank' ? 'Bank Transfer' : 'Mobile Payment';
      setSlipData({
        paidByName: loggedInUser,
        paidDate: new Date().toLocaleString(),
        username: selectedUser.username,
        name: selectedUser.name,
        payableAmount,
        currentBalance: newBalance,
        paymentType: methodLabel
      });
      notifications.show({
        title: 'Payment recorded',
        message: `Rs. ${paidPaymentAmount.toFixed(2)} for ${selectedUser.name}. Balance: Rs. ${newBalance.toFixed(2)}`,
        color: 'green',
        position: 'top-right',
        autoClose: 3000
      });
      setTimeout(() => {
        setSlipData(null);
        fetchUsers();
      }, 800);
    } catch (error) {
      notifications.show({
        title: 'Payment failed',
        message: (error instanceof Error ? error.message : 'Something went wrong. Try again.'),
        color: 'red',
        position: 'top-right'
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle calculate payment
  const handleTotalPayment = async () => {
    if (!selectedUser) {
      notifications.show({
        title: 'Error',
        message: "No user selected for payment",
        color: 'red',
        position: 'top-right'
      });
      return;
    }

    if (totalPaymentAmount <= 0) {
      notifications.show({
        title: 'Error',
        message: "Payment amount must be greater than 0",
        color: 'red',
        position: 'top-right'
      });
      return;
    }

    if (totalPaymentAmount > selectedUser.balance) {
      notifications.show({
        title: 'Error',
        message: `Payment amount exceeds current balance of Rs. ${selectedUser.balance.toFixed(2)}`,
        color: 'red',
        position: 'top-right'
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Update the user's data in the uploadEntry collection
      const userDocRef = doc(db, 'uploadEntry', selectedUser.id);

      // Calculate new values based on the entered amounts
      const newBalance = selectedUser.balance - totalPaymentAmount;
      const isPaid = newBalance <= 0;

      await updateDoc(userDocRef, {
        balance: newBalance,
        isPaid: isPaid
      });

      // Create a payment record in a separate collection
      await addDoc(collection(db, 'payments'), {
        amount: totalPaymentAmount,
        date: new Date().toISOString(),
        isPaid: true,
        newBalance: newBalance,
        previousBalance: selectedUser.balance,
        method: paymentMethod,
        userId: selectedUser.id,
        userName: selectedUser.name,
        paidByName: loggedInUser, // Use the logged-in user's name
        paidByDateTime: new Date().toISOString() // Current date and time
      });

      // Update local state
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id
          ? { ...u, balance: newBalance, isPaid: isPaid }
          : u
      ));

      // Close the modal and reset state
      setIsTotalPaymentModalOpen(false);
      setTotalPaymentAmount(0);
      setTotalBalance(0);
      setTotalAmount(0);
      setSelectedUser(null);

      notifications.show({
        title: 'Calculate Payment Successful',
        message: `Successfully processed payment of Rs. ${totalPaymentAmount.toFixed(2)} for ${selectedUser.name}. New balance: Rs. ${newBalance.toFixed(2)}`,
        color: 'green',
        position: 'top-right'
      });

      // Refresh the user data to ensure the table updates correctly
      await fetchUsers();
    } catch (err) {
      notifications.show({
        title: 'Calculate Payment Failed',
        message: err instanceof Error ? err.message : 'Error processing payment. Try again.',
        color: 'red',
        position: 'top-right'
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle make payment 2
  const handleMakePayment2 = async () => {
    if (!selectedUser) {
      notifications.show({
        title: 'Error',
        message: "No user selected for payment",
        color: 'red',
        position: 'top-right'
      });
      return;
    }

    if (paymentAmount <= 0) {
      notifications.show({
        title: 'Error',
        message: "Payment amount must be greater than 0",
        color: 'red',
        position: 'top-right'
      });
      return;
    }

    if (paymentAmount > selectedUser.balance) {
      notifications.show({
        title: 'Error',
        message: `Payment amount exceeds current balance of Rs. ${selectedUser.balance.toFixed(2)}`,
        color: 'red',
        position: 'top-right'
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Update the user's balance in the uploadEntry collection
      const userDocRef = doc(db, 'uploadEntry', selectedUser.id);
      const newBalance = selectedUser.balance - paymentAmount;
      const isPaid = newBalance <= 0;

      await updateDoc(userDocRef, {
        balance: newBalance,
        isPaid: isPaid
      });

      // Create a payment record in a separate collection
      await addDoc(collection(db, 'payments'), {
        amount: paymentAmount,
        date: new Date().toISOString(),
        isPaid: true,
        newBalance: newBalance,
        previousBalance: selectedUser.balance,
        method: paymentMethod,
        userId: selectedUser.id,
        userName: selectedUser.name,
        paidByName: loggedInUser, // Use the logged-in user's name
        paidByDateTime: new Date().toISOString() // Current date and time
      });

      // Update local state
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id
          ? { ...u, balance: newBalance, isPaid: isPaid }
          : u
      ));

      // Close the modal and reset state
      setIsMakePaymentModalOpen(false);
      setPaymentAmount(0);
      setSelectedUser(null);

      notifications.show({
        title: 'Make Payment 2 Successful',
        message: `Successfully processed payment of Rs. ${paymentAmount.toFixed(2)} for ${selectedUser.name}. New balance: Rs. ${newBalance.toFixed(2)}`,
        color: 'green',
        position: 'top-right'
      });

      // Refresh the user data to ensure the table updates correctly
      await fetchUsers();
    } catch (err) {
      notifications.show({
        title: 'Make Payment 2 Failed',
        message: err instanceof Error ? err.message : 'Error processing payment. Try again.',
        color: 'red',
        position: 'top-right'
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle payment
  const handleMakePayment = async () => {
    if (!selectedUser) {
      notifications.show({
        title: 'Error',
        message: "No user selected for payment",
        color: 'red',
        position: 'top-right'
      });
      return;
    }

    if (paymentAmount <= 0) {
      notifications.show({
        title: 'Error',
        message: "Payment amount must be greater than 0",
        color: 'red',
        position: 'top-right'
      });
      return;
    }

    // For "Paid Payment", allow payment up to the total amount (balance + monthlyFees)
    if (paymentType === 'make' && paymentAmount > selectedUser.balance) {
      notifications.show({
        title: 'Error',
        message: `Payment amount exceeds current balance of Rs. ${selectedUser.balance.toFixed(2)}`,
        color: 'red',
        position: 'top-right'
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Update the user's balance in the uploadEntry collection
      const userDocRef = doc(db, 'uploadEntry', selectedUser.id);

      let newBalance = selectedUser.balance;
      let newMonthlyFees = selectedUser.monthlyFees || 0;
      let isPaid = false;

      if (paymentType === 'make') {
        // Regular payment reduces balance only
        newBalance = selectedUser.balance - paymentAmount;
        isPaid = newBalance <= 0 && newMonthlyFees <= 0;
      } else if (paymentType === 'paid') {
        // Paid payment reduces balance first, then monthly fees if balance is cleared
        if (paymentAmount <= selectedUser.balance) {
          // Payment only affects balance
          newBalance = selectedUser.balance - paymentAmount;
          newMonthlyFees = selectedUser.monthlyFees || 0;
        } else {
          // Payment exceeds balance, so apply remainder to monthly fees
          const excessPayment = paymentAmount - selectedUser.balance;
          newBalance = 0;
          newMonthlyFees = Math.max(0, (selectedUser.monthlyFees || 0) - excessPayment);
        }
        isPaid = newBalance <= 0 && newMonthlyFees <= 0;
      }

      await updateDoc(userDocRef, {
        balance: newBalance,
        monthlyFees: newMonthlyFees,
        isPaid: isPaid
      });

      // Create a payment record in a separate collection
      await addDoc(collection(db, 'payments'), {
        amount: paymentAmount,
        date: new Date().toISOString(),
        isPaid: true,
        newBalance: newBalance,
        newMonthlyFees: newMonthlyFees,
        previousBalance: selectedUser.balance,
        previousMonthlyFees: selectedUser.monthlyFees || 0,
        method: paymentMethod,
        userId: selectedUser.id,
        userName: selectedUser.name,
        paidByName: loggedInUser, // Use the logged-in user's name
        paidByDateTime: new Date().toISOString() // Current date and time
      });

      // Update local state
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id
          ? { ...u, balance: newBalance, monthlyFees: newMonthlyFees, isPaid: isPaid }
          : u
      ));

      // Close the modal and reset state
      setIsPaymentModalOpen(false);
      setPaymentAmount(0);
      setSelectedUser(null);

      notifications.show({
        title: 'Payment Successful',
        message: `Successfully processed ${paymentType === 'make' ? 'payment' : 'paid payment'} of Rs. ${paymentAmount.toFixed(2)} for ${selectedUser.name}. New balance: Rs. ${newBalance.toFixed(2)}, New monthly fees: Rs. ${newMonthlyFees.toFixed(2)}`,
        color: 'green',
        position: 'top-right'
      });

      // Refresh the user data to ensure the table updates correctly
      await fetchUsers();
    } catch (err) {
      notifications.show({
        title: 'Payment Failed',
        message: err instanceof Error ? err.message : 'Error processing payment. Try again.',
        color: 'red',
        position: 'top-right'
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Close payment modal
  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentAmount(0);
    setSelectedUser(null);
  };

  // Auto open print dialog when slip is ready
  React.useEffect(() => {
    if (slipData) {
      const t = setTimeout(() => {
        window.print();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [slipData]);

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteDoc(doc(db, 'uploadEntry', userToDelete.id));
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
      notifications.show({
        title: 'User removed',
        message: `${userToDelete.name} has been deleted.`,
        color: 'green',
        position: 'top-right'
      });
    } catch {
      notifications.show({
        title: 'Delete failed',
        message: 'Could not delete user. Try again.',
        color: 'red',
        position: 'top-right'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment slip - visible only when printing */}
      {slipData && (
        <div id="payment-slip-print" className="hidden print:block fixed inset-0 bg-white z-[9999] p-6" style={{ fontFamily: 'monospace' }}>
          <div className="max-w-xs border-2 border-gray-800 p-4">
            <div className="text-center text-sm font-bold border-b border-gray-400 pb-2 mb-2">PAYMENT SLIP</div>
            <div className="text-xs space-y-1">
              <div><span className="font-semibold">Payment Type:</span> {slipData.paymentType}</div>
              <div><span className="font-semibold">Paid By:</span> {slipData.paidByName}</div>
              <div><span className="font-semibold">Paid Date:</span> {slipData.paidDate}</div>
              <div><span className="font-semibold">Username:</span> {slipData.username}</div>
              <div><span className="font-semibold">Name:</span> {slipData.name}</div>
              <div><span className="font-semibold">Payable Amount:</span> Rs. {slipData.payableAmount.toFixed(2)}</div>
              <div><span className="font-semibold">Current Balance:</span> Rs. {slipData.currentBalance.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      <Paper radius="lg" withBorder className="p-4 sm:p-6 bg-white border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
          <div className="flex-1">
            <Text size="sm" className="mb-1 text-gray-600 font-medium">Search</Text>
            <TextInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, address..."
              size="md"
              radius="md"
              // leftSection={<IconSearch size={18} className="text-gray-400" />}
              rightSection={
                searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="text-gray-400 hover:text-gray-600 outline-none"
                  >
                    <IconX size={16} />
                  </button>
                )
              }
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:w-[400px]">
            <div>
              <Text size="sm" className="mb-1 text-gray-600 font-medium">Start Date</Text>
              <input
                type="date"
                value={dateRange[0] ? new Date(dateRange[0]).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const newStart = e.currentTarget.value ? new Date(e.currentTarget.value) : null;
                  setDateRange([newStart, dateRange[1]]);
                }}
                className="w-full h-[42px] px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className="w-full h-[42px] px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <Button
            onClick={() => setIsNewUserModalOpen(true)}
            size="md"
            radius="md"
            className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white shadow-sm transition-colors h-[42px]"
            leftSection={<IconPlus size={18} />}
          >
            Create User
          </Button>
        </div>
      </Paper>

      {/* Users Table */}
      <div>
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
          <div className="w-full flex-1 min-w-0">
            <div className="w-full flex flex-col md:flex-row md:items-center gap-2">
              <Text className="page-heading break-words">
                User Search Results
              </Text>
              <Badge color="blue" variant="light" className="text-xs px-3 py-1 flex-shrink-0 mt-1 md:mt-0">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
              </Badge>
            </div>
          </div>
          <Text className="text-sm text-gray-500 text-left md:text-right mt-1 md:mt-0 w-auto">
            Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </Text>
        </div>

        {/* Responsive table container */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-3">
          <Paper radius="lg" withBorder className="overflow-hidden border-gray-100 shadow-sm min-w-[1000px]">
            <Table verticalSpacing="md" horizontalSpacing="lg" className="min-w-full">
              <Table.Thead className="bg-gray-50/50">
                <Table.Tr>
                  <Table.Th className="text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200 min-w-[100px] sm:min-w-[120px]" style={{ fontSize: 'var(--text-sm)' }}>User ID</Table.Th>
                  <Table.Th className="text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200 min-w-[100px] sm:min-w-[120px]" style={{ fontSize: 'var(--text-sm)' }}>Name</Table.Th>
                  <Table.Th className="text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200 min-w-[100px] sm:min-w-[120px]" style={{ fontSize: 'var(--text-sm)' }}>Address</Table.Th>
                  <Table.Th className="text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200 min-w-[80px] sm:min-w-[100px]" style={{ fontSize: 'var(--text-sm)' }}>Package</Table.Th>
                  <Table.Th className="text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200 min-w-[80px] sm:min-w-[100px]" style={{ fontSize: 'var(--text-sm)' }}>Start Date</Table.Th>
                  <Table.Th className="text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200 min-w-[80px] sm:min-w-[100px]" style={{ fontSize: 'var(--text-sm)' }}>Total Payable Amount</Table.Th>
                  <Table.Th className="text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200 min-w-[60px] sm:min-w-[80px]" style={{ fontSize: 'var(--text-sm)' }}>Status</Table.Th>
                  <Table.Th className="text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200 min-w-[100px] sm:min-w-[120px]" style={{ fontSize: 'var(--text-sm)' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {isLoading ? (
                  <Table.Tr>
                    <Table.Td colSpan={8} className="text-center py-10">
                      <LoadingOverlay visible={true} overlayProps={{ radius: "sm", blur: 2 }} />
                      <Text className="text-center py-4">Loading users...</Text>
                    </Table.Td>
                  </Table.Tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <Table.Tr key={user.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-b-0">
                      <Table.Td className="font-semibold text-gray-700 py-2 px-2 sm:px-4 min-w-[100px] sm:min-w-[120px]">
                        {user.username}
                      </Table.Td>
                      <Table.Td className="py-2 px-2 sm:px-4 min-w-[100px] sm:min-w-[120px]">
                        {user.name}
                      </Table.Td>
                      <Table.Td className="py-2 px-2 sm:px-4 min-w-[100px] sm:min-w-[120px]">
                        {user.address}
                      </Table.Td>
                      <Table.Td className="py-2 px-2 sm:px-4 min-w-[80px] sm:min-w-[100px]">
                        {user.package || 'N/A'}
                      </Table.Td>
                      <Table.Td className="py-2 px-2 sm:px-4 min-w-[80px] sm:min-w-[100px]">
                        {user.startDate}
                      </Table.Td>
                      <Table.Td className="font-bold text-gray-800 py-2 px-2 sm:px-4 min-w-[80px] sm:min-w-[100px]">
                        Rs. {user.totalAmount.toFixed(2)}
                      </Table.Td>
                      <Table.Td className="py-2 px-2 sm:px-4 min-w-[60px] sm:min-w-[80px]">
                        <Badge
                          variant="light"
                          color={user.isPaid ? 'green' : 'orange'}
                          radius="sm"
                          className="font-bold py-2 px-3 text-xs"
                        >
                          {user.isPaid ? 'PAID' : 'UNPAID'}
                        </Badge>
                      </Table.Td>
                      <Table.Td className="py-2 px-2 sm:px-4 min-w-[100px] sm:min-w-[120px]">
                        <Menu shadow="md" width={200} position="bottom-end">
                          <Menu.Target>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="lg"
                              className="rounded-full hover:bg-gray-100 hover:text-[#00A5A8] transition-all duration-200"
                            >
                              <IconDotsVertical size={20} />
                            </ActionIcon>
                          </Menu.Target>

                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconPencil size={14} />}
                              onClick={() => handleEditClick(user)}
                            >
                              Edit User
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Label>Danger zone</Menu.Label>
                            <Menu.Item
                              color="red"
                              leftSection={<IconTrash size={14} />}
                              onClick={() => setUserToDelete(user)}
                            >
                              Delete User
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              leftSection={<IconCoin size={14} />}
                              onClick={() => {
                                setSelectedUser(user);
                                setIsPaidPaymentModalOpen(true);
                              }}
                            >
                              Paid Payment
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={8} className="text-center py-10 text-gray-500">
                      {searchTerm ? 'No users found matching your search' : 'No users available'}
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        opened={!!editingUser}
        onClose={closeEditModal}
        title={
          <Text className="flex items-center gap-2">
            <IconPencil className="text-blue-600" size={20} />
            Edit User: <span className="font-bold">{editingUser?.name || editingUser?.username}</span>
          </Text>
        }
        size="lg"
        centered
        radius="md"
        withCloseButton
        styles={{ close: { color: '#1e40af', scale: 1.2 } }}
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
                value={editingUser.username}
                disabled
                className="bg-gray-50"
              />
            </Input.Wrapper>

            <Input.Wrapper label="Name" description="Update the user's name">
              <Input
                placeholder="Enter user name"
                value={editForm.name || ''}
                onChange={(e) => handleInputChange('name', e.currentTarget.value)}
              />
            </Input.Wrapper>

            <Input.Wrapper label="Address" description="Update the user's address">
              <Input
                placeholder="Enter user address"
                value={editForm.address || ''}
                onChange={(e) => handleInputChange('address', e.currentTarget.value)}
              />
            </Input.Wrapper>

            <Input.Wrapper label="Package" description="Update the user's package">
              <Input
                placeholder="Enter package"
                value={editForm.package || ''}
                onChange={(e) => handleInputChange('package', e.currentTarget.value)}
              />
            </Input.Wrapper>

            <Input.Wrapper label="Phone" description="Update the user's phone number">
              <Input
                placeholder="Enter phone number"
                value={editForm.phone || ''}
                onChange={(e) => handleInputChange('phone', e.currentTarget.value)}
              />
            </Input.Wrapper>

            <Input.Wrapper label="Monthly Fees" description="Update the monthly fees">
              <Input
                placeholder="Enter monthly fees"
                type="number"
                value={editForm.monthlyFees !== undefined && editForm.monthlyFees !== null ? String(editForm.monthlyFees) : "0"}
                onChange={(e) => handleInputChange('monthlyFees', parseFloat(e.currentTarget.value) || 0)}
              />
            </Input.Wrapper>

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

      {/* New User Modal */}
      <Modal
        opened={isNewUserModalOpen}
        onClose={closeNewUserModal}
        title={
          <Text className="flex items-center gap-2">
            <IconPlus className="text-green-600" size={20} />
            Add New User
          </Text>
        }
        size="lg"
        overlayProps={{
          backgroundOpacity: 0.5,
          blur: 3,
        }}
      >
        <div className="space-y-5">
          <Input.Wrapper label="Username" description="Enter the user's username">
            <Input
              placeholder="Enter username"
              value={String(newUserForm.username || '')}
              onChange={(e) => handleNewUserInputChange('username', e.currentTarget.value)}
            />
          </Input.Wrapper>

          <Input.Wrapper label="Name" description="Enter the user's name">
            <Input
              placeholder="Enter user name"
              value={String(newUserForm.name || '')}
              onChange={(e) => handleNewUserInputChange('name', e.currentTarget.value)}
            />
          </Input.Wrapper>

          <Input.Wrapper label="Address" description="Enter the user's address">
            <Input
              placeholder="Enter user address"
              value={String(newUserForm.address || '')}
              onChange={(e) => handleNewUserInputChange('address', e.currentTarget.value)}
            />
          </Input.Wrapper>

          <Input.Wrapper label="Package" description="Enter the user's package">
            <Input
              placeholder="Enter package"
              value={String(newUserForm.package || '')}
              onChange={(e) => handleNewUserInputChange('package', e.currentTarget.value)}
            />
          </Input.Wrapper>

          <Input.Wrapper label="Phone" description="Enter the user's phone number">
            <Input
              placeholder="Enter phone number"
              value={String(newUserForm.phone || '')}
              onChange={(e) => handleNewUserInputChange('phone', e.currentTarget.value)}
            />
          </Input.Wrapper>

          <Input.Wrapper label="Start Date" description="Select the start date">
            <Input
              type="date"
              value={String(newUserForm.startDate || '')}
              onChange={(e) => handleNewUserInputChange('startDate', e.currentTarget.value)}
            />
          </Input.Wrapper>

          <Input.Wrapper label="Total Amount" description="Enter the total amount">
            <Input
              placeholder="Enter total amount"
              type="number"
              value={newUserForm.totalAmount !== undefined && newUserForm.totalAmount !== null ? String(newUserForm.totalAmount) : ""}
              onChange={(e) => handleNewUserInputChange('totalAmount', parseFloat(e.currentTarget.value) || 0)}
            />
          </Input.Wrapper>

          <Input.Wrapper label="Balance" description="Enter the balance">
            <Input
              placeholder="Enter balance"
              type="number"
              value={newUserForm.balance !== undefined && newUserForm.balance !== null ? String(newUserForm.balance) : ""}
              onChange={(e) => handleNewUserInputChange('balance', parseFloat(e.currentTarget.value) || 0)}
            />
          </Input.Wrapper>

          <Input.Wrapper label="Monthly Fees" description="Enter the monthly fees">
            <Input
              placeholder="Enter monthly fees"
              type="number"
              value={newUserForm.monthlyFees !== undefined && newUserForm.monthlyFees !== null ? String(newUserForm.monthlyFees) : ""}
              onChange={(e) => handleNewUserInputChange('monthlyFees', parseFloat(e.currentTarget.value) || 0)}
            />
          </Input.Wrapper>

          <Divider my="sm" />

          <Group justify="right" mt="md">
            <Button variant="outline" onClick={closeNewUserModal} color="gray" className="border-gray-300">
              Cancel
            </Button>
            <Button
              onClick={handleSaveNewUser}
              className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white shadow-md"
            >
              Add User
            </Button>
          </Group>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        opened={isPaymentModalOpen}
        onClose={closePaymentModal}
        title={
          <Text className="flex items-center gap-2">
            <IconCoin className="text-green-600" size={20} />
            {paymentType === 'make' ? 'Make Payment for:' : 'Paid Payment for:'} <span className="font-bold">{selectedUser?.name || selectedUser?.username}</span>
          </Text>
        }
        size="lg"
        overlayProps={{
          backgroundOpacity: 0.5,
          blur: 3,
        }}
      >
        {selectedUser && (
          <div className="space-y-5">
            <div>
              <Text size="sm" className="text-gray-600">Current Balance:</Text>
              <Text className="text-xl font-bold text-gray-800">Rs. {selectedUser.balance.toFixed(2)}</Text>
            </div>

            <Input.Wrapper label="Payment Amount" description="Enter the payment amount">
              <Input
                placeholder="Enter payment amount"
                type="number"
                value={paymentAmount || ""}
                onChange={(e) => setPaymentAmount(parseFloat(e.currentTarget.value) || 0)}
              />
            </Input.Wrapper>

            <Select
              label="Payment Method"
              description="Choose the payment method"
              placeholder="Select payment method"
              value={paymentMethod}
              onChange={(value) => value && setPaymentMethod(value)}
              data={[
                { value: 'cash', label: 'Cash' },
                { value: 'bank', label: 'Bank Transfer' },
                { value: 'mobile', label: 'Mobile Payment' },
              ]}
              leftSection={<IconCoin size={16} />}
            />

            <Divider my="sm" />

            <Group justify="right" mt="md">
              <Button variant="outline" onClick={closePaymentModal} color="gray" className="border-gray-300">
                Cancel
              </Button>
              <Button
                onClick={handleMakePayment}
                loading={isProcessingPayment}
                className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white shadow-md"
              >
                Process Payment
              </Button>
            </Group>
          </div>
        )}
      </Modal>

      {/* Make Payment 2 Modal */}
      <Modal
        opened={isMakePaymentModalOpen}
        onClose={() => {
          setIsMakePaymentModalOpen(false);
          setPaymentAmount(0);
          setSelectedUser(null);
        }}
        title={
          <Text className="flex items-center gap-2">
            <IconCoin className="text-blue-600" size={20} />
            Make Payment for: <span className="font-bold">{selectedUser?.name || selectedUser?.username}</span>
          </Text>
        }
        size="lg"
        centered
        radius="md"
        withCloseButton
        styles={{ close: { color: '#1e40af', scale: 1.2 } }}
        overlayProps={{
          backgroundOpacity: 0.5,
          blur: 3,
        }}
      >
        {selectedUser && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text size="sm" className="text-gray-600">Current Balance:</Text>
                <Text className="text-xl font-bold text-gray-800">Rs. {selectedUser.balance.toFixed(2)}</Text>
              </div>
              <div>
                <Text size="sm" className="text-gray-600">Monthly Fees:</Text>
                <Text className="text-xl font-bold text-gray-800">Rs. {(selectedUser.monthlyFees || 0).toFixed(2)}</Text>
              </div>
              <div>
                <Text size="sm" className="text-gray-600">Total Amount:</Text>
                <Text className="text-xl font-bold text-gray-800">Rs. {selectedUser.totalAmount.toFixed(2)}</Text>
              </div>
            </div>

            <Input.Wrapper label="Payment Amount" description="Enter the payment amount">
              <Input
                placeholder="Enter payment amount"
                type="number"
                value={paymentAmount || ""}
                onChange={(e) => setPaymentAmount(parseFloat(e.currentTarget.value) || 0)}
              />
            </Input.Wrapper>

            <Select
              label="Payment Method"
              description="Choose the payment method"
              placeholder="Select payment method"
              value={paymentMethod}
              onChange={(value) => value && setPaymentMethod(value)}
              data={[
                { value: 'cash', label: 'Cash' },
                { value: 'bank', label: 'Bank Transfer' },
                { value: 'mobile', label: 'Mobile Payment' },
              ]}
              leftSection={<IconCoin size={16} />}
            />

            <Divider my="sm" />

            <Group justify="right" mt="md">
              <Button variant="outline" onClick={() => {
                setIsMakePaymentModalOpen(false);
                setPaymentAmount(0);
                setSelectedUser(null);
              }} color="gray" className="border-gray-300">
                Cancel
              </Button>
              <Button
                onClick={handleMakePayment2}
                loading={isProcessingPayment}
                className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white shadow-md"
              >
                Process Payment
              </Button>
            </Group>
          </div>
        )}
      </Modal>

      {/* Calculate Payment Modal */}
      <Modal
        opened={isTotalPaymentModalOpen}
        onClose={() => {
          setIsTotalPaymentModalOpen(false);
          setTotalPaymentAmount(0);
          setTotalBalance(0);
          setTotalAmount(0);
          setSelectedUser(null);
        }}
        title={
          <Text className="flex items-center gap-2">
            <IconCoin className="text-green-600" size={20} />
            Calculate Payment for: <span className="font-bold">{selectedUser?.name || selectedUser?.username}</span>
          </Text>
        }
        size="lg"
        centered
        radius="md"
        withCloseButton
        styles={{ close: { color: '#1e40af', scale: 1.2 } }}
        overlayProps={{
          backgroundOpacity: 0.5,
          blur: 3,
        }}
      >
        {selectedUser && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text size="sm" className="text-gray-600">Current Balance:</Text>
                <Text className="text-xl font-bold text-gray-800">Rs. {selectedUser.balance.toFixed(2)}</Text>
              </div>
              <div>
                <Text size="sm" className="text-gray-600">Monthly Fees:</Text>
                <Text className="text-xl font-bold text-gray-800">Rs. {(selectedUser.monthlyFees || 0).toFixed(2)}</Text>
              </div>
              <div>
                <Text size="sm" className="text-gray-600">Total Amount:</Text>
                <Text className="text-xl font-bold text-gray-800">Rs. {selectedUser.totalAmount.toFixed(2)}</Text>
              </div>
            </div>

            <Input.Wrapper label="Payment Amount" description="Enter the payment amount">
              <Input
                placeholder="Enter payment amount"
                type="number"
                value={totalPaymentAmount || ""}
                onChange={(e) => {
                  const payment = parseFloat(e.currentTarget.value) || 0;
                  setTotalPaymentAmount(payment);

                  // Calculate new balance based on current balance minus payment
                  const newCalculatedBalance = selectedUser.balance - payment;
                  setTotalBalance(Math.max(0, newCalculatedBalance)); // Ensure balance doesn't go negative
                }}
              />
            </Input.Wrapper>

            <Input.Wrapper label="New Balance" description="Calculated balance after payment">
              <Input
                placeholder="Calculated balance"
                type="number"
                value={totalBalance || ""}
                onChange={(e) => setTotalBalance(parseFloat(e.currentTarget.value) || 0)}
                readOnly
              />
            </Input.Wrapper>

            <Select
              label="Payment Method"
              description="Choose the payment method"
              placeholder="Select payment method"
              value={paymentMethod}
              onChange={(value) => value && setPaymentMethod(value)}
              data={[
                { value: 'cash', label: 'Cash' },
                { value: 'bank', label: 'Bank Transfer' },
                { value: 'mobile', label: 'Mobile Payment' },
              ]}
              leftSection={<IconCoin size={16} />}
            />

            <Divider my="sm" />

            <Group justify="right" mt="md">
              <Button variant="outline" onClick={() => {
                setIsTotalPaymentModalOpen(false);
                setTotalPaymentAmount(0);
                setTotalBalance(0);
                setTotalAmount(0);
                setSelectedUser(null);
              }} color="gray" className="border-gray-300">
                Cancel
              </Button>
              <Button
                onClick={handleTotalPayment}
                loading={isProcessingPayment}
                className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white shadow-md"
              >
                Process Payment
              </Button>
            </Group>
          </div>
        )}
      </Modal>

      {/* Paid Payment Modal */}
      <Modal
        opened={isPaidPaymentModalOpen}
        onClose={() => {
          setIsPaidPaymentModalOpen(false);
          setPaidPaymentAmount(0);
          setSelectedUser(null);
        }}
        title={
          <Text className="flex items-center gap-2">
            <IconCoin className="text-green-600" size={20} />
            Paid Payment for: <span className="font-bold">{selectedUser?.name || selectedUser?.username}</span>
          </Text>
        }
        size="lg"
        overlayProps={{
          backgroundOpacity: 0.5,
          blur: 3,
        }}
      >
        {selectedUser && (
          <div className="space-y-5">
            <div>
              <Text size="sm" className="text-gray-600">Total Payable:</Text>
              <Text className="text-xl font-bold text-gray-800">Rs. {(selectedUser.balance + (selectedUser.monthlyFees || 0)).toFixed(2)}</Text>
            </div>

            <Input.Wrapper label="Paid Payment Amount" description="Enter the paid payment amount">
              <Input
                placeholder="Enter paid payment amount"
                type="number"
                value={paidPaymentAmount || ""}
                onChange={(e) => setPaidPaymentAmount(parseFloat(e.currentTarget.value) || 0)}
              />
            </Input.Wrapper>

            <Select
              label="Payment Method"
              description="Choose the payment method"
              placeholder="Select payment method"
              value={paymentMethod}
              onChange={(value) => value && setPaymentMethod(value)}
              data={[
                { value: 'cash', label: 'Cash' },
                { value: 'bank', label: 'Bank Transfer' },
                { value: 'mobile', label: 'Mobile Payment' },
              ]}
              leftSection={<IconCoin size={16} />}
            />

            <Divider my="sm" />

            <Group justify="right" mt="md">
              <Button variant="outline" onClick={() => {
                setIsPaidPaymentModalOpen(false);
                setPaidPaymentAmount(0);
                setSelectedUser(null);
              }} color="gray" className="border-gray-300">
                Cancel
              </Button>
              <Button
                onClick={handlePaidPayment}
                loading={isProcessingPayment}
                className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white shadow-md"
              >
                Process Paid Payment
              </Button>
            </Group>
          </div>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        opened={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Delete user"
      >
        {userToDelete && (
          <>
            <Text size="sm" className="text-gray-600 mb-4">
              Are you sure you want to delete {userToDelete.name}? This cannot be undone.
            </Text>
            <Group justify="flex-end">
              <Button variant="outline" color="gray" onClick={() => setUserToDelete(null)}>Cancel</Button>
              <Button color="red" onClick={handleConfirmDelete}>Delete</Button>
            </Group>
          </>
        )}
      </Modal>
    </div>
  );
}