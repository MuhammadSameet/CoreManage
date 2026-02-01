

// 'use client';

// import { useState } from 'react';
// import Papa from 'papaparse';
// import { FileInput, Button, Flex } from '@mantine/core';
// import { IconFileSpreadsheet, IconSend } from '@tabler/icons-react';
// import * as XLSX from 'xlsx';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '@/lib/firebase';


// export default async function FileUploadRow() {

//     const [file, setFile] = useState<File | null>(null);
//     const text = await file.text();
//     const data = Papa.parse(text, { header: true }).data;
//     const arrayBuffer = await file.arrayBuffer();
//     const workbook = XLSX.read(arrayBuffer, { type: 'array' });
//     const sheetName = workbook.SheetNames[0]; // First sheet
//     const worksheet = workbook.Sheets[sheetName];
//     const excelData = XLSX.utils.sheet_to_json(worksheet);


//     const batchPromises = data.map(row =>
//         addDoc(collection(db, 'excelData'), {
//             ...row,
//             uploadedAt: serverTimestamp(),
//         })
//     );

//     await Promise.all(batchPromises);

//     function handleUpload(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
//         throw new Error('Function not implemented.');
//     }

//     return (
//         <div className="w-full">
//             <Flex
//                 gap="md"
//                 align="center"
//                 className="w-full flex-col md:flex-row bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
//                 {/* File Upload */}
//                 <div className="w-full">
//                     <FileInput
//                         value={file}
//                         onChange={setFile}
//                         placeholder="Upload Excel file"
//                         leftSection={<IconFileSpreadsheet size={16} />}
//                         accept=".xlsx,.xls"
//                         radius="md"
//                         size="md"
//                         classNames={{
//                             root: 'w-full',
//                             input: 'h-[46px] dark:bg-gray-900 dark:text-white',
//                         }}
//                     />
//                 </div>

//                 {/* Submit Button */}
//                 <Button
//                     leftSection={<IconSend size={16} />}
//                     radius="lg"
//                     size="md"
//                     disabled={!file}
//                     className="w-full md:w-[190px] h-[46px] bg-[#113a8f] hover:bg-[#0e3179] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:bg-[#113a8f]disabled:shadow-none disabled:cursor-not-allowed"
//                     disabled={!file || loading}
//                     onClick={handleUpload}
//                 >
//                     {loading ? 'Uploading...' : 'Submit'}
//                 </Button>
//             </Flex>
//         </div>
//     );
// }


// 'use client';

// import { useState } from 'react';
// import { FileInput, Button, Flex } from '@mantine/core';
// import { IconFileSpreadsheet, IconSend } from '@tabler/icons-react';
// import Papa from 'papaparse';
// import * as XLSX from 'xlsx';
// import { db } from '@/lib/firebase';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// export default function FileUploadRow() {
//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleUpload = async () => {
//     if (!file) return;
//     setLoading(true);

//     try {
//       let data: any[] = [];

//       // 1️⃣ CSV parsing
//       if (file.name.endsWith('.csv')) {
//         const text = await file.text();
//         data = Papa.parse(text, { header: true }).data;
//       } 
//       // 2️⃣ Excel parsing
//       else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
//         const arrayBuffer = await file.arrayBuffer();
//         const workbook = XLSX.read(arrayBuffer, { type: 'array' });
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         data = XLSX.utils.sheet_to_json(worksheet);
//       } 
//       // 3️⃣ Unsupported file
//       else {
//         alert('Only CSV or Excel files are supported');
//         setLoading(false);
//         return;
//       }

//       console.log('Parsed Data:', data);

//       // Save each row as a Firestore document
//       const batchPromises = data.map(row =>
//         addDoc(collection(db, 'uploadEntry'), {
//           ...row,
//           uploadedAt: serverTimestamp(),
//         })
//       );

//       await Promise.all(batchPromises);

