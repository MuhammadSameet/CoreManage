'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextInput, Card, Text, Badge, LoadingOverlay, Table, Paper, ActionIcon, Modal, Input, Group, Divider } from '@mantine/core';
import { DatePickerInput, DatesRangeValue } from '@mantine/dates';
import { IconSearch, IconPencil, IconX, IconCalendar, IconCoin, IconUser, IconId } from '@tabler/icons-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import dayjs from 'dayjs';

// Define the data type for payment
type Payment = {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: string;
  date: Date;
  previousBalance: number;
  newBalance: number;
  isPaid: boolean;
  [key: string]: unknown; // Allow dynamic properties
};

// Define the type for raw data from Firestore
type RawPaymentData = {
  id: string;
  userId?: string;
  userName?: string;
  amount?: number;
  method?: string;
  date?: any; // Can be Firestore Timestamp, string, or other format
  previousBalance?: number;
  newBalance?: number;
  isPaid?: boolean;
  [key: string]: unknown;
};

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);
  const [paidByFilter, setPaidByFilter] = useState('');

  // Function to fetch payments from Firebase
  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      // Query the payments collection for payment data
      const q = query(collection(db, 'payments'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const paymentsData: Payment[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as RawPaymentData;
        
        // Handle date conversion properly
        let convertedDate: Date;
        if (data.date && typeof data.date.toDate === 'function') {
          // If it's a Firestore Timestamp object
          convertedDate = data.date.toDate();
        } else if (data.date && typeof data.date === 'string') {
          // If it's a string date
          convertedDate = new Date(data.date);
        } else if (data.date && typeof data.date === 'object' && data.date.seconds) {
          // If it's a Firestore Timestamp-like object with seconds
          convertedDate = new Date(data.date.seconds * 1000);
        } else {
          // Default to current date
          convertedDate = new Date();
        }
        
        // Create a copy of data without the id field to avoid conflicts
        const { id, ...restData } = data;
        
        paymentsData.push({
          id: doc.id,
          userId: data.userId || 'N/A',
          userName: data.userName || 'N/A',
          amount: data.amount || 0,
          method: data.method || 'N/A',
          date: convertedDate,
          previousBalance: data.previousBalance || 0,
          newBalance: data.newBalance || 0,
          isPaid: data.isPaid || false,
          ...restData
        });
      });

      setPayments(paymentsData);
      setFilteredPayments(paymentsData); // Initially show all payments
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
      setFilteredPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  // Apply filters to payments
  useEffect(() => {
    let result = [...payments];
    
    // Apply search term filter
    if (searchTerm) {
      result = result.filter(payment => 
        payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.amount.toString().includes(searchTerm.toLowerCase()) ||
        payment.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.newBalance.toString().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply date range filter
    if (dateRange[0] && dateRange[1]) {
      const startDate = dayjs(dateRange[0]).startOf('day').toDate();
      const endDate = dayjs(dateRange[1]).endOf('day').toDate();

      result = result.filter(payment => {
        const paymentDate = dayjs(payment.date).toDate();
        return paymentDate >= startDate && paymentDate <= endDate;
      });
    }
    
    // Apply paid by name filter
    if (paidByFilter) {
      result = result.filter(payment => 
        payment.userName.toLowerCase().includes(paidByFilter.toLowerCase())
      );
    }
    
    setFilteredPayments(result);
  }, [searchTerm, dateRange, paidByFilter, payments]);

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 w-full">
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-2/3">
            <div className="relative flex-1 max-w-md">
              <TextInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search payments by user, amount, or method..."
                className="pr-10"
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
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-1/3">
            <DatePickerInput
              type="range"
              placeholder="Select date range"
              value={dateRange}
              onChange={(newValue) => setDateRange(newValue as [Date | null, Date | null])}
              leftSection={<IconCalendar size={16} />}
              size="md"
              clearable
              className="flex-1"
            />
            
            <TextInput
              value={paidByFilter}
              onChange={(e) => setPaidByFilter(e.target.value)}
              placeholder="Filter by name"
              size="md"
              leftSection={<IconUser size={16} />}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">Payment Records</Text>
          <Text className="text-sm text-gray-500">
            Showing {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
          </Text>
        </div>
        
        <Paper radius="md" withBorder className="overflow-hidden border-gray-100 shadow-sm">
          <Table verticalSpacing="md" horizontalSpacing="xl" className="min-w-full">
            <Table.Thead className="bg-gray-50/50">
              <Table.Tr>
                <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Paid Date</Table.Th>
                <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Paid By</Table.Th>
                <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Paid Amount</Table.Th>
                <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Current Balance</Table.Th>
                <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Payment Method</Table.Th>
                <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Paid ID</Table.Th>
                <Table.Th className="text-gray-400 font-bold text-[10px] uppercase">Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={7} className="text-center py-10">
                    <LoadingOverlay visible={true} overlayProps={{ radius: "sm", blur: 2 }} />
                    <Text className="text-center py-4">Loading payments...</Text>
                  </Table.Td>
                </Table.Tr>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <Table.Tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                    <Table.Td className="font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <IconCalendar size={16} className="text-gray-400" />
                        {payment.date.toLocaleDateString()}
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <div className="flex items-center gap-2">
                        <IconUser size={16} className="text-gray-400" />
                        {payment.userName}
                      </div>
                    </Table.Td>
                    <Table.Td className="font-bold text-gray-800">
                      <div className="flex items-center gap-2">
                        <IconCoin size={16} className="text-gray-400" />
                        Rs. {payment.amount.toFixed(2)}
                      </div>
                    </Table.Td>
                    <Table.Td className="font-bold text-gray-800">
                      <div className="flex items-center gap-2">
                        <IconCoin size={16} className="text-gray-400" />
                        Rs. {payment.newBalance.toFixed(2)}
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={
                          payment.method === 'cash' ? 'blue' : 
                          payment.method === 'bank' ? 'green' : 'orange'
                        }
                        radius="sm"
                        className="font-bold py-3"
                      >
                        {payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <div className="flex items-center gap-2">
                        <IconId size={16} className="text-gray-400" />
                        {payment.id.substring(0, 8)}...
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={payment.isPaid ? 'green' : 'orange'}
                        radius="sm"
                        className="font-bold py-3"
                      >
                        {payment.isPaid ? 'PAID' : 'PARTIAL'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={7} className="text-center py-10 text-gray-500">
                    {(searchTerm || dateRange[0] || dateRange[1] || paidByFilter) ? `No payments found matching your filters` : 'No payments available'}
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      </div>
    </div>
  );
}