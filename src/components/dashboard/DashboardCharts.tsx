'use client';

import React, { useEffect, useState } from 'react';
import { LineChart } from '@mantine/charts';
import { Paper, Text, Loader, Stack, Group, Badge } from '@mantine/core';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { IconChartLine } from '@tabler/icons-react';

const formatter = new Intl.NumberFormat('en-PK', {
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function getDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDayLabel(dateKey: string): string {
  const d = new Date(dateKey);
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
}

export function DashboardCharts() {
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState<{ day: string; Paid: number; Unpaid: number; Total: number }[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        // Step 1: Generate last 7 days keys (including today)
        const last7Days: string[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          last7Days.push(getDayKey(d));
        }

        // Step 2: Fetch Payments for "Paid" metrics
        const paymentsSnap = await getDocs(collection(db, 'payments'));
        const paidByDay: Record<string, number> = {};

        paymentsSnap.docs.forEach((docSnap) => {
          const d = docSnap.data();
          const amount = typeof d.amount === 'number' ? d.amount : parseFloat(d.amount) || 0;
          const dateVal = d.date || d.paidByDateTime;
          if (!dateVal) return;
          const date = typeof dateVal === 'string' ? new Date(dateVal) : dateVal?.seconds ? new Date(dateVal.seconds * 1000) : null;
          if (!date || isNaN(date.getTime())) return;

          const key = getDayKey(date);
          if (last7Days.includes(key)) {
            paidByDay[key] = (paidByDay[key] || 0) + amount;
          }
        });

        // Step 3: Fetch balances for "Unpaid" metrics
        const uploadEntrySnap = await getDocs(collection(db, 'uploadEntry'));
        const unpaidByDay: Record<string, number> = {};

        uploadEntrySnap.docs.forEach((docSnap) => {
          const d = docSnap.data();

          // Match stats-actions logic for finding original amount
          const potentialAmountFields = [
            d.Total, d.total, d.Amount, d.amount, d['Total Amount'], d.totalAmount, d.TotalAmount,
            d.total_amount, d.Total_Amount, d.payment, d.Payment, d.paymentAmount, d.PaymentAmount,
            d.payment_amount, d.Payment_Amount, d.fee, d.Fee, d.fees, d.Fees, d.Price, d.price
          ];
          let originalAmount = 0;
          for (const field of potentialAmountFields) {
            if (field !== undefined && field !== null) {
              const parsed = typeof field === 'number' ? field : typeof field === 'string' ? parseFloat(field) || 0 : Number(field) || 0;
              if (parsed !== 0) { originalAmount = parsed; break; }
            }
          }
          if (originalAmount === 0) {
            originalAmount = typeof d.monthlyFees === 'number' ? d.monthlyFees : 0;
          }

          // For the chart, we'll assign the original amount to the day the record was created/updated
          const dateVal = d.uploadedAt || d.createdAt || d.date;
          if (!dateVal) return;
          const date = typeof dateVal === 'string' ? new Date(dateVal) : dateVal?.seconds ? new Date(dateVal.seconds * 1000) : null;
          if (!date || isNaN(date.getTime())) return;

          const key = getDayKey(date);
          if (last7Days.includes(key)) {
            unpaidByDay[key] = (unpaidByDay[key] || 0) + originalAmount;
          }
        });

        if (cancelled) return;

        // Step 4: Format Line Chart Data
        const chartData = last7Days.map((key) => {
          const paid = Math.round(paidByDay[key] || 0);
          const unpaid = Math.round(unpaidByDay[key] || 0);
          return {
            day: getDayLabel(key),
            Paid: paid,
            Unpaid: unpaid,
            Total: paid + unpaid,
          };
        });

        setDailyData(chartData);

      } catch (error) {
        console.error("Dashboard parse error:", error);
        if (!cancelled) {
          setDailyData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="xl" variant="bars" color="blue" />
      </div>
    );
  }

  return (
    <Stack gap="xl" className="w-full">
      <Paper p="xl" radius="lg" withBorder className="w-full border-gray-100 shadow-md bg-white">
        <Group justify="space-between" mb="xl">
          <Group gap="sm">
            <IconChartLine size={24} className="text-blue-600" />
            <Text size="lg" fw={700} className="text-gray-800">
              7-Day Financial Overview
            </Text>
          </Group>
          <Badge variant="light" color="blue" size="lg" radius="sm">Last 7 Days (Daily)</Badge>
        </Group>

        <div className="h-[400px] w-full">
          <LineChart
            h={400}
            data={dailyData}
            dataKey="day"
            withLegend
            legendProps={{ verticalAlign: 'bottom', height: 40 }}
            series={[
              { name: 'Paid', color: 'green.6' },
              { name: 'Unpaid', color: 'orange.6' },
              { name: 'Total', color: 'blue.6' },
            ]}
            curveType="monotone"
            valueFormatter={(value) => `Rs. ${formatter.format(value)}`}
            tickLine="xy"
            gridAxis="xy"
            withDots={true}
            dotProps={{ r: 4 }}
            activeDotProps={{ r: 6 }}
          />
        </div>
      </Paper>
    </Stack>
  );
}
