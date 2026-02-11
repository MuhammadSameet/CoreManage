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
} from '@mantine/core';
import { IconFileSpreadsheet, IconEye, IconUpload, IconCheck, IconClock, IconX } from '@tabler/icons-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, addDoc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';
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

export function UploadEntryClient() {
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
                console.log('CSV parsed data:', data);
            }
            // Excel parse
            else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const arrayBuffer = await file.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Get the range of the worksheet
                const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
                console.log('Excel sheet range:', range);

                // Convert entire sheet to array of arrays first
                const rawArray: (string | number | boolean | null | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                console.log('Excel raw array:', rawArray);

                // Find the header row (first row with multiple non-empty values)
                let headerRowIndex = 0;
                for (let i = 0; i < Math.min(5, rawArray.length); i++) {
                    const row = rawArray[i];
                    const nonEmptyCount = row.filter((cell) => cell !== '' && cell !== null && cell !== undefined).length;
                    if (nonEmptyCount >= 3) { // At least 3 columns with data
                        headerRowIndex = i;
                        console.log('Found header row at index:', i, 'Row:', row);
                        break;
                    }
                }

                // Extract headers and data
                const headers = rawArray[headerRowIndex].map((h) => String(h).trim()).filter((h: string) => h !== '');
                console.log('Headers:', headers);

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

                console.log('Excel processed data:', data);
            } else {
                toast.warning('Only CSV or Excel files are supported');
                setLoading(false);
                return;
            }

            console.log('Final parsed data:', data);
            console.log('Total records:', data.length);
            if (data.length > 0) {
                console.log('First record:', data[0]);
                console.log('Column names:', Object.keys(data[0]));
            }

            if (data.length === 0) {
                toast.warning('No data found in the file');
                setLoading(false);
                return;
            }

            setParsedData(data);
            setShowPreview(true);
            toast.success(`Preview loaded! ${data.length} records found.`);
        } catch (err) {
            console.error('Error parsing file:', err);
            toast.error('Failed to parse file. Please check the file format.');
        }

        setLoading(false);
    };

    // Submit button handler - Save data to Firebase
    const handleSubmit = async () => {
        if (parsedData.length === 0) {
            toast.error('No data to upload. Please preview the file first!');
            return;
        }

        setLoading(true);
        toast.info('Uploading data to Firebase...');

        try {
            // Process each row using the new data structure
            const uploadPromises = parsedData.map(async (row) => {
                // Process the row with the new user data structure
                await createUserOrUpdateData(row);

                // Also add to the legacy uploadEntry collection for compatibility
                const { paid, isPaid, status, Price, price, Profit, profit, Total, total, ...cleanRow } = row; // Remove unwanted fields
                const dataToUpload = {
                    ...cleanRow,
                    Price: 0, // Default value for Price
                    Profit: 0, // Default value for Profit
                    Total: 0, // Default value for Total
                    isPaid: false, // Default to unpaid
                    address: 'pakistan', // Add address field with default value
                    uploadedAt: serverTimestamp(),
                };

                // Check if a document with the same user ID already exists in uploadEntry
                const userId = (dataToUpload as Record<string, any>)['User ID'] || (dataToUpload as Record<string, any>)['Username'] || (dataToUpload as Record<string, any>)['username'] || (dataToUpload as Record<string, any>)['id'] || (dataToUpload as Record<string, any>)['ID'];

                if (userId) {
                    // Query for existing document with the same user ID
                    const q = query(collection(db, 'uploadEntry'), where('id', '==', userId));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        // If document exists, update it instead of creating a new one
                        const existingDoc = querySnapshot.docs[0];
                        const docRef = doc(db, 'uploadEntry', existingDoc.id);
                        await updateDoc(docRef, dataToUpload);
                        return docRef;
                    } else {
                        // If document doesn't exist, create a new one
                        const docRef = await addDoc(collection(db, 'uploadEntry'), dataToUpload);

                        // Create corresponding monthly data entry
                        await createMonthlyDataForUser(docRef.id, dataToUpload);

                        return docRef;
                    }
                } else {
                    // If no user ID is provided, create a new document
                    const docRef = await addDoc(collection(db, 'uploadEntry'), dataToUpload);

                    // Create corresponding monthly data entry
                    await createMonthlyDataForUser(docRef.id, dataToUpload);

                    return docRef;
                }
            });

            await Promise.all(uploadPromises);
            toast.success(`Successfully uploaded ${parsedData.length} records to Firebase! 🎉`);

            // Reset state
            setFile(null);
            setParsedData([]);
            setShowPreview(false);
        } catch (err) {
            console.error('Error uploading to Firebase:', err);
            toast.error('Failed to upload data to Firebase. Please try again.');
        }

        setLoading(false);
    };

    // Filter columns to hide Price, Profit, Total
    const getFilteredColumns = () => {
        if (parsedData.length === 0) return [];
        const allColumns = Object.keys(parsedData[0]);
        const hiddenColumns = ['Price', 'Profit', 'Total', 'price', 'profit', 'total'];
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <Text className="text-2xl font-bold text-gray-800">Upload Entry</Text>
            </div>

            {/* File Upload Section */}
            <Paper radius="md" withBorder className="p-6 border-gray-200 shadow-sm">
                <Text className="text-lg font-bold text-gray-800 mb-4">Select File to Upload</Text>

                <Flex
                    gap="md"
                    align="center"
                    className="w-full flex-col md:flex-row"
                >
                    <div className="w-full">
                        <FileInput
                            value={file}
                            onChange={(newFile) => {
                                setFile(newFile);
                                setShowPreview(false);
                                setParsedData([]);
                            }}
                            placeholder="Upload CSV / Excel file"
                            leftSection={<IconFileSpreadsheet size={16} />}
                            accept=".csv,.xlsx,.xls"
                            radius="md"
                            size="md"
                            classNames={{
                                root: 'w-full',
                                input: 'h-[46px] border-[#1e40af]',
                            }}
                        />
                    </div>

                    <Flex gap="sm" className="w-full md:w-auto">
                        <Button
                            leftSection={<IconEye size={16} />}
                            radius="lg"
                            size="md"
                            disabled={!file || loading}
                            onClick={handlePreview}
                            className="flex-1 md:flex-none h-[46px] bg-[#1e40af] hover:bg-[#1e3a8a] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                        >
                            {loading && !showPreview ? 'Loading...' : 'Preview'}
                        </Button>

                        <Button
                            leftSection={<IconUpload size={16} />}
                            radius="lg"
                            size="md"
                            disabled={parsedData.length === 0 || loading}
                            onClick={handleSubmit}
                            className="flex-1 md:flex-none h-[46px] bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                        >
                            {loading && showPreview ? 'Uploading...' : 'Submit'}
                        </Button>
                    </Flex>
                </Flex>
            </Paper>

            {/* Preview Table - Modern UI Design */}
            {showPreview && parsedData.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <Text className="text-xl font-bold text-gray-800">
                            📊 Data Preview
                        </Text>
                        <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                            <Text className="text-sm font-semibold text-blue-700">
                                {parsedData.length} Records Found
                            </Text>
                        </div>
                    </div>

                    <Paper radius="lg" withBorder className="overflow-hidden border-gray-200 shadow-lg">
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-3">
                            <Table verticalSpacing="md" horizontalSpacing="lg" className="min-w-[900px]">
                                <Table.Thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <Table.Tr>
                                        <Table.Th className="text-gray-500 font-bold text-xs uppercase tracking-wider py-4 border-b-2 border-blue-200">
                                            #
                                        </Table.Th>
                                        {getFilteredColumns().map((key) => (
                                            <Table.Th key={key} className="text-gray-500 font-bold text-xs uppercase tracking-wider py-4 border-b-2 border-blue-200">
                                                {key}
                                            </Table.Th>
                                        ))}
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {getDisplayData().slice(0, 50).map((row, index) => (
                                        <Table.Tr
                                            key={index}
                                            className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all duration-200 border-b border-gray-100"
                                        >
                                            <Table.Td className="font-bold text-blue-600 py-4">
                                                {index + 1}
                                            </Table.Td>
                                            {getFilteredColumns().map((key) => {
                                                const value = row[key as keyof typeof row];

                                                // Special formatting for isPaid/status
                                                if (key.toLowerCase() === 'ispaid' || key.toLowerCase() === 'status') {
                                                    return (
                                                        <Table.Td key={key} className="py-4">
                                                            <StatusBadge status={String(value)} />
                                                        </Table.Td>
                                                    );
                                                }

                                                // Money fields
                                                if (key.toLowerCase().includes('fee') || key.toLowerCase().includes('payment') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('balance')) {
                                                    return (
                                                        <Table.Td key={key} className="py-4">
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
                                                        <Table.Td key={key} className="py-4">
                                                            <Text size="sm" fw={600} className="text-gray-800">
                                                                {value || 'N/A'}
                                                            </Text>
                                                        </Table.Td>
                                                    );
                                                }

                                                // Date fields
                                                if (key.toLowerCase().includes('date')) {
                                                    return (
                                                        <Table.Td key={key} className="py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-gray-600">{value || '-'}</span>
                                                            </div>
                                                        </Table.Td>
                                                    );
                                                }

                                                // Default
                                                return (
                                                    <Table.Td key={key} className="text-gray-600 text-sm py-4">
                                                        {value || '-'}
                                                    </Table.Td>
                                                );
                                            })}
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </div>
                        {parsedData.length > 50 && (
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 text-center border-t border-gray-200">
                                <Text className="text-sm text-gray-600 font-medium">
                                    📄 Showing first 50 records out of <span className="font-bold text-blue-600">{parsedData.length}</span> total records
                                </Text>
                            </div>
                        )}
                    </Paper>
                </div>
            )}
        </div>
    );
}


