'use client';

import React, { useState, useEffect } from 'react';
import { CreationModals } from '@/components/dashboard/CreationModals';
import { Button, TextInput, Select, Card, Text, Badge, LoadingOverlay, Table, Paper, ActionIcon, Menu, Modal, Input, Group, Tabs } from '@mantine/core';
import { IconSearch, IconPlus, IconUser, IconId, IconMapPin, IconX, IconDotsVertical, IconCheck, IconPencil, IconCash, IconTrash, IconCalendar } from '@tabler/icons-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import MonthlyDataComponent from '@/components/dashboard/MonthlyDataComponent';
import { updateUserDataInBothCollections, deleteUserDataFromBothCollections } from '@/services/syncService';

// Define the data type for upload entry
type UploadEntry = {
  id: string;
  [key: string]: any; // Allow dynamic properties
};

// Define the data type for monthly data
type MonthlyData = {
  id: string;
  name: string;
  id_user: string;
  monthlyFee: number;
  balance: number;
  advance: number;
  isPaid: boolean;
  profit: number;
  startDate: string;
  endDate: string;
  monthYear: string;
  totalAmount: number;
  createdAt: Date | any; // Could be Firestore timestamp
  [key: string]: any; // Allow dynamic properties
};

export default function SearchPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<'username' | 'userid' | 'address' | 'all'>('all');
  const [searchResults, setSearchResults] = useState<(UploadEntry | MonthlyData)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [editingItem, setEditingItem] = useState<UploadEntry | MonthlyData | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState('uploadEntry');

  // Function to search in Firebase
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!searchTerm.trim()) {
      setSearchResults([]);
      setNoResults(false);
      return;
    }

    setIsLoading(true);
    setNoResults(false);

    try {
      if (activeTab === 'uploadEntry') {
        // Query the uploadEntry collection
        let q;

        if (searchField === 'all') {
          // Search across username, userid, and address fields
          q = query(
            collection(db, 'uploadEntry'),
            orderBy('uploadedAt', 'desc')
          );
        } else {
          q = query(
            collection(db, 'uploadEntry'),
            where(searchField, '>=', searchTerm.trim()),
            where(searchField, '<=', searchTerm.trim() + '\uf8ff'),
            orderBy('uploadedAt', 'desc')
          );
        }

        const querySnapshot = await getDocs(q);
        const results: UploadEntry[] = [];

        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });

        // If searching all fields, filter client-side
        if (searchField === 'all') {
          const filteredResults = results.filter(item => {
            const username = item.Username || item.username || item.name || item.Name || item.UserName || '';
            const userid = item['Invoice ID'] || item.userid || item.id || item.ID || item.UserId || '';
            const address = item.Pacakge || item.Package || item.package || item.address || item.Address || item.location || item.Location || '';

            return (
              String(username).toLowerCase().includes(searchTerm.toLowerCase()) ||
              String(userid).toLowerCase().includes(searchTerm.toLowerCase()) ||
              String(address).toLowerCase().includes(searchTerm.toLowerCase())
            );
          });

          setSearchResults(filteredResults);
        } else {
          // For specific field search, filter based on the selected field
          const filteredResults = results.filter(item => {
            let fieldValue = '';

            switch (searchField) {
              case 'username':
                fieldValue = item.Username || item.username || item.name || item.Name || item.UserName || '';
                break;
              case 'userid':
                fieldValue = item['Invoice ID'] || item.userid || item.id || item.ID || item.UserId || '';
                break;
              case 'address':
                fieldValue = item.Pacakge || item.Package || item.package || item.address || item.Address || item.location || item.Location || '';
                break;
              default:
                fieldValue = '';
            }

            return String(fieldValue).toLowerCase().includes(searchTerm.toLowerCase());
          });

          setSearchResults(filteredResults);
        }

        if (results.length === 0) {
          setNoResults(true);
        }
      } else if (activeTab === 'monthlyData') {
        // Query the monthlydata collection
        let q;

        if (searchField === 'all') {
          // Search across name, id_user, and other relevant fields
          q = query(
            collection(db, 'monthlydata'),
            orderBy('createdAt', 'desc')
          );
        } else {
          // Map searchField to appropriate monthlyData fields
          let monthlyDataField = '';
          switch (searchField) {
            case 'username':
              monthlyDataField = 'name';
              break;
            case 'userid':
              monthlyDataField = 'id_user';
              break;
            case 'address':
              monthlyDataField = 'monthYear'; // Using monthYear as a relevant field
              break;
            default:
              monthlyDataField = 'name';
          }

          q = query(
            collection(db, 'monthlydata'),
            where(monthlyDataField, '>=', searchTerm.trim()),
            where(monthlyDataField, '<=', searchTerm.trim() + '\uf8ff'),
            orderBy('createdAt', 'desc')
          );
        }

        const querySnapshot = await getDocs(q);
        const results: MonthlyData[] = [];

        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });

        // If searching all fields, filter client-side
        if (searchField === 'all') {
          const filteredResults = results.filter(item => {
            const name = item.name || '';
            const idUser = item.id_user || '';
            const monthYear = item.monthYear || '';

            return (
              String(name).toLowerCase().includes(searchTerm.toLowerCase()) ||
              String(idUser).toLowerCase().includes(searchTerm.toLowerCase()) ||
              String(monthYear).toLowerCase().includes(searchTerm.toLowerCase())
            );
          });

          setSearchResults(filteredResults);
        } else {
          // For specific field search, filter based on the selected field
          const filteredResults = results.filter(item => {
            let fieldValue = '';

            switch (searchField) {
              case 'username':
                fieldValue = item.name || '';
                break;
              case 'userid':
                fieldValue = item.id_user || '';
                break;
              case 'address':
                fieldValue = item.monthYear || ''; // Using monthYear as a relevant field
                break;
              default:
                fieldValue = '';
            }

            return String(fieldValue).toLowerCase().includes(searchTerm.toLowerCase());
          });

          setSearchResults(filteredResults);
        }

        if (results.length === 0) {
          setNoResults(true);
        }
      }
    } catch (error) {
      console.error('Error searching documents: ', error);
      setSearchResults([]);
      setNoResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setNoResults(false);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Load all data initially and run search when search field changes
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        let results: (UploadEntry | MonthlyData)[] = [];

        if (activeTab === 'uploadEntry') {
          const q = query(collection(db, 'uploadEntry'), orderBy('uploadedAt', 'desc'));
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
          });
        } else if (activeTab === 'monthlyData') {
          const q = query(collection(db, 'monthlydata'), orderBy('createdAt', 'desc'));
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
          });
        }

        setSearchResults(results);
      } catch (error) {
        console.error('Error loading all data: ', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [activeTab]);

  // Run search when search field or term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      handleSearch();
    } else {
      // Reload all data when search term is cleared
      const loadAllData = async () => {
        setIsLoading(true);
        try {
          let results: (UploadEntry | MonthlyData)[] = [];

          if (activeTab === 'uploadEntry') {
            const q = query(collection(db, 'uploadEntry'), orderBy('uploadedAt', 'desc'));
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach((doc) => {
              results.push({ id: doc.id, ...doc.data() });
            });
          } else if (activeTab === 'monthlyData') {
            const q = query(collection(db, 'monthlydata'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach((doc) => {
              results.push({ id: doc.id, ...doc.data() });
            });
          }

          setSearchResults(results);
        } catch (error) {
          console.error('Error loading all data: ', error);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      };

      loadAllData();
    }
  }, [searchField, searchTerm, activeTab]);

  // Address badge component
  const AddressBadge = ({ address }: { address: string }) => {
    const colors: Record<string, string> = {
      pakistan: 'blue',
      Pakistan: 'blue',
      'United States': 'green',
      'United Kingdom': 'orange',
      India: 'yellow',
      China: 'red',
      Japan: 'purple'
    };

    return (
      <Badge
        variant="light"
        color={colors[address] || 'gray'}
        radius="sm"
        className="font-bold py-3"
      >
        {address}
      </Badge>
    );
  };

  // Handle edit button click
  const handleEditClick = (item: UploadEntry) => {
    setEditingItem(item);
    // Initialize form with item data and set default values
    const defaultValues = {
      name: item.name || item.Name || item.username || item.Username || item.UserName || 'N/A',
      Phone: item.Phone || item.phone || item.Mobile || item.mobile || 'N/A',
      'Monthly Fee': item['Monthly Fee'] || item.MonthlyFee || item.monthlyFee || '0',
      Balance: item.Balance || item.balance || '0',
      Profit: item.Profit || item.profit || '0',
      Total: item.Total || item.total || '0',
      Price: item.Price || item.price || '0',
      ...item
    };
    setEditForm(defaultValues);
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    // Ensure all values are treated as strings
    const stringValue = value === null || value === undefined ? '' : String(value);
    setEditForm(prev => ({
      ...prev,
      [field]: stringValue
    }));
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!editingItem) return;

    try {
      // Ensure all values in editForm are strings before saving
      const stringifiedEditForm = Object.fromEntries(
        Object.entries(editForm).map(([key, value]) => [key, String(value)])
      );

      // Use the sync service to update both collections
      await updateUserDataInBothCollections(editingItem.id, stringifiedEditForm);

      // Update local state
      setSearchResults(prev => prev.map(u =>
        u.id === editingItem.id ? {...u, ...stringifiedEditForm} : u
      ));

      setEditingItem(null);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingItem(null);
    setEditForm({});
  };

  return (
    <div className="space-y-6">
      {/* Search and Create Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 w-full">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto lg:flex-1">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Select
                value={searchField}
                onChange={(value) => setSearchField(value as any)}
                data={[
                  { value: 'all', label: 'All Fields' },
                  { value: 'username', label: 'Username' },
                  { value: 'userid', label: 'User ID' },
                  { value: 'address', label: 'Address' },
                ]}
                className="w-full sm:w-40 mb-2 sm:mb-0"
                placeholder="Search in"
                size="md"
              />

              <div className="relative flex-1">
                <TextInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search by username, userid, or address..."
                  className="pr-10"
                  size="md"
                  rightSection={
                    searchTerm && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <IconX size={16} />
                      </button>
                    )
                  }
                />
                <IconSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>

            <Button
              type="submit"
              className="bg-[#1e40af] hover:bg-[#1e40af]/90 text-white flex items-center justify-center gap-2 min-w-[120px] h-[46px] rounded-lg shadow-sm transition-all duration-200 mt-2 sm:mt-0"
            >
              <IconSearch size={18} />
              <span>Search</span>
            </Button>
          </form>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#1e40af] hover:bg-[#1e40af]/90 text-white flex items-center justify-center gap-2 min-w-[120px] h-[46px] rounded-lg shadow-sm transition-all duration-200 mt-2 lg:mt-0"
          >
            <IconPlus size={18} />
            <span>Create User</span>
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onChange={setActiveTab} variant="outline">
        <Tabs.List>
          <Tabs.Tab value="uploadEntry" leftSection={<IconUser size={14} />}>
            User Entries
          </Tabs.Tab>
          <Tabs.Tab value="monthlyData" leftSection={<IconCalendar size={14} />}>
            Monthly Data
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="uploadEntry" pt="xs">
          {/* Search Results */}
          {isLoading && (
            <Card withBorder radius="md" className="relative">
              <LoadingOverlay visible={true} blur={2} />
              <Text className="text-center py-4">Loading...</Text>
            </Card>
          )}

          {/* Transaction History Table */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">All Users Entry</Text>
              <Text className="text-sm text-gray-500">
                Showing {searchResults.length} record{searchResults.length !== 1 ? 's' : ''}
              </Text>
            </div>
            <Paper radius="md" withBorder className="overflow-hidden border-gray-100 shadow-sm">
              <Table verticalSpacing="md" horizontalSpacing="xl" className="min-w-[800px]">
                <Table.Thead className="bg-gray-50/50">
                  <Table.Tr>
                    <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">User ID</Table.Th>
                    <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Username</Table.Th>
                    <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Package</Table.Th>
                    <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Amount</Table.Th>
                    <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Status</Table.Th>
                    <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Date</Table.Th>
                    <Table.Th aria-label="Actions" />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {searchResults.map((item) => {
                    // Use exact field names from your Firebase data
                    const username = item.Username || item.username || item.name || item.Name || item.UserName || 'N/A';
                    const invoiceId = item['Invoice ID'] || item.invoiceId || item.invoice_id || 'N/A';
                    const nameValue = item.name || item.Name || item.username || item.Username || item.UserName || 'N/A';
                    const packageName = item.Pacakge || item.Package || item.package || 'N/A';
                    const price = item.Price || item.price || 'N/A';
                    const profit = item.Profit || item.profit || 'N/A';
                    const total = item.Total || item.total || 'N/A';
                    const date = item.Date || item.date || item.Date || 'N/A';
                    const status = item.isPaid || item.status || 'N/A';

                    const address = item.address || item.Address || item.location || item.Location || 'N/A';

                    return (
                      <Table.Tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <Table.Td className="font-semibold text-gray-700">{nameValue}</Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={600} className="text-gray-800">{username}</Text>
                        </Table.Td>
                        <Table.Td className="text-gray-400 text-sm">{packageName}</Table.Td>
                        <Table.Td className="font-bold text-gray-800">{total}</Table.Td>
                        <Table.Td>
                          <AddressBadge address={address} />
                        </Table.Td>
                        <Table.Td className="text-gray-400 text-sm">{date}</Table.Td>
                        <Table.Td>
                          <Menu shadow="md" width={200}>
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16} /></ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconMapPin size={14} />}
                                onClick={() => {
                                  // Update address in Firebase
                                  const docRef = doc(db, 'uploadEntry', item.id);
                                  updateDoc(docRef, { address: 'pakistan' })
                                    .then(() => {
                                      // Update local state to reflect the change
                                      setSearchResults(prev => prev.map(u =>
                                        u.id === item.id ? {...u, address: 'pakistan'} : u
                                      ));
                                    })
                                    .catch(error => {
                                      console.error("Error updating document: ", error);
                                    });
                                }}
                              >
                                Set Default Address
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconPencil size={14} />}
                                onClick={() => handleEditClick(item)}
                              >
                                Edit
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete user "${username}" (ID: ${nameValue})?`)) {
                                    // Delete document from Firebase using sync service
                                    deleteUserDataFromBothCollections(item.id)
                                      .then(() => {
                                        // Update local state to reflect the deletion
                                        setSearchResults(prev => prev.filter(u => u.id !== item.id));
                                      })
                                      .catch(error => {
                                        console.error("Error deleting document: ", error);
                                      });
                                  }
                                }}
                              >
                                Delete
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Paper>
          </div>

          {/* Edit Modal */}
          <Modal
            opened={!!editingItem}
            onClose={closeEditModal}
            title={`Edit User: ${editingItem?.username || editingItem?.name || editingItem?.Name || editingItem?.UserName || editingItem?.id}`}
            size="lg"
          >
            {editingItem && (
              <div className="space-y-4">
                {/* Specific fields for uploadEntry data */}
                <Input
                  label="User ID:"
                  placeholder="Enter User ID"
                  value={editForm['User ID'] || editForm.userid || editForm.id || editForm.ID || editForm.UserId || ''}
                  onChange={(e) => handleInputChange('User ID', e.currentTarget.value)}
                />

                <Input
                  label="Username:"
                  placeholder="Enter Username"
                  value={editForm.Username || editForm.username || editForm.name || editForm.Name || editForm.UserName || ''}
                  onChange={(e) => handleInputChange('Username', e.currentTarget.value)}
                />

                <Input
                  label="Name:"
                  placeholder="Enter Name"
                  value={editForm.name || editForm.Name || editForm.username || editForm.Username || editForm.UserName || 'N/A'}
                  onChange={(e) => handleInputChange('name', e.currentTarget.value)}
                />

                <Input
                  label="Phone:"
                  placeholder="Enter Phone Number"
                  value={editForm.Phone || editForm.phone || editForm.Mobile || editForm.mobile || 'N/A'}
                  onChange={(e) => handleInputChange('Phone', e.currentTarget.value)}
                />

                <Input
                  label="Package:"
                  placeholder="Enter Package"
                  value={editForm.Package || editForm.Pacakge || editForm.package || ''}
                  onChange={(e) => handleInputChange('Package', e.currentTarget.value)}
                />

                <Input
                  label="Amount:"
                  placeholder="Enter Amount"
                  value={editForm.Amount || editForm.Price || editForm.Total || editForm.total || editForm.payment || editForm.Payment || editForm.fee || editForm.Fee || '0'}
                  onChange={(e) => handleInputChange('Amount', e.currentTarget.value)}
                />

                <Input
                  label="Address:"
                  placeholder="Enter Address"
                  value={editForm.Address || editForm.address || editForm.location || editForm.Location || ''}
                  onChange={(e) => handleInputChange('Address', e.currentTarget.value)}
                />

                <Input
                  label="Password:"
                  placeholder="Enter Password"
                  value={editForm.Password || editForm.password || ''}
                  onChange={(e) => handleInputChange('Password', e.currentTarget.value)}
                />

                <Input
                  label="Monthly Fee:"
                  placeholder="Enter Monthly Fee"
                  value={editForm['Monthly Fee'] || editForm.MonthlyFee || editForm.monthlyFee || '0'}
                  onChange={(e) => handleInputChange('Monthly Fee', e.currentTarget.value)}
                />

                <Input
                  label="Balance:"
                  placeholder="Enter Balance (default 0)"
                  value={editForm.Balance || editForm.balance || '0'}
                  onChange={(e) => handleInputChange('Balance', e.currentTarget.value)}
                />

                <Input
                  label="Profit:"
                  placeholder="Enter Profit (default 0)"
                  value={editForm.Profit || editForm.profit || '0'}
                  onChange={(e) => handleInputChange('Profit', e.currentTarget.value)}
                />

                <Input
                  label="Total:"
                  placeholder="Enter Total (default 0)"
                  value={editForm.Total || editForm.total || '0'}
                  onChange={(e) => handleInputChange('Total', e.currentTarget.value)}
                />

                <Input
                  label="Price:"
                  placeholder="Enter Price (default 0)"
                  value={editForm.Price || editForm.price || '0'}
                  onChange={(e) => handleInputChange('Price', e.currentTarget.value)}
                />

                <Input
                  label="Date:"
                  type="date"
                  value={editForm.Date || editForm.date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('Date', e.currentTarget.value)}
                />

                <Group justify="right" mt="md">
                  <Button variant="subtle" onClick={closeEditModal}>Cancel</Button>
                  <Button onClick={handleSaveChanges} className="bg-[#1e40af] hover:bg-[#1e40af]/90">Save Changes</Button>
                </Group>
              </div>
            )}
          </Modal>
        </Tabs.Panel>

        <Tabs.Panel value="monthlyData" pt="xs">
          {/* Search Results for Monthly Data */}
          {isLoading && (
            <Card withBorder radius="md" className="relative">
              <LoadingOverlay visible={true} blur={2} />
              <Text className="text-center py-4">Loading...</Text>
            </Card>
          )}

          {/* Monthly Data Table */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">Monthly Data</Text>
              <Text className="text-sm text-gray-500">
                Showing {searchResults.length} record{searchResults.length !== 1 ? 's' : ''}
              </Text>
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
                  {(searchResults as MonthlyData[]).map((item) => (
                    <Table.Tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <Table.Td>{item.name || 'N/A'}</Table.Td>
                      <Table.Td>{item.id_user ? item.id_user.substring(0, 8) + '...' : 'N/A'}</Table.Td>
                      <Table.Td className="font-bold text-gray-800">Rs. {item.monthlyFee || 0}</Table.Td>
                      <Table.Td className="font-bold text-gray-800">Rs. {item.balance || 0}</Table.Td>
                      <Table.Td className="font-bold text-gray-800">Rs. {item.advance || 0}</Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          color={item.isPaid ? 'green' : 'orange'}
                          radius="sm"
                          className="font-bold py-3"
                        >
                          {item.isPaid ? 'PAID' : 'UNPAID'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{item.monthYear || 'N/A'}</Table.Td>
                      <Table.Td>{item.startDate || 'N/A'}</Table.Td>
                      <Table.Td>{item.endDate || 'N/A'}</Table.Td>
                      <Table.Td className="font-bold text-gray-800">Rs. {item.profit || 0}</Table.Td>
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
                                onClick={() => {
                                  // Mark as paid functionality
                                  const docRef = doc(db, 'monthlydata', item.id);
                                  updateDoc(docRef, {
                                    isPaid: true,
                                    paidByTime: new Date().toISOString(),
                                    balance: 0
                                  }).then(() => {
                                    // Refresh data
                                    handleSearch();
                                  }).catch(error => {
                                    console.error("Error updating document: ", error);
                                  });
                                }}
                                leftSection={<IconCash size={14} />}
                                color="green"
                              >
                                Mark as Paid
                              </Menu.Item>
                            )}
                            <Menu.Item
                              onClick={() => {
                                // Edit functionality
                                setEditingItem(item);
                                setEditForm({...item});
                              }}
                              leftSection={<IconPencil size={14} />}
                            >
                              Edit
                            </Menu.Item>
                            <Menu.Item
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete this monthly data entry?`)) {
                                  // Delete document from Firebase
                                  const docRef = doc(db, 'monthlydata', item.id);
                                  deleteDoc(docRef)
                                    .then(() => {
                                      // Update local state to reflect the deletion
                                      setSearchResults(prev => prev.filter(u => u.id !== item.id));
                                    })
                                    .catch(error => {
                                      console.error("Error deleting document: ", error);
                                    });
                                }
                              }}
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
          </div>

          {/* Edit Modal for Monthly Data */}
          <Modal
            opened={!!editingItem && activeTab === 'monthlyData'}
            onClose={closeEditModal}
            title={`Edit Monthly Data: ${editingItem?.name || editingItem?.id}`}
            size="lg"
          >
            {editingItem && activeTab === 'monthlyData' && (
              <div className="space-y-4">
                <Input
                  label="Name:"
                  placeholder="Enter Name"
                  value={editForm.name || ''}
                  onChange={(e) => handleInputChange('name', e.currentTarget.value)}
                />

                <Input
                  label="User ID:"
                  placeholder="Enter User ID"
                  value={editForm.id_user || ''}
                  onChange={(e) => handleInputChange('id_user', e.currentTarget.value)}
                />

                <Input
                  label="Monthly Fee:"
                  placeholder="Enter Monthly Fee"
                  type="number"
                  value={editForm.monthlyFee || 0}
                  onChange={(e) => handleInputChange('monthlyFee', parseFloat(e.currentTarget.value) || 0)}
                />

                <Input
                  label="Balance:"
                  placeholder="Enter Balance"
                  type="number"
                  value={editForm.balance || 0}
                  onChange={(e) => handleInputChange('balance', parseFloat(e.currentTarget.value) || 0)}
                />

                <Input
                  label="Advance:"
                  placeholder="Enter Advance"
                  type="number"
                  value={editForm.advance || 0}
                  onChange={(e) => handleInputChange('advance', parseFloat(e.currentTarget.value) || 0)}
                />

                <Input
                  label="Profit:"
                  placeholder="Enter Profit"
                  type="number"
                  value={editForm.profit || 0}
                  onChange={(e) => handleInputChange('profit', parseFloat(e.currentTarget.value) || 0)}
                />

                <Input
                  label="Month Year:"
                  placeholder="Enter Month Year (YYYY-MM)"
                  value={editForm.monthYear || ''}
                  onChange={(e) => handleInputChange('monthYear', e.currentTarget.value)}
                />

                <Input
                  label="Start Date:"
                  type="date"
                  value={editForm.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e.currentTarget.value)}
                />

                <Input
                  label="End Date:"
                  type="date"
                  value={editForm.endDate || ''}
                  onChange={(e) => handleInputChange('endDate', e.currentTarget.value)}
                />

                <Group justify="right" mt="md">
                  <Button variant="subtle" onClick={closeEditModal}>Cancel</Button>
                  <Button
                    onClick={async () => {
                      if (!editingItem) return;

                      try {
                        const docRef = doc(db, 'monthlydata', editingItem.id);

                        // Prepare update object with all fields except the ID
                        const updateData: Record<string, any> = {};
                        Object.keys(editForm).forEach(key => {
                          if (key !== 'id') {
                            updateData[key] = editForm[key];
                          }
                        });

                        await updateDoc(docRef, updateData);

                        // Update local state
                        setSearchResults(prev => prev.map(u =>
                          u.id === editingItem.id ? {...editingItem, ...updateData} : u
                        ));

                        setEditingItem(null);

                        // Refresh the search results
                        handleSearch();
                      } catch (error) {
                        console.error("Error updating document: ", error);
                      }
                    }}
                    className="bg-[#1e40af] hover:bg-[#1e40af]/90"
                  >
                    Save Changes
                  </Button>
                </Group>
              </div>
            )}
          </Modal>
        </Tabs.Panel>
      </Tabs>

      {!isLoading && noResults && searchTerm && (
        <Card withBorder radius="md" className="mt-4">
          <Text className="text-center py-4 text-gray-500">
            No results found for "{searchTerm}" in {searchField === 'all' ? 'any field' : searchField}
          </Text>
        </Card>
      )}

      {/* Create User Modal */}
      <CreationModals
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        type="uploadEntry"
      />
    </div>
  );
}