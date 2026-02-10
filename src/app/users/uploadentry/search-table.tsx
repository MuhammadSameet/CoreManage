'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextInput, Card, Text, Badge, LoadingOverlay, Table, Paper, ActionIcon, Modal, Input, Group, Divider, Menu, Select } from '@mantine/core';
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
  const [isPaidPaymentModalOpen, setIsPaidPaymentModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paidPaymentAmount, setPaidPaymentAmount] = useState<number>(0);
  const [balanceAmount, setBalanceAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [authUser, setAuthUser] = useState<any>(null); // Store authenticated user info

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
  const [loggedInUser, setLoggedInUser] = useState<string>('System User');

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
        } catch (error) {
          console.error("Error fetching logged in user data:", error);
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
        // Debug: Log the data to understand the structure
        console.log("User data:", data);

        // Calculate totalAmount and balance based on your data structure
        // More comprehensive attempt to get the balance value from various possible field names
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
        // A user is considered paid only when their balance reaches exactly 0 (full payment made)
        // Calculate the original total amount owed (before any payments)
        const originalTotalAmount = totalAmount > 0 ? totalAmount : (balance + monthlyFees);
        const calculatedIsPaid = data.isPaid !== undefined ? data.isPaid : data.IsPaid !== undefined ? data.IsPaid : (balance <= 0 && originalTotalAmount > 0);

        usersData.push({
          id: doc.id,
          name: data.name || data.Name || data.username || data.Username || 'N/A',
          username: data.Username || data.username || data.name || 'N/A', // CSV username as user ID
          address: data.address || data.Address || data.location || data.Location || '',
          startDate: data.StartDate || data.startDate || data.Date || 'N/A',
          totalAmount: totalAmount,
          balance: balance,
          isPaid: data.isPaid !== undefined ? data.isPaid : data.IsPaid !== undefined ? data.IsPaid : (balance <= 0), // User is paid when balance is cleared
          monthlyFees: monthlyFees,
          totalPayment: totalPayment, // Total payment (remaining balance)
          package: data.package || data.Package || '',
          phone: data.phone || data.Phone || data.mobile || '',
          ...data
        });
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.totalAmount.toString().includes(searchTerm.toLowerCase()) ||
      user.balance.toString().includes(searchTerm.toLowerCase()) ||
      user.totalPayment.toString().includes(searchTerm.toLowerCase()) ||
      String(user.monthlyFees).includes(searchTerm.toLowerCase()) ||
      user.startDate.toLowerCase().includes(searchTerm.toLowerCase())
    );
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

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!editingUser) return;

    try {
      const docRef = doc(db, 'uploadEntry', editingUser.id);

      // Prepare update object - only allow updating editable fields
      const updateData: Partial<User> = {
        name: editForm.name,
        address: editForm.address,
        monthlyFees: editForm.monthlyFees,
        package: editForm.package,
        phone: editForm.phone,
      };

      await updateDoc(docRef, updateData);

      // Update local state
      setUsers(prev => prev.map(u =>
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
    } catch (error) {
      console.error("Error adding new user: ", error);
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

  // Handle payment
  const handleMakePayment = async () => {
    console.log("handleMakePayment called", {
      selectedUser,
      paymentAmount,
      paymentMethod,
      isProcessingPayment
    });

    // Check validation before proceeding
    if (isProcessingPayment) {
      console.log("Payment already in progress");
      notifications.show({
        title: 'Processing...',
        message: "Please wait, payment is being processed",
        color: 'blue',
        position: 'top-right'
      });
      return;
    }

    if (!selectedUser) {
      console.log("No user selected for payment");
      notifications.show({
        title: 'Error',
        message: "No user selected for payment",
        color: 'red',
        position: 'top-right'
      });
      return;
    }

    if (paymentAmount <= 0) {
      console.log("Payment amount must be greater than 0");
      notifications.show({
        title: 'Error',
        message: "Payment amount must be greater than 0",
        color: 'red',
        position: 'top-right'
      });
      return;
    }

    if (paymentAmount > selectedUser.balance) {
      console.log("Payment amount exceeds current balance");
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
      console.log("Starting payment processing...");

      // Update the user's balance in the uploadEntry collection
      const userDocRef = doc(db, 'uploadEntry', selectedUser.id);
      const newBalance = selectedUser.balance - paymentAmount;
      // Calculate if the user is fully paid based on the remaining balance
      // isPaid should only be true when the total payable amount (balance + monthlyFees) reaches exactly 0 (full payment made)
      const totalRemaining = newBalance + selectedUser.monthlyFees;
      const isPaid = totalRemaining <= 0;

      console.log("Updating user balance...", {
        userId: selectedUser.id,
        newBalance,
        isPaid
      });

      await updateDoc(userDocRef, {
        balance: newBalance,
        monthlyFees: selectedUser.monthlyFees, // Keep monthly fees unchanged for partial payments
        isPaid: isPaid
      });

      console.log("User balance updated in Firestore");

      // Create a payment record in a separate collection with the required structure
      console.log("Creating payment record...");
      await addDoc(collection(db, 'payments'), {
        amount: paymentAmount,
        date: new Date().toISOString(),
        isPaid: true, // For any payment made, set isPaid to true in the payment record
        newBalance: newBalance,
        newMonthlyFees: selectedUser.monthlyFees, // Monthly fees remain unchanged for partial payments
        previousBalance: selectedUser.balance,
        previousMonthlyFees: selectedUser.monthlyFees,
        method: paymentMethod,
        userId: selectedUser.id,
        userName: selectedUser.name,
        paidByName: loggedInUser, // Use the logged-in user's name
        paidByDateTime: new Date().toISOString(),
        balanceAfterPayment: newBalance
      });

      console.log("Payment record created in Firestore");

      // Update local state
      console.log("Updating local state...");
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id
          ? { ...u, balance: newBalance, isPaid: isPaid }
          : u
      ));

      console.log("Local state updated");

      // Close the modal and reset state
      console.log("Payment processed successfully, closing modal");
      setIsPaymentModalOpen(false);
      setPaymentAmount(0);
      // Update the selectedUser state to reflect the new balance
      setSelectedUser(prev => prev ? { ...prev, balance: newBalance, isPaid: isPaid } : null);

      notifications.show({
        title: 'Payment Successful',
        message: `Successfully processed payment of Rs. ${paymentAmount.toFixed(2)} for ${selectedUser.name}. New balance: Rs. ${newBalance.toFixed(2)}`,
        color: 'green',
        position: 'top-right'
      });

      // Refresh the user data to ensure the table updates correctly
      await fetchUsers();
    } catch (error) {
      console.error("Error processing payment: ", error);
      notifications.show({
        title: 'Payment Failed',
        message: "Error processing payment: " + (error instanceof Error ? error.message : "Unknown error"),
        color: 'red',
        position: 'top-right'
      });
    } finally {
      console.log("Setting isProcessingPayment to false");
      setIsProcessingPayment(false);
    }
  };

  // Process payment directly
  const processPayment = async (user: User, paymentAmount: number, method: string) => {
    try {
      // Update the user's balance in the uploadEntry collection
      const userDocRef = doc(db, 'uploadEntry', user.id);
      const newBalance = user.balance - paymentAmount;
      // Calculate if the user is fully paid based on the remaining balance
      // isPaid should only be true when the total payable amount (balance + monthlyFees) reaches exactly 0 (full payment made)
      const totalRemaining = newBalance + user.monthlyFees;
      const isPaid = totalRemaining <= 0;

      await updateDoc(userDocRef, {
        balance: newBalance,
        monthlyFees: user.monthlyFees, // Keep monthly fees unchanged for partial payments
        isPaid: isPaid
      });

      // Create a payment record in a separate collection
      await addDoc(collection(db, 'payments'), {
        userId: user.id,
        userName: user.name,
        amount: paymentAmount,
        method: method, // Use the selected payment method
        date: new Date().toISOString(),
        previousBalance: user.balance,
        newBalance: newBalance,
        isPaid: true // For any payment made, set isPaid to true in the payment record
      });

      // Update local state
      setUsers(prev => prev.map(u =>
        u.id === user.id
          ? { ...u, balance: newBalance, isPaid: isPaid }
          : u
      ));

      // Show success notification
      notifications.show({
        title: 'Payment Successful!',
        message: `Successfully processed payment of Rs. ${paymentAmount.toFixed(2)} for ${user.name}. New balance: Rs. ${newBalance.toFixed(2)}`,
        color: 'green',
        position: 'top-right'
      });

      // Refresh the user data to ensure the table updates correctly
      await fetchUsers();
    } catch (error) {
      console.error("Error processing payment: ", error);
      notifications.show({
        title: 'Payment Failed',
        message: "Error processing payment: " + (error instanceof Error ? error.message : "Unknown error"),
        color: 'red',
        position: 'top-right'
      });
    }
  };

  // Close payment modal
  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentAmount(0);
    setSelectedUser(null);
  };

  // Handle paid payment submission
  const handlePaidPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    if (!selectedUser) {
      notifications.show({
        title: 'Error',
        message: 'No user selected for payment',
        color: 'red',
        position: 'top-right'
      });
      return;
    }

    // Calculate the total payable amount (balance + monthly fees)
    const totalPayableAmount = selectedUser.balance + selectedUser.monthlyFees;

    // Validate that paid amount doesn't exceed total amount
    if (paidPaymentAmount > totalPayableAmount) {
      notifications.show({
        title: 'Error',
        message: `Paid amount cannot exceed the total payable amount of Rs. ${totalPayableAmount.toFixed(2)}`,
        color: 'red',
        position: 'top-right'
      });
      return;
    }

    if (paidPaymentAmount <= 0) {
      notifications.show({
        title: 'Error',
        message: 'Paid amount must be greater than 0',
        color: 'red',
        position: 'top-right'
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Calculate the new balance after payment
      // The balance should be reduced by the payment amount
      let newBalance = selectedUser.balance - paidPaymentAmount;
      let newMonthlyFees = selectedUser.monthlyFees;

      // If the payment exceeds the current balance, apply the excess to monthly fees
      if (newBalance < 0) {
        const excessPayment = Math.abs(newBalance);
        newMonthlyFees = selectedUser.monthlyFees - excessPayment;
        newBalance = 0; // Balance is cleared when it goes negative
      }

      // Calculate if the user is fully paid based on the remaining balance
      // isPaid should only be true when the total payable amount (balance + monthlyFees) reaches exactly 0 (full payment made)
      const totalRemaining = newBalance + newMonthlyFees;
      const isPaid = totalRemaining <= 0;

      // Update the user's balance and monthly fees in the uploadEntry collection
      const userDocRef = doc(db, 'uploadEntry', selectedUser.id);
      await updateDoc(userDocRef, {
        balance: newBalance,
        monthlyFees: newMonthlyFees,
        isPaid: isPaid
      });

      // Create a payment record in a separate collection with the required structure
      await addDoc(collection(db, 'payments'), {
        amount: paidPaymentAmount,
        date: new Date().toISOString(),
        isPaid: true, // For paid payments, always set isPaid to true regardless of amount
        newBalance: newBalance,
        newMonthlyFees: newMonthlyFees,
        previousBalance: selectedUser.balance,
        previousMonthlyFees: selectedUser.monthlyFees,
        method: 'cash', // Default to cash for paid payments
        userId: selectedUser.id,
        userName: selectedUser.name,
        paidByName: loggedInUser, // Use the logged-in user's name
        paidByDateTime: new Date().toISOString(),
        balanceAfterPayment: newBalance
      });

      // Update local state
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id
          ? { ...u, balance: newBalance, monthlyFees: newMonthlyFees, isPaid: isPaid }
          : u
      ));

      // Close the modal and reset state
      setIsPaidPaymentModalOpen(false);
      setPaidPaymentAmount(0);
      setBalanceAmount(0);
      setSelectedUser(null);

      notifications.show({
        title: 'Payment Successful',
        message: `Successfully processed payment of Rs. ${paidPaymentAmount.toFixed(2)} for ${selectedUser.name}. New balance: Rs. ${newBalance.toFixed(2)}, New monthly fees: Rs. ${newMonthlyFees.toFixed(2)}`,
        color: 'green',
        position: 'top-right'
      });

      // Refresh the user data to ensure the table updates correctly
      await fetchUsers();
    } catch (error) {
      console.error("Error processing paid payment: ", error);
      notifications.show({
        title: 'Payment Failed',
        message: "Error processing payment: " + (error instanceof Error ? error.message : "Unknown error"),
        color: 'red',
        position: 'top-right'
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle paid amount change and calculate balance
  const handlePaidAmountChange = (amount: number) => {
    setPaidPaymentAmount(amount);
    if (selectedUser) {
      // Calculate the remaining balance after payment
      // If the payment exceeds the current balance, apply the excess to monthly fees
      let newBalance = selectedUser.balance - amount;
      let newMonthlyFees = selectedUser.monthlyFees;

      // If the payment exceeds the balance, apply the excess to monthly fees
      if (newBalance < 0) {
        const excessPayment = Math.abs(newBalance);
        newMonthlyFees = selectedUser.monthlyFees - excessPayment;
        newBalance = 0; // Balance is cleared when it goes negative
      }

      // The final balance amount shown in the form should be the sum of remaining balance and monthly fees
      const calculatedBalance = newBalance + newMonthlyFees;
      setBalanceAmount(calculatedBalance < 0 ? 0 : calculatedBalance);
    }
  };

  // Open paid payment modal
  const openPaidPaymentModal = (user: User) => {
    setSelectedUser(user);
    setPaidPaymentAmount(0);
    setBalanceAmount(user.balance + user.monthlyFees);
    setIsPaidPaymentModalOpen(true);
  };

  // Close paid payment modal
  const closePaidPaymentModal = () => {
    setIsPaidPaymentModalOpen(false);
    setPaidPaymentAmount(0);
    setBalanceAmount(0);
    setSelectedUser(null);
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete the user document from Firebase
      await deleteDoc(doc(db, 'uploadEntry', userId));

      // Update local state
      setUsers(prev => prev.filter(u => u.id !== userId));

      notifications.show({
        title: 'User Deleted',
        message: 'User has been successfully deleted',
        color: 'red',
        position: 'top-right'
      });
    } catch (error) {
      console.error("Error deleting user: ", error);
      notifications.show({
        title: 'Deletion Failed',
        message: "Error deleting user: " + (error instanceof Error ? error.message : "Unknown error"),
        color: 'red',
        position: 'top-right'
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Search Bar */}
        <Paper radius="lg" withBorder className="p-6 bg-white border-gray-200 shadow-md">
          <div className="flex flex-col space-y-4">
            <div>
              <TextInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, username, address, amount, balance, or date..."
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

            <div className="flex justify-between items-center">
              <Text className="text-xl font-bold text-gray-800">
                Users ({filteredUsers.length})
              </Text>
              <Button
                onClick={() => setIsNewUserModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white flex items-center justify-center gap-2"
                leftSection={<IconPlus size={18} />}
              >
                Add User
              </Button>
            </div>
          </div>
        </Paper>

        {/* Users Table */}
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
          <div className="w-full flex-1 min-w-0">
            <div className="w-full flex flex-col md:flex-row md:items-center gap-2">
              <Text className="text-xl font-bold text-gray-800 break-words">
                User List
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
        <div className="overflow-x-auto">
          {/* Desktop/Tablet view - Table */}
          <div className="hidden md:block">
            <Paper radius="md" withBorder className="overflow-hidden border-gray-100 shadow-sm">
              <Table verticalSpacing="sm" horizontalSpacing="lg" className="min-w-full">
                <Table.Thead className="bg-gray-50/50">
                  <Table.Tr>
                    <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[100px] sm:min-w-[120px]">User ID</Table.Th>
                    <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[100px] sm:min-w-[120px]">Name</Table.Th>
                    <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[100px] sm:min-w-[120px]">Address</Table.Th>
                    <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[80px] sm:min-w-[100px]">Package</Table.Th>
                    <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[80px] sm:min-w-[100px]">Phone</Table.Th>
                    <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[80px] sm:min-w-[100px]">Start Date</Table.Th>
                    <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[100px] sm:min-w-[120px]">Total Amount</Table.Th>
                    <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[100px] sm:min-w-[120px]">Balance</Table.Th>
                    <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[80px] sm:min-w-[100px]">Monthly Fees</Table.Th>
                    <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[60px] sm:min-w-[80px]">Status</Table.Th>
                    <Table.Th className="text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-200 py-2 min-w-[120px] sm:min-w-[140px]">Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {isLoading ? (
                    <Table.Tr>
                      <Table.Td colSpan={11} className="text-center py-10">
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
                          {user.package}
                        </Table.Td>
                        <Table.Td className="py-2 px-2 sm:px-4 min-w-[80px] sm:min-w-[100px]">
                          {user.phone}
                        </Table.Td>
                        <Table.Td className="py-2 px-2 sm:px-4 min-w-[80px] sm:min-w-[100px]">
                          {user.startDate}
                        </Table.Td>
                        <Table.Td className="font-bold text-gray-800 py-2 px-2 sm:px-4 min-w-[100px] sm:min-w-[120px]">
                          Rs. {user.totalAmount.toFixed(2)}
                        </Table.Td>
                        <Table.Td className="font-bold text-gray-800 py-2 px-2 sm:px-4 min-w-[100px] sm:min-w-[120px]">
                          Rs. {user.balance.toFixed(2)}
                        </Table.Td>
                        <Table.Td className="font-bold text-gray-800 py-2 px-2 sm:px-4 min-w-[80px] sm:min-w-[100px]">
                          Rs. {user.monthlyFees.toFixed(2)}
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
                        <Table.Td className="py-2 px-2 sm:px-4 min-w-[120px] sm:min-w-[140px]">
                          <div className="flex gap-2">
                            <Menu shadow="md" width={200}>
                              <Menu.Target>
                                <ActionIcon variant="subtle" color="gray" size="sm">
                                  <IconDotsVertical size={16} />
                                </ActionIcon>
                              </Menu.Target>

                              <Menu.Dropdown>
                                <Menu.Item
                                  leftSection={<IconPencil size={14} />}
                                  onClick={() => handleEditClick(user)}
                                >
                                  Edit
                                </Menu.Item>
                                <Menu.Item
                                  leftSection={<IconCoin size={14} />}
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsPaymentModalOpen(true);
                                  }}
                                >
                                  Make Payment
                                </Menu.Item>
                                <Menu.Item
                                  leftSection={<IconCoin size={14} />}
                                  onClick={() => openPaidPaymentModal(user)}
                                >
                                  Full Payment
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                  leftSection={<IconTrash size={14} />}
                                  color="red"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  Delete
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </div>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={11} className="text-center py-10 text-gray-500">
                        {searchTerm ? 'No users found matching your search' : 'No users available'}
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
                <Text className="text-center py-4">Loading users...</Text>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <Paper key={user.id} radius="md" withBorder className="p-4 border-gray-100 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Text size="xs" className="text-gray-500">User ID:</Text>
                        <Text className="font-semibold text-gray-700">{user.username}</Text>
                      </div>
                      <div>
                        <Text size="xs" className="text-gray-500">Name:</Text>
                        <Text className="text-gray-700">{user.name}</Text>
                      </div>
                      <div>
                        <Text size="xs" className="text-gray-500">Address:</Text>
                        <Text className="text-gray-700">{user.address}</Text>
                      </div>
                      <div>
                        <Text size="xs" className="text-gray-500">Package:</Text>
                        <Text className="text-gray-700">{user.package}</Text>
                      </div>
                      <div>
                        <Text size="xs" className="text-gray-500">Phone:</Text>
                        <Text className="text-gray-700">{user.phone}</Text>
                      </div>
                      <div>
                        <Text size="xs" className="text-gray-500">Start Date:</Text>
                        <Text className="text-gray-700">{user.startDate}</Text>
                      </div>
                      <div>
                        <Text size="xs" className="text-gray-500">Total Amount:</Text>
                        <Text className="font-bold text-gray-800">Rs. {user.totalAmount.toFixed(2)}</Text>
                      </div>
                      <div>
                        <Text size="xs" className="text-gray-500">Balance:</Text>
                        <Text className="font-bold text-gray-800">Rs. {user.balance.toFixed(2)}</Text>
                      </div>
                      <div>
                        <Text size="xs" className="text-gray-500">Monthly Fees:</Text>
                        <Text className="font-bold text-gray-800">Rs. {user.monthlyFees.toFixed(2)}</Text>
                      </div>
                      <div>
                        <Text size="xs" className="text-gray-500">Status:</Text>
                        <Badge
                          variant="light"
                          color={user.isPaid ? 'green' : 'orange'}
                          radius="sm"
                          className="font-bold py-1 px-2 text-xs mt-1"
                        >
                          {user.isPaid ? 'PAID' : 'UNPAID'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <div className="flex justify-between">
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <Button variant="subtle" color="gray" size="sm">
                              Actions
                            </Button>
                          </Menu.Target>

                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconPencil size={14} />}
                              onClick={() => handleEditClick(user)}
                            >
                              Edit
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconCoin size={14} />}
                              onClick={() => {
                                setSelectedUser(user);
                                setIsPaymentModalOpen(true);
                              }}
                            >
                              Make Payment
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconCoin size={14} />}
                              onClick={() => openPaidPaymentModal(user)}
                            >
                              Full Payment
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </div>
                    </div>
                  </Paper>
                ))}
              </div>
            ) : (
              <Paper radius="md" withBorder className="p-6 text-center text-gray-500 border-gray-100 shadow-sm">
                {searchTerm ? 'No users found matching your search' : 'No users available'}
              </Paper>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          opened={!!editingUser}
          onClose={closeEditModal}
          title={
            <Text className="flex items-center gap-2">
              <IconPencil className="text-blue-600" size={20} />
              Edit User: <span className="font-bold">{editingUser?.name}</span>
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
              <Input.Wrapper label="Username" description="This cannot be modified">
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
                  placeholder="Enter user package"
                  value={editForm.package || ''}
                  onChange={(e) => handleInputChange('package', e.currentTarget.value)}
                />
              </Input.Wrapper>

              <Input.Wrapper label="Phone" description="Update the user's phone number">
                <Input
                  placeholder="Enter user phone number"
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
                placeholder="Enter user package"
                value={String(newUserForm.package || '')}
                onChange={(e) => handleNewUserInputChange('package', e.currentTarget.value)}
              />
            </Input.Wrapper>

            <Input.Wrapper label="Phone" description="Enter the user's phone number">
              <Input
                placeholder="Enter user phone number"
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
              Make Payment for: <span className="font-bold">{selectedUser?.name}</span>
            </Text>
          }
          size="md"
          overlayProps={{
            backgroundOpacity: 0.5,
            blur: 3,
          }}
        >
          {selectedUser && (
            <div className="space-y-5">
              <Card withBorder p="md" radius="md" className="bg-blue-50">
                <Text size="sm" className="text-gray-600">Current Balance</Text>
                <Text className="text-2xl font-bold text-gray-800">Rs. {selectedUser.balance.toFixed(2)}</Text>
              </Card>

              <Input.Wrapper label="Payment Amount" description="Enter the amount to pay">
                <Input
                  placeholder="Enter payment amount"
                  type="number"
                  min="0"
                  max={selectedUser.balance}
                  value={paymentAmount || ''}
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

              <Text size="sm" className="text-gray-600">
                Maximum amount: Rs. {selectedUser.balance.toFixed(2)}
              </Text>

              <Group justify="right" mt="md">
                <Button variant="outline" onClick={closePaymentModal} color="gray" className="border-gray-300">
                  Cancel
                </Button>
                <Button
                  onClick={handleMakePayment}
                  disabled={paymentAmount <= 0 || paymentAmount > selectedUser.balance}
                  className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white shadow-md disabled:opacity-50"
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
          onClose={closePaidPaymentModal}
          title={
            <Text className="flex items-center gap-2">
              <IconCoin className="text-green-600" size={20} />
              Full Payment for: <span className="font-bold">{selectedUser?.name}</span>
            </Text>
          }
          size="md"
          overlayProps={{
            backgroundOpacity: 0.5,
            blur: 3,
          }}
        >
          {selectedUser && (
            <form onSubmit={handlePaidPaymentSubmit}>
              <div className="space-y-5">
                <Card withBorder p="md" radius="md" className="bg-blue-50">
                  <Text size="sm" className="text-gray-600">Total Amount Due</Text>
                  <Text className="text-2xl font-bold text-gray-800">Rs. {(selectedUser.balance + selectedUser.monthlyFees).toFixed(2)}</Text>
                </Card>

                <Input.Wrapper label="Paid Amount" description="Enter the full payment amount">
                  <Input
                    placeholder="Enter paid amount"
                    type="number"
                    min="0"
                    max={selectedUser.balance + selectedUser.monthlyFees}
                    value={paidPaymentAmount || ''}
                    onChange={(e) => handlePaidAmountChange(parseFloat(e.currentTarget.value) || 0)}
                  />
                </Input.Wrapper>

                <Card withBorder p="md" radius="md" className="bg-orange-50">
                  <Text size="sm" className="text-gray-600">Remaining Balance</Text>
                  <Text className="text-2xl font-bold text-gray-800">Rs. {balanceAmount.toFixed(2)}</Text>
                </Card>

                <Text size="sm" className="text-gray-600">
                  Maximum amount: Rs. {(selectedUser.balance + selectedUser.monthlyFees).toFixed(2)}
                </Text>

                <Group justify="right" mt="md">
                  <Button variant="outline" onClick={closePaidPaymentModal} color="gray" className="border-gray-300">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={paidPaymentAmount <= 0 || paidPaymentAmount > (selectedUser.balance + selectedUser.monthlyFees)}
                    className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white shadow-md disabled:opacity-50"
                  >
                    Process Full Payment
                  </Button>
                </Group>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </>
  );
}