'use client';

import { useState } from 'react';
import { FileInput, Button, Flex } from '@mantine/core';
import { IconFileSpreadsheet, IconSend } from '@tabler/icons-react';

export default function FileUploadRow() {
  const [file, setFile] = useState<File | null>(null);

  // Sidebar theme color
  const themeColor = '#113a8f';

  return (
    <div className="w-full">
      <Flex
        gap="md"
        align="center"
        className={`w-full flex-col md:flex-row bg-white dark:bg-gray-900 p-5 rounded-2xl border border-[${themeColor}] shadow-sm`}
      >
        {/* File Upload */}
        <div className="w-full">
          <FileInput
            value={file}
            onChange={setFile}
            placeholder="Upload Excel file"
            leftSection={<IconFileSpreadsheet size={16} />}
            accept=".xlsx,.xls"
            radius="md"
            size="md"
            classNames={{
              root: 'w-full',
              input: `h-[46px] border-[${themeColor}] dark:bg-gray-900 dark:text-white`,
            }}
          />
        </div>

        {/* Submit Button */}
        <Button
          leftSection={<IconSend size={16} />}
          radius="lg"
          size="md"
          disabled={!file}
          className={`w-full md:w-[190px] h-[46px] bg-[${themeColor}] hover:bg-[#0e3179] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed border-[${themeColor}]`}
        >
          Submit
        </Button>
      </Flex>
    </div>
  );
}
