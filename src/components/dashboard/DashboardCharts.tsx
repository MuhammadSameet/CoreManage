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
        let totalPaid = 0;
        paymentsSnap.docs.forEach((docSnap) => {
          const d = docSnap.data();
          const amount = typeof d.amount === 'number' ? d.amount : parseFloat(d.amount) || 0;
          const dateVal = d.date || d.paidByDateTime;
          if (!dateVal) return;
          const date = typeof dateVal === 'string' ? new Date(dateVal) : dateVal?.seconds ? new Date(dateVal.seconds * 1000) : null;
          if (!date || isNaN(date.getTime())) return;
          const key = getWeekKey(date);
          paymentsByWeek[key] = (paymentsByWeek[key] || 0) + amount;
          totalPaid += amount;
        });

        const uploadEntrySnap = await getDocs(collection(db, 'uploadEntry'));
        let totalUnpaid = 0;
        uploadEntrySnap.docs.forEach((docSnap) => {
          const d = docSnap.data();
          const balance = typeof d.balance === 'number' ? d.balance : parseFloat(d.balance) || 0;
          totalUnpaid += balance;
        });

        if (cancelled) return;

        const sortedWeeks = Object.keys(paymentsByWeek).sort();
        const last6 = sortedWeeks.slice(-6);
        if (last6.length === 0) {
          const now = new Date();
          for (let i = 5; i >= 0; i--) {
            const w = new Date(now);
            w.setDate(w.getDate() - 7 * i);
            last6.push(getWeekKey(w));
          }
        }
        const barData = last6.map((key) => ({
          week: getWeekLabel(key),
          Paid: Math.round(paymentsByWeek[key] || 0),
          Unpaid: key === last6[last6.length - 1] ? Math.round(totalUnpaid) : 0,
          Total: Math.round((paymentsByWeek[key] || 0) + (key === last6[last6.length - 1] ? totalUnpaid : 0)),
        }));
        setWeeklyData(barData);
        setTotals({ paid: totalPaid, unpaid: totalUnpaid, total: totalPaid + totalUnpaid });
      } catch {
        if (!cancelled) {
          setWeeklyData([
            { week: 'Wk 1', Paid: 0, Unpaid: 0, Total: 0 },
            { week: 'Wk 2', Paid: 0, Unpaid: 0, Total: 0 },
          ]);
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
      { name: 'Paid', value: totals.paid, color: 'violet.6' },
      { name: 'Unpaid', value: totals.unpaid, color: 'blue.6' },
    ].filter((d) => d.value > 0);
    if (items.length === 0) {
      return [
        { name: 'Paid', value: 1, color: 'violet.6' },
        { name: 'Unpaid', value: 1, color: 'blue.6' },
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
    <Stack gap="lg" className="w-full">
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <Paper p="md" radius="md" withBorder className="flex-1 min-w-0 border-gray-100 shadow-sm">
          <Text size="sm" fw={600} c="dimmed" mb="sm" style={{ fontSize: 'var(--text-sm)' }}>
            Weekly amounts
          </Text>
          <BarChart
            h={280}
            data={weeklyData}
            dataKey="week"
            series={[
              { name: 'Paid', color: 'violet.6' },
              { name: 'Unpaid', color: 'blue.6' },
              { name: 'Total', color: 'teal.6' },
            ]}
            valueFormatter={(value) => formatter.format(value)}
            style={{ maxWidth: '100%' }}
          />
        </Paper>
        <Paper p="md" radius="md" withBorder className="flex-1 min-w-0 border-gray-100 shadow-sm">
          <Text size="sm" fw={600} c="dimmed" mb="sm" style={{ fontSize: 'var(--text-sm)' }}>
            Amounts breakdown
          </Text>
          <div className="flex justify-center">
            <PieChart
              data={pieData}
              withLabels
              labelsPosition="outside"
              labelsType="value"
              withLabelsLine
              size={260}
              valueFormatter={(value) => formatter.format(value)}
            />
          </div>
        </Paper>
      </div>
    </Stack>
  );
}
