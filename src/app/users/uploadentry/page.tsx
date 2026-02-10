import React from 'react';
import { NewUploadEntryClient } from './NewUploadEntryClient';

// Server Component - Main Page
export default function UploadEntryPage() {
  // Yahan aap future mein server-side data fetch kar sakte hain
  // Example: const data = await fetchUploadEntries();

  return <NewUploadEntryClient />;
}