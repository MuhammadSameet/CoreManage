'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, PieChart } from '@mantine/charts';
import { Paper, Text, Loader, Stack } from '@mantine/core';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const formatter = new Intl.NumberFormat('en-PK', {
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

function getWeekLabel(weekKey: string): string {
  const d = new Date(weekKey);
  return `Wk ${d.getDate()}/${d.getMonth() + 1}`;
}

export function DashboardCharts() {
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<{ week: string; Paid: number; Unpaid: number; Total: number }[]>([]);
  const [totals, setTotals] = useState({ paid: 0, unpaid: 0, total: 0 });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const paymentsSnap = await getDocs(collection(db, 'payments'));
        const paymentsByWeek: Record<string, number> = {};
        let totalPaidToday = 0;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

        paymentsSnap.docs.forEach((docSnap) => {
          const d = docSnap.data();
          const amount = typeof d.amount === 'number' ? d.amount : parseFloat(d.amount) || 0;
          const dateVal = d.date || d.paidByDateTime;
          if (!dateVal) return;
          const date = typeof dateVal === 'string' ? new Date(dateVal) : dateVal?.seconds ? new Date(dateVal.seconds * 1000) : null;
          if (!date || isNaN(date.getTime())) return;

          const key = getWeekKey(date);
          paymentsByWeek[key] = (paymentsByWeek[key] || 0) + amount;

          const timestamp = date.getTime();
          if (timestamp >= startOfToday && timestamp <= endOfToday) {
            totalPaidToday += amount;
          }
        });

        const uploadEntrySnap = await getDocs(collection(db, 'uploadEntry'));
        let totalUnpaidToday = 0;

        uploadEntrySnap.docs.forEach((docSnap) => {
          const d = docSnap.data();
          const balance = typeof d.balance === 'number' ? d.balance : parseFloat(d.balance) || 0;

          // User wants "Today Distribution (1 Day)" for both. 
          // For unpaid, we show current outstanding balances as they are "unpaid as of today".
          totalUnpaidToday += balance;
        });

        if (cancelled) return;

        const sortedWeeks = Object.keys(paymentsByWeek).sort();
        const last6 = sortedWeeks.slice(-6);
        if (last6.length === 0) {
          for (let i = 5; i >= 0; i--) {
            const w = new Date(now);
            w.setDate(w.getDate() - 7 * i);
            last6.push(getWeekKey(w));
          }
        }

        const barData = last6.map((key) => ({
          week: getWeekLabel(key),
          Paid: Math.round(paymentsByWeek[key] || 0),
          Unpaid: key === last6[last6.length - 1] ? Math.round(totalUnpaidToday) : 0,
          Total: Math.round((paymentsByWeek[key] || 0) + (key === last6[last6.length - 1] ? totalUnpaidToday : 0)),
        }));

        setWeeklyData(barData);
        setTotals({ paid: totalPaidToday, unpaid: totalUnpaidToday, total: totalPaidToday + totalUnpaidToday });
      } catch {
        if (!cancelled) {
          setWeeklyData([]);
          setTotals({ paid: 0, unpaid: 0, total: 0 });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const pieData = useMemo(() => {
    const items = [
      { name: 'Paid Today', value: totals.paid, color: 'blue.6' },
      { name: 'Unpaid Today', value: totals.unpaid, color: 'orange.6' },
      { name: 'Total Status', value: totals.total, color: 'teal.6' },
    ].filter((d) => d.value > 0);

    if (items.length === 0) {
      return [
        { name: 'No Data', value: 1, color: 'gray.4' },
      ];
    }
    return items;
  }, [totals]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="md" />
      </div>
    );
  }

  return (
    <Stack gap="xl" className="w-full">
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <Paper p="xl" radius="lg" withBorder className="flex-[1.8] min-w-0 border-gray-100 shadow-sm bg-white">
          <Text size="lg" fw={700} c="gray.8" mb="xl">
            Weekly Payments Overview
          </Text>
          <BarChart
            h={350}
            data={weeklyData}
            dataKey="week"
            series={[
              { name: 'Paid', color: 'violet.6' },
              { name: 'Unpaid', color: 'blue.6' },
              { name: 'Total', color: 'teal.6' },
            ]}
            valueFormatter={(value) => formatter.format(value)}
            withBarValueLabel
            tickLine="none"
            gridAxis="xy"
            style={{ maxWidth: '100%' }}
          />
        </Paper>
        <Paper p="xl" radius="lg" withBorder className="flex-1 min-w-0 border-gray-100 shadow-sm bg-white">
          <Text size="lg" fw={700} c="gray.8" mb="xl">
            Today Distribution (1 Day)
          </Text>
          <div className="flex justify-center items-center h-[350px]">
            <PieChart
              data={pieData}
              withLabelsLine
              size={200}
              withLabels
              labelsPosition="outside"
              labelsType="value"
              valueFormatter={(value) => formatter.format(value)}
              strokeWidth={2}
            />
          </div>
        </Paper>
      </div>
    </Stack>
  );
}
