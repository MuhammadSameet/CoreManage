'use client';

import { useState } from 'react';
import {
    FileInput,
    Button,
    Flex,
    Text as MantineText,
    Paper as MantinePaper,
    Table as MantineTable,
    Badge as MantineBadge,
    LoadingOverlay,
} from '@mantine/core';
import { IconFileSpreadsheet, IconEye, IconUpload, IconCheck, IconClock, IconX } from '@tabler/icons-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { createUserOrUpdateData } from '@/services/userDataService';
import { createMonthlyDataForUser } from '@/utils/monthlyDataUtils';

const Table = MantineTable;
const Text = MantineText;
const Paper = MantinePaper;
const Badge = MantineBadge;

type DataRow = Record<string, string | number | boolean | null | undefined>;

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const isPaid = status?.toLowerCase() === 'paid';
    const isUnpaid = status?.toLowerCase() === 'unpaid';

    return (
        <Badge
            variant="light"
            color={isPaid ? 'green' : isUnpaid ? 'orange' : 'gray'}
            radius="sm"
            leftSection={isPaid ? <IconCheck size={12} /> : isUnpaid ? <IconClock size={12} /> : <IconX size={12} />}
            className="font-bold py-3"
        >
            {isPaid ? 'PAID' : isUnpaid ? 'UNPAID' : status || 'N/A'}
        </Badge>
    );
};