//       alert('File data uploaded to Firebase successfully!');
//       setFile(null);
//     } catch (err) {
//       console.error(err);
//       alert('Failed to upload file data');
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="w-full">
//       <Flex
//         gap="md"
//         align="center"
//         className="w-full flex-col md:flex-row bg-white dark:bg-gray-900 p-5 rounded-2xl border border-[#113a8f] shadow-sm"
//       >
//         {/* File Input */}
//         <div className="w-full">
//           <FileInput
//             value={file}
//             onChange={setFile}
//             placeholder="Upload CSV / Excel file"
//             leftSection={<IconFileSpreadsheet size={16} />}
//             accept=".csv,.xlsx,.xls"
//             radius="md"
//             size="md"
//             classNames={{
//               root: 'w-full',
//               input: 'h-[46px] dark:bg-gray-900 dark:text-white border-[#113a8f]',
//             }}
//           />
//         </div>

//         {/* Submit Button */}
//         <Button
//           leftSection={<IconSend size={16} />}
//           radius="lg"
//           size="md"
//           disabled={!file || loading}
//           onClick={handleUpload}
//           className="w-full md:w-[190px] h-[46px] bg-[#113a8f] hover:bg-[#0e3179] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
//         >
//           {loading ? 'Uploading...' : 'Submit'}
//         </Button>
//       </Flex>
//     </div>
//   );
// }


// 'use client';

// import { useState } from 'react';
// import { FileInput, Button, Flex } from '@mantine/core';
// import { IconFileSpreadsheet, IconSend, IconList } from '@tabler/icons-react';
// import Papa from 'papaparse';
// import * as XLSX from 'xlsx';
// import { db } from '@/lib/firebase';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// export default function FileUploadRow() {
//   const [file, setFile] = useState<File | null>(null);
//   const [parsedData, setParsedData] = useState<Record<string, any>[]>([]);
//   const [loading, setLoading] = useState(false);

//   // Parse file
//   const handlePreview = async () => {
//     if (!file) return;

//     let data: Record<string, any>[] = [];

//     if (file.name.endsWith('.csv')) {
//       const text = await file.text();
//       data = Papa.parse<Record<string, any>>(text, { header: true }).data as Record<string, any>[];
//     } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
//       const arrayBuffer = await file.arrayBuffer();
//       const workbook = XLSX.read(arrayBuffer, { type: 'array' });
//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];
//       data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
//     } else {
//       alert('Only CSV or Excel files are supported');
//       return;
//     }

//     setParsedData(data);
//   };

//   // Upload data to Firebase
//   const handleUpload = async () => {
//     if (!parsedData.length) return;
//     setLoading(true);

//     try {
//       const batchPromises = parsedData.map(row =>
//         addDoc(collection(db, 'uploadEntry'), {
//           ...row,
//           uploadedAt: serverTimestamp(),
//         })
//       );

//       await Promise.all(batchPromises);
//       alert('Data uploaded to Firebase successfully!');
//       setFile(null);
//       setParsedData([]);
//     } catch (err) {
//       console.error(err);
//       alert('Failed to upload data');
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="w-full space-y-4">
//       <Flex
//         gap="md"
//         align="center"
//         className="w-full flex-col md:flex-row bg-white dark:bg-gray-900 p-5 rounded-2xl border border-[#113a8f] shadow-sm"
//       >
//         {/* File Input */}
//         <div className="w-full">
//           <FileInput
//             value={file}
//             onChange={setFile}
//             placeholder="Upload CSV / Excel file"
//             leftSection={<IconFileSpreadsheet size={16} />}
//             accept=".csv,.xlsx,.xls"
//             radius="md"
//             size="md"
//             classNames={{
//               root: 'w-full',
//               input: 'h-[46px] dark:bg-gray-900 dark:text-white border-[#113a8f]',
//             }}
//           />
//         </div>

