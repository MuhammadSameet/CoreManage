'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Table, Text, Loader, Badge, Paper, LoadingOverlay, Select } from '@mantine/core';
import { StatsCard } from '@/components/dashboard/StatsCard';

type PaymentRecord = {
  id: string;
  userId: string;
  username: string;
  userName: string;
  date: string;
  paidByTime?: string;
  paidByName: string;
  amount: number;
  balance: number;
  method: string;
  isPaid: boolean;
  recordType: 'payment';
  [key: string]: unknown;
};

/**
 * Admin & Employee only. Same UI as /users/detail but filters by paidByName (payments collected by me).
 * Separate file so user detail and admin/employee logic are not mixed.
 */
export default function CollectionsPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.authStates);
  const role = (isAuthenticated as { role?: string })?.role?.toLowerCase() || 'user';

  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [dataTypes, setDataTypes] = useState<string[]>(['all']);
  const [currentName, setCurrentName] = useState('');

  useEffect(() => {
    if (role === 'user') {
      router.replace('/users/detail');
      return;
    }
  }, [role, router]);

  useEffect(() => {
    if (role !== 'admin' && role !== 'employee') return;

    const fetchData = async () => {
      if (!isAuthenticated?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let loggedInName = (isAuthenticated as { name?: string })?.name || '';
        const loggedInUsername = (isAuthenticated as { username?: string })?.username || '';

        const userDocRef = doc(db, 'Users', isAuthenticated.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const d = userSnap.data();
          loggedInName = d.name || d.Name || d.username || d.Username || loggedInName;
        }
        const nameToMatch = (loggedInName || loggedInUsername).toLowerCase().trim();
        setCurrentName(loggedInName || loggedInUsername || 'Me');

        const paymentsQuery = query(collection(db, 'payments'), orderBy('date', 'desc'));
        const snapshot = await getDocs(paymentsQuery);
        const data: PaymentRecord[] = [];

        const convertToDateStr = (timestamp: unknown): string => {
          if (timestamp && typeof timestamp === 'object' && 'seconds' in (timestamp as object)) {
            return new Date((timestamp as { seconds: number }).seconds * 1000).toISOString().split('T')[0];
          }
          return typeof timestamp === 'string' ? timestamp.split('T')[0] : new Date().toISOString().split('T')[0];
        };
        const getNum = (v: unknown, def = 0) =>
          typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) || def : def;

        for (const paymentDoc of snapshot.docs) {
          const d = paymentDoc.data();
          const paidByNameStr = (d.paidByName && typeof d.paidByName === 'string' ? d.paidByName : '').toLowerCase().trim();
          if (!nameToMatch || paidByNameStr !== nameToMatch) continue;

          let username = 'N/A';
          if (d.userId) {
            try {
              const uRef = doc(db, 'uploadEntry', d.userId);
              const uSnap = await getDoc(uRef);
              if (uSnap.exists()) {
                const u = uSnap.data();
                username = u.username || u.Username || u.name || u.Name || d.userId;
              }
            } catch {
              username = d.userId;
            }
          }

          data.push({
            id: paymentDoc.id,
            userId: d.userId || 'N/A',
            username,
            userName: d.userName || 'N/A',
            date: convertToDateStr(d.date),
            paidByTime: d.paidByDateTime || d.paidByTime,
            paidByName: d.paidByName || 'System',
            amount: getNum(d.amount, 0),
            balance: getNum(d.newBalance, 0) || getNum(d.balance, 0),
            method: typeof d.method === 'string' ? d.method : 'cash',
            isPaid: !!d.isPaid,
            recordType: 'payment',
            ...d,
          });
        }

        setPaymentRecords(data);
      } catch {
        setPaymentRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, role]);

  const filteredRecords = paymentRecords.filter((record) => {
    let matchesDate = true;
    if (dateRange[0] || dateRange[1]) {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      if (dateRange[0] && dateRange[1]) {
        const start = new Date(dateRange[0]);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateRange[1]);
        end.setHours(23, 59, 59, 999);
        matchesDate = recordDate >= start && recordDate <= end;
      } else if (dateRange[0]) {
        const start = new Date(dateRange[0]);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateRange[0]);
        end.setHours(23, 59, 59, 999);
        matchesDate = recordDate >= start && recordDate <= end;
      } else if (dateRange[1]) {
        const start = new Date(dateRange[1]);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateRange[1]);
        end.setHours(23, 59, 59, 999);
        matchesDate = recordDate >= start && recordDate <= end;
      }
    }
    let matchesStatus = true;
    if (dataTypes[0] && dataTypes[0] !== 'all') {
      matchesStatus = dataTypes[0] === 'paid' ? record.isPaid : !record.isPaid;
    }
    return matchesDate && matchesStatus;
  });

  const totalAmountPaid = filteredRecords.reduce((s, r) => s + r.amount, 0);
  const formatCurrency = (amount: number) => `Rs. ${amount.toFixed(2)}`;

  if (role === 'user') {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="xl" />
      </div>
    );
  }

  if (loading && paymentRecords.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Text className="text-2xl font-bold text-gray-800">Collections</Text>
        <Text className="text-gray-600">Payments collected by you</Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total Collected" value={formatCurrency(totalAmountPaid)} variant="green" />
        <StatsCard title="Records" value={String(filteredRecords.length)} variant="blue" />
      </div>

      <Paper radius="lg" withBorder className="p-6 bg-white border-gray-200 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Text size="sm" className="mb-1 text-gray-600 font-medium">Start Date</Text>
            <input
              type="date"
              value={dateRange[0] ? new Date(dateRange[0]).toISOString().split('T')[0] : ''}
              onChange={(e) => setDateRange([e.target.value ? new Date(e.target.value) : null, dateRange[1]])}
              className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            />
          </div>
          <div>
            <Text size="sm" className="mb-1 text-gray-600 font-medium">End Date</Text>
            <input
              type="date"
              value={dateRange[1] ? new Date(dateRange[1]).toISOString().split('T')[0] : ''}
              onChange={(e) => setDateRange([dateRange[0], e.target.value ? new Date(e.target.value) : null])}
              className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            />
          </div>
          <div>
            <Text size="sm" className="mb-2 text-gray-600 font-medium">Status</Text>
            <Select
              value={dataTypes[0]}
              onChange={(v) => setDataTypes(v ? [v] : ['all'])}
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
      </Paper>

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <Text className="text-xl font-bold text-gray-800">Payment records</Text>
          <Badge color="blue" variant="light">{filteredRecords.length} records</Badge>
        </div>
        <div className="overflow-x-auto">
          <Paper radius="md" withBorder className="overflow-hidden border-gray-100 shadow-sm">
            <Table verticalSpacing="sm" horizontalSpacing="md" className="min-w-full">
              <Table.Thead className="bg-gray-50/50">
                <Table.Tr>
                  <Table.Th className="text-gray-500 font-semibold text-xs uppercase py-3">User</Table.Th>
                  <Table.Th className="text-gray-500 font-semibold text-xs uppercase py-3">Name</Table.Th>
                  <Table.Th className="text-gray-500 font-semibold text-xs uppercase py-3">Date</Table.Th>
                  <Table.Th className="text-gray-500 font-semibold text-xs uppercase py-3">Paid by</Table.Th>
                  <Table.Th className="text-gray-500 font-semibold text-xs uppercase py-3">Amount</Table.Th>
                  <Table.Th className="text-gray-500 font-semibold text-xs uppercase py-3">Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredRecords.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6} className="text-center py-10 text-gray-500">
                      No payment records found
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredRecords.map((record) => (
                    <Table.Tr key={record.id} className="border-b border-gray-100 last:border-b-0">
                      <Table.Td className="font-medium text-gray-700">{record.username}</Table.Td>
                      <Table.Td>{record.userName}</Table.Td>
                      <Table.Td>{record.date}</Table.Td>
                      <Table.Td>{record.paidByName}</Table.Td>
                      <Table.Td className="font-semibold">Rs. {record.amount.toFixed(2)}</Table.Td>
                      <Table.Td>
                        <Badge variant="light" color={record.isPaid ? 'green' : 'orange'} size="sm">
                          {record.isPaid ? 'PAID' : 'UNPAID'}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </div>
      </div>
    </div>
  );
}