export function NewUploadEntryClient() {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<DataRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Preview button handler - Parse file and show data
    const handlePreview = async () => {
        if (!file) {
            toast.error('Please select a file first!');
            return;
        }

        setLoading(true);
        let data: DataRow[] = [];

        try {
            // CSV parse
            if (file.name.endsWith('.csv')) {
                const text = await file.text();
                const parsed = Papa.parse<DataRow>(text, {
                    header: true,
                    skipEmptyLines: true,
                    transformHeader: (header) => header.trim()
                });
                data = parsed.data as DataRow[];
            }
            // Excel parse
            else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const arrayBuffer = await file.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Get the range of the worksheet
                const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

                // Convert entire sheet to array of arrays first
                const rawArray: (string | number | boolean | null | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                // Find the header row (first row with multiple non-empty values)
                let headerRowIndex = 0;
                for (let i = 0; i < Math.min(5, rawArray.length); i++) {
                    const row = rawArray[i];
                    const nonEmptyCount = row.filter((cell) => cell !== '' && cell !== null && cell !== undefined).length;
                    if (nonEmptyCount >= 3) {
                        headerRowIndex = i;
                        break;
                    }
                }

                // Extract headers and data
                const headers = rawArray[headerRowIndex].map((h) => String(h).trim()).filter((h: string) => h !== '');

                // Convert data rows to objects
                data = [];
                for (let i = headerRowIndex + 1; i < rawArray.length; i++) {
                    const row = rawArray[i];
                    const rowObj: DataRow = {};
                    let hasData = false;

                    headers.forEach((header: string, index: number) => {
                        const value = row[index];
                        rowObj[header] = value !== undefined && value !== null ? value : '';
                        if (value !== '' && value !== null && value !== undefined) {
                            hasData = true;
                        }
                    });

                    if (hasData) {
                        data.push(rowObj);
                    }
                }

            } else {
                toast.warning('Only CSV or Excel files are supported');
                setLoading(false);
                return;
            }

            if (data.length === 0) {
                toast.warning('No data found in the file');
                setLoading(false);
                return;
            }

            setParsedData(data);
            setShowPreview(true);
            toast.success(`Preview loaded! ${data.length} records found.`);
        } catch {
            toast.error('Failed to parse file. Please check the file format.');
        }

        setLoading(false);
    };

    // Submit: if username exists in Data collection, update only date; else save as current behavior
    // const handleSubmit = async () => {
    //     if (parsedData.length === 0) {
    //         toast.error('No data to upload. Please preview the file first!');
    //         return;
    //     }

    //     setLoading(true);
    //     toast.info('Uploading...');

    //     try {
    //         const uploadPromises = parsedData.map(async (row) => {
    //             const username = String(row['Username'] ?? row['username'] ?? row['User ID'] ?? row['id'] ?? '').trim();
    //             const csvDate = row['Date'] ?? row['date'] ?? new Date().toISOString().split('T')[0];

    //             const dataDocRef = doc(db, 'Data', username);
    //             const dataSnap = await getDoc(dataDocRef);

    //             //  if (dataSnap.exists()) {
    //             //         await updateDoc(dataDocRef, { Date: csvDate });
    //             //         return;
    //             //     }

    //             //     await createUserOrUpdateData(row);
    //             //     const { paid, isPaid, status, Price, price, Profit, profit, Total, total, ...cleanRow } = row;
    //             //     const dataToUpload = {
    //             //         ...cleanRow,
    //             //         Price: 0,
    //             //         Profit: 0,
    //             //         Total: 0,
    //             //         isPaid: false,
    //             //         address: (row['Address'] ?? row['address'] ?? 'pakistan') as string,
    //             //         uploadedAt: serverTimestamp(),
    //             //     };

    //             //     const docRef = await addDoc(collection(db, 'uploadEntry'), dataToUpload);
    //             //     await createMonthlyDataForUser(docRef.id, dataToUpload);

    //             //     await setDoc(doc(db, 'Data', username), { ...cleanRow, Date: csvDate });
    //             if (dataSnap.exists()) {
    //                 const masterData = dataSnap.data();

    //                 const newUploadData = {
    //                     username: username,
    //                     name: masterData.name || '',
    //                     address: masterData.address || '',
    //                     package: masterData.package || '',
    //                     amount: masterData.amount || 0,
    //                     Date: csvDate,
    //                     isPaid: false,
    //                     invoiceId: row['Invoice ID'] || '',
    //                     uploadedAt: serverTimestamp(),
    //                 };

    //                 const docRef = await addDoc(collection(db, 'uploadEntry'), newUploadData);

    //                 await createMonthlyDataForUser(docRef.id, newUploadData);

    //                 return;
    //             }

    //         });

    //         await Promise.all(uploadPromises);
    //         toast.success(`Uploaded ${parsedData.length} records.`);

    //         setFile(null);
    //         setParsedData([]);
    //         setShowPreview(false);
    //     } catch (err) {
    //         toast.error('Upload failed. Please try again.');
    //     }

    //     setLoading(false);
    // };
    //chatgpt logic
    const handleSubmit = async () => {
        if (parsedData.length === 0) {
            toast.error('No data to upload. Please preview the file first!');
            return;
        }

        setLoading(true);
        toast.info('Uploading...');

        try {
            const uploadPromises = parsedData.map(async (row) => {
                const username = String(
                    row['Username'] ??
                    row['username'] ??
                    row['User ID'] ??
                    row['id'] ??
                    ''
                ).trim();

                if (!username) return;

                const csvDate =
                    row['Date'] ??
                    row['date'] ??
                    new Date().toISOString().split('T')[0];

                const dataDocRef = doc(db, 'Data', username);
                const dataSnap = await getDoc(dataDocRef);

                let finalData;

                // ✅ EXISTING USER → Copy Edited Master Data
                if (dataSnap.exists()) {
                    const masterData = dataSnap.data();

                    finalData = {
                        username,
                        name: masterData.name || 'N/A',
                        address: masterData.address || 'N/A',
                        package: masterData.package || 'N/A',
                        // amount: masterData.monthlyFees || 0,
                        // monthlyFees: masterData.monthlyFees || 'sameet',
                        // amount: masterData.amount || 0,
                        amount: masterData.monthlyFees || 'sameet',
                        Date: csvDate,
                        invoiceId: row['Invoice ID'] || 'N/A',
                        isPaid: false,
                        uploadedAt: serverTimestamp(),
                    };
                }

                // ✅ NEW USER → First Time Amount = 0
                else {
                    finalData = {
                        username,
                        name: 'N/A',
                        address: 'N/A',
                        package: row['Package'] || 'N/A',
                        amount: 0, // 🔥 ALWAYS ZERO FIRST TIME
                        monthlyFees: 0,
                        Date: csvDate,
                        invoiceId: row['Invoice ID'] || 'N/A',
                        isPaid: false,
                        uploadedAt: serverTimestamp(),
                    };

                    // Create master profile for future
                    await setDoc(dataDocRef, {
                        username,
                        name: 'N/A',
                        address: 'N/A',
                        package: row['Package'] || 'N/A',
                        amount: 0,
                    });
                }

                // 🔥 Always create monthly record
                const docRef = await addDoc(collection(db, 'uploadEntry'), finalData);

                await createMonthlyDataForUser(docRef.id, finalData);
            });

            await Promise.all(uploadPromises);

            toast.success(`Uploaded ${parsedData.length} records.`);

            setFile(null);
            setParsedData([]);
            setShowPreview(false);
        } catch (error) {
            console.error(error);
            toast.error('Upload failed. Please try again.');
        }

        setLoading(false);
    };

    // Filter columns to hide certain fields in preview
    const getFilteredColumns = () => {
        if (parsedData.length === 0) return [];
        const allColumns = Object.keys(parsedData[0]);
        const hiddenColumns = ['Price', 'Profit', 'Total', 'price', 'profit', 'total', 'uploadedAt'];
        return allColumns.filter(col => !hiddenColumns.includes(col));
    };

    // Get display data with isPaid default
    const getDisplayData = () => {
        return parsedData.map(row => ({
            ...row,
            isPaid: row.isPaid || 'unpaid'
        }));
    };

    return (
        <div className="space-y-8">
            <div>
                <Text className="page-heading">Upload Entry</Text>
                <Text className="page-description mt-1">Select a CSV or Excel file to import user entries.</Text>
            </div>

            {/* File Upload Section */}
            <Paper radius="md" withBorder className="p-6 border-gray-200 shadow-sm">
                <Text className="mb-4 font-semibold text-gray-800" style={{ fontSize: 'var(--text-lg)' }}>Select File to Upload</Text>

                <Flex
                    gap="md"
                    align="center"
                    className="w-full flex-col sm:flex-row"
                >
                    <div className="w-full sm:w-auto flex-1 max-w-full sm:max-w-[400px]">
                        <FileInput
                            value={file}
                            onChange={(newFile) => {
                                setFile(newFile);
                                setShowPreview(false);
                                setParsedData([]);
                            }}
                            placeholder="Upload CSV or Excel file"
                            // leftSection={<IconFileSpreadsheet size={18} />}
                            accept=".csv,.xlsx,.xls"
                            radius="md"
                            size="md"
                            classNames={{
                                root: 'w-full',
                                input: 'h-[46px] border-[#1e40af] focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]',
                            }}
                        />
                    </div>

                    <Flex gap="sm" className="w-full sm:w-auto mt-2 sm:mt-0">
                        <Button
                            leftSection={<IconEye size={18} />}
                            radius="md"
                            size="md"
                            disabled={!file || loading}
                            onClick={handlePreview}
                            className={`w-full sm:w-auto h-[48px] px-8 font-bold border-none transition-all duration-200 active:scale-95 ${!file || loading ? 'bg-gray-200 text-gray-400' : 'bg-gradient-to-r from-[#00A5A8] to-[#25C4DD] text-white shadow-md hover:shadow-lg hover:brightness-110'}`}
                        >
                            {loading && !showPreview ? 'Loading...' : 'Preview Data'}
                        </Button>

                        <Button
                            leftSection={<IconUpload size={18} />}
                            radius="md"
                            size="md"
                            disabled={parsedData.length === 0 || loading}
                            onClick={handleSubmit}
                            className={`w-full sm:w-auto h-[48px] px-8 font-bold border-none transition-all duration-200 active:scale-95 ${parsedData.length === 0 || loading ? 'bg-gray-200 text-gray-400' : 'bg-gradient-to-r from-[#10C888] to-[#58E1B5] text-white shadow-md hover:shadow-lg hover:brightness-110'}`}
                        >
                            {loading && showPreview ? 'Uploading...' : 'Submit Records'}
                        </Button>
                    </Flex>
                </Flex>
            </Paper>

            {/* Preview Table - Modern UI Design */}
            {showPreview && parsedData.length > 0 && (
                <div className="w-full">
                    <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                        <div className="w-full flex-1 min-w-0">
                            <div className="w-full flex flex-col md:flex-row md:items-center gap-2">
                                <Text className="text-xl font-bold text-gray-800 break-words">
                                    Data Preview
                                </Text>
                                <Badge color="blue" variant="light" className="text-xs px-3 py-1 flex-shrink-0 mt-1 md:mt-0">
                                    {parsedData.length} {parsedData.length === 1 ? 'record' : 'records'}
                                </Badge>
                            </div>
                        </div>
                        <Text className="text-sm text-gray-500 text-left md:text-right mt-1 md:mt-0 w-auto">
                            Showing {parsedData.length} record{parsedData.length !== 1 ? 's' : ''}
                        </Text>
                    </div>

                    {/* Responsive table container - Always show table with horizontal scrolling */}
                    <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                        <Paper radius="lg" withBorder className="overflow-hidden border-gray-100 shadow-sm min-w-[1000px]">
                            <Table verticalSpacing="md" horizontalSpacing="lg" className="min-w-full">
                                <Table.Thead className="bg-gray-50/50">
                                    <Table.Tr>
                                        <Table.Th className="text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200 py-4" style={{ fontSize: 'var(--text-sm)' }}>
                                            #
                                        </Table.Th>
                                        {getFilteredColumns().map((key) => (
                                            <Table.Th key={key} className="text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200 py-4" style={{ fontSize: 'var(--text-sm)' }}>
                                                {key}
                                            </Table.Th>
                                        ))}
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {getDisplayData().slice(0, 50).map((row, index) => (
                                        <Table.Tr
                                            key={index}
                                            className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-b-0"
                                        >
                                            <Table.Td className="font-bold text-blue-600 py-2 px-1 xs:px-2 sm:px-4 min-w-[40px] xs:min-w-[50px] sm:min-w-[60px]">
                                                {index + 1}
                                            </Table.Td>
                                            {getFilteredColumns().map((key) => {
                                                const value = row[key as keyof typeof row];

                                                // Special formatting for isPaid/status
                                                if (key.toLowerCase() === 'ispaid' || key.toLowerCase() === 'status') {
                                                    return (
                                                        <Table.Td key={key} className="py-2 px-1 xs:px-2 sm:px-4 min-w-[80px] xs:min-w-[90px] sm:min-w-[100px] truncate">
                                                            <StatusBadge status={String(value)} />
                                                        </Table.Td>
                                                    );
                                                }

                                                // Money fields
                                                if (key.toLowerCase().includes('fee') || key.toLowerCase().includes('payment') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('balance')) {
                                                    return (
                                                        <Table.Td key={key} className="py-2 px-1 xs:px-2 sm:px-4 min-w-[80px] xs:min-w-[90px] sm:min-w-[100px] truncate">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs text-gray-400">Rs.</span>
                                                                <span className="font-bold text-gray-900 text-sm">{value || '0'}</span>
                                                            </div>
                                                        </Table.Td>
                                                    );
                                                }

                                                // Name/ID fields
                                                if (key.toLowerCase().includes('name') || key.toLowerCase().includes('user') || key.toLowerCase().includes('id')) {
                                                    return (
                                                        <Table.Td key={key} className="py-2 px-1 xs:px-2 sm:px-4 min-w-[80px] xs:min-w-[90px] sm:min-w-[100px] truncate">
                                                            <Text size="sm" fw={600} className="text-gray-800">
                                                                {value || 'N/A'}
                                                            </Text>
                                                        </Table.Td>
                                                    );
                                                }

                                                // Date fields
                                                if (key.toLowerCase().includes('date')) {
                                                    return (
                                                        <Table.Td key={key} className="py-2 px-1 xs:px-2 sm:px-4 min-w-[80px] xs:min-w-[90px] sm:min-w-[100px] truncate">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-gray-600">{value || '-'}</span>
                                                            </div>
                                                        </Table.Td>
                                                    );
                                                }

                                                // Default
                                                return (
                                                    <Table.Td key={key} className="text-gray-600 text-sm py-2 px-1 xs:px-2 sm:px-4 min-w-[80px] xs:min-w-[90px] sm:min-w-[100px] truncate">
                                                        {value || '-'}
                                                    </Table.Td>
                                                );
                                            })}
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Paper>
                    </div>
                    {parsedData.length > 50 && (
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 text-center border-t border-gray-200">
                            <Text className="text-sm text-gray-600 font-medium">
                                📄 Showing first 50 records out of <span className="font-bold text-blue-600">{parsedData.length}</span> total records
                            </Text>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}