'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Text, Table, Paper, Badge, Modal, Input, Group, ActionIcon, Menu, Select, Alert } from '@mantine/core';
import { IconPencil, IconTrash, IconPlus, IconDotsVertical, IconCalendar, IconCash, IconRefresh } from '@tabler/icons-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { 
  generateMonthlyDataForAllUsers, 
  updateBalanceOnPayment, 
  getUserMonthlyData, 
  getUnpaidUserMonthlyData, 
  calculateTotalOutstanding,
  MonthlyData,
  UploadEntry
} from '@/services/monthlyDataService';

export default function MonthlyDataComponent() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [uploadEntries, setUploadEntries] = useState<UploadEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MonthlyData | null>(null);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string} | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  // New state variables for the enhanced payment modal
  const [paidPaymentModalOpen, setPaidPaymentModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MonthlyData | null>(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  const [formData, setFormData] = useState<Omit<MonthlyData, 'id'>>({
    name: '',
    id_user: '',
    monthlyFee: 0,
    balance: 0,
    advance: 0,
    isPaid: false,
    profit: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    monthYear: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    totalAmount: 0,
    createdAt: new Date(),
  });

  // Load monthly data and upload entries from Firebase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        // Load monthly data
        const monthlyQuery = query(collection(db, 'monthlydata'), orderBy('createdAt', 'desc'));
        const monthlySnapshot = await getDocs(monthlyQuery);
        const monthlyResults: MonthlyData[] = [];

        monthlySnapshot.forEach((doc) => {
          monthlyResults.push({ id: doc.id, ...doc.data() } as MonthlyData);
        });

        setMonthlyData(monthlyResults);

        // Load upload entries to populate user data
        const uploadQuery = query(collection(db, 'uploadEntry'), orderBy('uploadedAt', 'desc'));
        const uploadSnapshot = await getDocs(uploadQuery);
        const uploadResults: UploadEntry[] = [];

        uploadSnapshot.forEach((doc) => {
          uploadResults.push({ id: doc.id, ...doc.data() });
        });

        setUploadEntries(uploadResults);
      } catch (error) {
        console.error('Error loading data: ', error);
        showAlert('error', 'Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 5000); // Hide after 5 seconds
  };

  // Handle form input changes
  const handleInputChange = (field: keyof Omit<MonthlyData, 'id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save changes
  const handleSave = async () => {
    try {
      if (editingItem && editingItem.id) {
        // Update existing document
        const docRef = doc(db, 'monthlydata', editingItem.id);
        await updateDoc(docRef, {
          ...formData,
          createdAt: formData.createdAt || serverTimestamp()
        });
      } else {
        // Create new document
        await addDoc(collection(db, 'monthlydata'), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }

      // Refresh data
      const monthlyQuery = query(collection(db, 'monthlydata'), orderBy('createdAt', 'desc'));
      const monthlySnapshot = await getDocs(monthlyQuery);
      const monthlyResults: MonthlyData[] = [];

      monthlySnapshot.forEach((doc) => {
        monthlyResults.push({ id: doc.id, ...doc.data() } as MonthlyData);
      });

      setMonthlyData(monthlyResults);
      setCreateModalOpen(false);
      setEditingItem(null);
      resetForm();
      showAlert('success', editingItem ? 'Monthly data updated successfully!' : 'Monthly data created successfully!');
    } catch (error) {
      console.error('Error saving data: ', error);
      showAlert('error', 'Failed to save data. Please try again.');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      id_user: '',
      monthlyFee: 0,
      balance: 0,
      advance: 0,
      isPaid: false,
      profit: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthYear: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      totalAmount: 0,
      createdAt: new Date(),
    });
  };

  // Handle edit button click
  const handleEdit = (item: MonthlyData) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      id_user: item.id_user,
      monthlyFee: item.monthlyFee,
      balance: item.balance,
      advance: item.advance,
      isPaid: item.isPaid,
      profit: item.profit,
      startDate: item.startDate,
      endDate: item.endDate,
      monthYear: item.monthYear,
      totalAmount: item.totalAmount,
      createdAt: item.createdAt,
    });
    setCreateModalOpen(true);
  };

  // Handle delete button click
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this monthly data entry?')) {
      try {
        const docRef = doc(db, 'monthlydata', id);
        await deleteDoc(docRef);

        // Refresh data
        const monthlyQuery = query(collection(db, 'monthlydata'), orderBy('createdAt', 'desc'));
        const monthlySnapshot = await getDocs(monthlyQuery);
        const monthlyResults: MonthlyData[] = [];

        monthlySnapshot.forEach((doc) => {
          monthlyResults.push({ id: doc.id, ...doc.data() } as MonthlyData);
        });

        setMonthlyData(monthlyResults);
        showAlert('success', 'Monthly data deleted successfully!');
      } catch (error) {
        console.error('Error deleting data: ', error);
        showAlert('error', 'Failed to delete data. Please try again.');
      }
    }
  };

  // Handle mark as paid
  const handleMarkAsPaid = async (id: string) => {
    try {
      const docRef = doc(db, 'monthlydata', id);
      await updateDoc(docRef, {
        isPaid: true,
        paidByTime: new Date().toISOString(),
        balance: 0
      });

      // Refresh data
      const monthlyQuery = query(collection(db, 'monthlydata'), orderBy('createdAt', 'desc'));
      const monthlySnapshot = await getDocs(monthlyQuery);
      const monthlyResults: MonthlyData[] = [];

      monthlySnapshot.forEach((doc) => {
        monthlyResults.push({ id: doc.id, ...doc.data() } as MonthlyData);
      });

      setMonthlyData(monthlyResults);
      showAlert('success', 'Payment marked as completed!');
    } catch (error) {
      console.error('Error updating payment status: ', error);
      showAlert('error', 'Failed to update payment status. Please try again.');
    }
  };

  // Generate monthly data for all users
  const handleGenerateMonthlyData = async () => {
    try {
      setIsLoading(true);
      await generateMonthlyDataForAllUsers();
      
      // Refresh data
      const monthlyQuery = query(collection(db, 'monthlydata'), orderBy('createdAt', 'desc'));
      const monthlySnapshot = await getDocs(monthlyQuery);
      const monthlyResults: MonthlyData[] = [];

      monthlySnapshot.forEach((doc) => {
        monthlyResults.push({ id: doc.id, ...doc.data() } as MonthlyData);
      });

      setMonthlyData(monthlyResults);
      showAlert('success', 'Monthly data generated for all users!');
    } catch (error) {
      console.error('Error generating monthly data: ', error);
      showAlert('error', 'Failed to generate monthly data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Open payment modal for a user
  const openPaymentModal = async (userId: string) => {
    try {
      if (!userId) return;
      
      const user = uploadEntries.find(entry => entry.id === userId);
      if (!user) return;
      
      setSelectedUser({
        id: userId,
        name: user.Username || user.username || user.name || user.Name || user.UserName || userId
      });
      
      const totalOutstanding = await calculateTotalOutstanding(userId);
      setPaymentAmount(totalOutstanding);
      setPaymentModalOpen(true);
    } catch (error) {
      console.error('Error opening payment modal: ', error);
      showAlert('error', 'Failed to open payment modal. Please try again.');
    }
  };

  // Open the new "Paid Payment" modal for a specific item
  const openPaidPaymentModal = (item: MonthlyData) => {
    setCurrentItem(item);
    setPaidAmount(item.balance); // Default to the current balance
    setBalanceAmount(item.balance - item.balance); // Balance after payment
    setPaidPaymentModalOpen(true);
  };

  // Handle paid amount change and calculate balance
  const handlePaidAmountChange = (amount: number) => {
    setPaidAmount(amount);
    if (currentItem) {
      const calculatedBalance = currentItem.balance - amount;
      setBalanceAmount(calculatedBalance < 0 ? 0 : calculatedBalance);
    }
  };

  // Handle paid payment form submission
  const handlePaidPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    
    if (!currentItem) {
      showAlert('error', 'No item selected for payment');
      return;
    }

    // Validate that paid amount doesn't exceed total amount
    if (paidAmount > currentItem.balance) {
      showAlert('error', 'Paid amount cannot exceed the total payable amount');
      return;
    }

    try {
      // Update the monthly data in Firestore
      const docRef = doc(db, 'monthlydata', currentItem.id!);
      await updateDoc(docRef, {
        balance: balanceAmount,
        isPaid: balanceAmount === 0,
        paidByTime: new Date().toISOString(),
      });

      // Refresh data
      const monthlyQuery = query(collection(db, 'monthlydata'), orderBy('createdAt', 'desc'));
      const monthlySnapshot = await getDocs(monthlyQuery);
      const monthlyResults: MonthlyData[] = [];

      monthlySnapshot.forEach((doc) => {
        monthlyResults.push({ id: doc.id, ...doc.data() } as MonthlyData);
      });

      setMonthlyData(monthlyResults);
      setPaidPaymentModalOpen(false);
      setCurrentItem(null);
      showAlert('success', `Payment of Rs. ${paidAmount} processed successfully!`);
    } catch (error) {
      console.error('Error processing paid payment: ', error);
      showAlert('error', 'Failed to process payment. Please try again.');
    }
  };

  // Process payment
  const processPayment = async () => {
    if (!selectedUser) return;
    
    try {
      await updateBalanceOnPayment(selectedUser.id, paymentAmount);
      
      // Refresh data
      const monthlyQuery = query(collection(db, 'monthlydata'), orderBy('createdAt', 'desc'));
      const monthlySnapshot = await getDocs(monthlyQuery);
      const monthlyResults: MonthlyData[] = [];

      monthlySnapshot.forEach((doc) => {
        monthlyResults.push({ id: doc.id, ...doc.data() } as MonthlyData);
      });

      setMonthlyData(monthlyResults);
      setPaymentModalOpen(false);
      setSelectedUser(null);
      showAlert('success', `Payment of Rs. ${paymentAmount} processed successfully!`);
    } catch (error) {
      console.error('Error processing payment: ', error);
      showAlert('error', 'Failed to process payment. Please try again.');
    }
  };

  // Status badge component
  const StatusBadge = ({ isPaid }: { isPaid: boolean }) => {
    return (
      <Badge
        variant="light"
        color={isPaid ? 'green' : 'orange'}
        radius="sm"
        className="font-bold py-3"
      >
        {isPaid ? 'PAID' : 'UNPAID'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {alertMessage && (
        <Alert 
          variant="light" 
          color={alertMessage.type === 'success' ? 'green' : 'red'} 
          title={alertMessage.type === 'success' ? 'Success' : 'Error'}
        >
          {alertMessage.message}
        </Alert>
      )}
      
      <div className="flex justify-between items-center">
        <Text className="text-xl font-bold text-gray-800">Monthly Data Management</Text>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateMonthlyData}
            className="bg-[#1e40af] hover:bg-[#1e40af]/90 text-white flex items-center justify-center gap-2"
          >
            <IconRefresh size={16} />
            Generate Monthly Data
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setEditingItem(null);
              setCreateModalOpen(true);
            }}
            className="bg-[#1e40af] hover:bg-[#1e40af]/90 text-white flex items-center justify-center gap-2"
          >
            <IconPlus size={16} />
            Add Monthly Data
          </Button>
        </div>
      </div>

      <Paper radius="md" withBorder className="overflow-hidden border-gray-100 shadow-sm">
        <Table verticalSpacing="md" horizontalSpacing="xl" className="min-w-[800px]">
          <Table.Thead className="bg-gray-50/50">
            <Table.Tr>
              <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Name</Table.Th>
              <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">User ID</Table.Th>
              <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Monthly Fee</Table.Th>
              <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Balance</Table.Th>
              <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Advance</Table.Th>
              <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Status</Table.Th>
              <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Month</Table.Th>
              <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Start Date</Table.Th>
              <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">End Date</Table.Th>
              <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Profit</Table.Th>
              <Table.Th aria-label="Actions" />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {monthlyData.map((item) => (
              <Table.Tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <Table.Td>{item.name}</Table.Td>
                <Table.Td>{item.id_user.substring(0, 8)}...</Table.Td>
                <Table.Td className="font-bold text-gray-800">Rs. {item.monthlyFee}</Table.Td>
                <Table.Td className="font-bold text-gray-800">Rs. {item.balance}</Table.Td>
                <Table.Td className="font-bold text-gray-800">Rs. {item.advance}</Table.Td>
                <Table.Td>
                  <StatusBadge isPaid={item.isPaid} />
                </Table.Td>
                <Table.Td>{item.monthYear}</Table.Td>
                <Table.Td>{item.startDate}</Table.Td>
                <Table.Td>{item.endDate}</Table.Td>
                <Table.Td className="font-bold text-gray-800">Rs. {item.profit}</Table.Td>
                <Table.Td>
                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray">
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      {!item.isPaid && (
                        <Menu.Item
                          onClick={() => item.id && handleMarkAsPaid(item.id)}
                          leftSection={<IconCash size={14} />}
                          color="green"
                        >
                          Mark as Paid
                        </Menu.Item>
                      )}
                      <Menu.Item
                        onClick={() => item.id_user && openPaymentModal(item.id_user)}
                        leftSection={<IconCash size={14} />}
                        color="blue"
                      >
                        Process Payment
                      </Menu.Item>
                      <Menu.Item
                        onClick={() => openPaidPaymentModal(item)}
                        leftSection={<IconCash size={14} />}
                        color="blue"
                      >
                        Paid Payment
                      </Menu.Item>
                      <Menu.Item
                        onClick={() => handleEdit(item)}
                        leftSection={<IconPencil size={14} />}
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Item
                        onClick={() => item.id && handleDelete(item.id)}
                        leftSection={<IconTrash size={14} />}
                        color="red"
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Create/Edit Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingItem(null);
          resetForm();
        }}
        title={editingItem ? 'Edit Monthly Data' : 'Create New Monthly Data'}
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Select User"
            placeholder="Choose a user from uploadEntry"
            value={formData.id_user}
            onChange={(value) => {
              if (value) {
                handleInputChange('id_user', value);

                // Find the corresponding user from uploadEntries to auto-populate name and other fields
                const user = uploadEntries.find(entry => entry.id === value);
                if (user) {
                  handleInputChange('name', user.Username || user.username || user.name || user.Name || user.UserName || '');

                  // Auto-populate other fields from uploadEntry if they exist
                  const monthlyFee = user.MonthlyFee || user.monthlyFee || user['Monthly Fee'] || 0;
                  handleInputChange('monthlyFee', monthlyFee);
                  handleInputChange('balance', monthlyFee); // Initially balance equals monthly fee

                  const advance = user.advance || user.Advance || 0;
                  handleInputChange('advance', advance);

                  const profit = user.Profit || user.profit || 0;
                  handleInputChange('profit', profit);
                  
                  // Set monthYear to current month
                  const currentMonthYear = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
                  handleInputChange('monthYear', currentMonthYear);
                  
                  // Set totalAmount
                  handleInputChange('totalAmount', monthlyFee);
                }
              }
            }}
            data={uploadEntries.map(entry => ({
              value: entry.id,
              label: entry.Username || entry.username || entry.name || entry.Name || entry.UserName || entry.id
            }))}
          />

          <Input.Wrapper label="Name">
            <Input
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </Input.Wrapper>

          <Input.Wrapper label="User ID">
            <Input
              placeholder="Enter user ID"
              value={formData.id_user}
              onChange={(e) => handleInputChange('id_user', e.target.value)}
            />
          </Input.Wrapper>

          <Input.Wrapper label="Monthly Fee">
            <Input
              placeholder="Enter monthly fee"
              type="number"
              value={formData.monthlyFee.toString()}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                handleInputChange('monthlyFee', value);
                handleInputChange('balance', value); // Update balance when monthly fee changes
                handleInputChange('totalAmount', value);
              }}
            />
          </Input.Wrapper>

          <Input.Wrapper label="Balance">
            <Input
              placeholder="Enter balance"
              type="number"
              value={formData.balance.toString()}
              onChange={(e) => handleInputChange('balance', parseFloat(e.target.value) || 0)}
            />
          </Input.Wrapper>

          <Input.Wrapper label="Advance">
            <Input
              placeholder="Enter advance"
              type="number"
              value={formData.advance.toString()}
              onChange={(e) => handleInputChange('advance', parseFloat(e.target.value) || 0)}
            />
          </Input.Wrapper>

          <Input.Wrapper label="Profit">
            <Input
              placeholder="Enter profit"
              type="number"
              value={formData.profit.toString()}
              onChange={(e) => handleInputChange('profit', parseFloat(e.target.value) || 0)}
            />
          </Input.Wrapper>

          <Input.Wrapper label="Month Year (YYYY-MM)">
            <Input
              placeholder="Enter month year"
              value={formData.monthYear}
              onChange={(e) => handleInputChange('monthYear', e.target.value)}
            />
          </Input.Wrapper>

          <Input.Wrapper label="Start Date">
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
            />
          </Input.Wrapper>

          <Input.Wrapper label="End Date">
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
            />
          </Input.Wrapper>

          <Group justify="right" mt="md">
            <Button
              variant="default"
              onClick={() => {
                setCreateModalOpen(false);
                setEditingItem(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#1e40af] hover:bg-[#1e40af]/90"
            >
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </Group>
        </div>
      </Modal>
      
      {/* Payment Processing Modal */}
      <Modal
        opened={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={`Process Payment for ${selectedUser?.name || ''}`}
        size="md"
      >
        <div className="space-y-4">
          <Text size="sm">Current Outstanding Amount: <strong>Rs. {paymentAmount}</strong></Text>
          
          <Input.Wrapper label="Payment Amount">
            <Input
              placeholder="Enter payment amount"
              type="number"
              value={paymentAmount.toString()}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
            />
          </Input.Wrapper>
          
          <Group justify="right" mt="md">
            <Button
              variant="default"
              onClick={() => setPaymentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={processPayment}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Process Payment
            </Button>
          </Group>
        </div>
      </Modal>
      
      {/* Paid Payment Modal */}
      <Modal
        opened={paidPaymentModalOpen}
        onClose={() => setPaidPaymentModalOpen(false)}
        title="Paid Payment"
        size="md"
      >
        <form onSubmit={handlePaidPaymentSubmit}>
          <div className="space-y-4">
            <Input.Wrapper label="Total Payable Amount (Read-only)">
              <Input
                placeholder="Total amount"
                type="number"
                value={currentItem?.balance.toString() || '0'}
                readOnly
                disabled
              />
            </Input.Wrapper>
            
            <Input.Wrapper label="Paid Amount">
              <Input
                placeholder="Enter paid amount"
                type="number"
                value={paidAmount.toString()}
                onChange={(e) => handlePaidAmountChange(parseFloat(e.target.value) || 0)}
              />
            </Input.Wrapper>
            
            <Input.Wrapper label="Balance Amount">
              <Input
                placeholder="Calculated balance"
                type="number"
                value={balanceAmount.toString()}
                readOnly
                disabled
              />
            </Input.Wrapper>
            
            <Group justify="right" mt="md">
              <Button
                variant="default"
                type="button"
                onClick={() => setPaidPaymentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Submit Payment
              </Button>
            </Group>
          </div>
        </form>
      </Modal>
    </div>
  );
}