//         {/* Buttons */}
//         <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
//           <Button
//             leftSection={<IconList size={16} />}
//             radius="lg"
//             size="md"
//             disabled={!file}
//             onClick={handlePreview}
//             className="flex-1 md:flex-none h-[46px] bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200"
//           >
//             Preview Data
//           </Button>

//           <Button
//             leftSection={<IconSend size={16} />}
//             radius="lg"
//             size="md"
//             disabled={!parsedData.length || loading}
//             onClick={handleUpload}
//             className="flex-1 md:flex-none h-[46px] bg-[#113a8f] hover:bg-[#0e3179] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
//           >
//             {loading ? 'Uploading...' : 'Upload Data'}
//           </Button>
//         </div>
//       </Flex>

//       {/* Preview Table */}
//       {parsedData.length > 0 && (
//         <div className="overflow-auto max-h-96 border border-gray-300 dark:border-gray-700 rounded-lg">
//           <table className="min-w-full border-collapse">
//             <thead className="bg-gray-100 dark:bg-gray-800">
//               <tr>
//                 {Object.keys(parsedData[0]).map((key, index) => (
//                   <th
//                     key={index}
//                     className="px-2 py-1 text-left border-b border-gray-300 dark:border-gray-700"
//                   >
//                     {key}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {parsedData.map((row, rowIndex) => (
//                 <tr
//                   key={rowIndex}
//                   className="hover:bg-gray-200 dark:hover:bg-gray-700"
//                 >
//                   {Object.values(row).map((value, colIndex) => (
//                     <td
//                       key={colIndex}
//                       className="px-2 py-1 border-b border-gray-300 dark:border-gray-700"
//                     >
//                       {String(value ?? '')}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
import { FileInput, Button, Flex } from '@mantine/core';
import { IconFileSpreadsheet, IconSend } from '@tabler/icons-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type DataRow = Record<string, string | number | boolean | null | undefined>;

export default function FileUploadRow({
  onDataUploaded,
}: {
  onDataUploaded: (data: DataRow[]) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    let data: DataRow[] = [];

    // CSV parse
    if (file.name.endsWith('.csv')) {
      const text = await file.text();
      data = Papa.parse<DataRow>(text, { header: true }).data as DataRow[];
    }
    // Excel parse
    else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json<DataRow>(worksheet);
    } else {
      alert('Only CSV or Excel files are supported');
      setLoading(false);
      return;
    }

    // Upload to Firebase
    try {
      const batchPromises = data.map(row =>
        addDoc(collection(db, 'uploadEntry'), {
          ...row,
          uploadedAt: serverTimestamp(),
        })
      );

      await Promise.all(batchPromises);
      alert('Data uploaded successfully!');
      setFile(null);

      // Send uploaded data to parent for preview table
      onDataUploaded(data);
    } catch (err: unknown) {
      console.error(err);
      alert('Failed to upload data');
    }

    setLoading(false);
  };

  return (
    <Flex
      gap="md"
      align="center"
      className="w-full flex-col md:flex-row bg-white dark:bg-gray-900 p-5 rounded-2xl border border-[#113a8f] shadow-sm"
    >
      <div className="w-full">
        <FileInput
          value={file}
          onChange={setFile}
          placeholder="Upload CSV / Excel file"
          leftSection={<IconFileSpreadsheet size={16} />}
          accept=".csv,.xlsx,.xls"
          radius="md"
          size="md"
          classNames={{
            root: 'w-full',
            input: 'h-[46px] dark:bg-gray-900 dark:text-white border-[#113a8f]',
          }}
        />
      </div>

      <Button
        leftSection={<IconSend size={16} />}
        radius="lg"
        size="md"
        disabled={!file || loading}
        onClick={handleUpload}
        className="flex-1 md:flex-none h-[46px] bg-[#113a8f] hover:bg-[#0e3179] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
      >
        {loading ? 'Uploading...' : 'Upload & Preview'}
      </Button>
    </Flex>
  );
}
