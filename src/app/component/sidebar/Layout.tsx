// import Sidebar from './Sidebar';
// import { Box } from '@mantine/core';

// export default function Layout({ children }: { children: React.ReactNode }) {
//   return (
//     <Box style={{ display: 'flex', minHeight: '100vh' }}>
//       <Sidebar children={undefined} /> {/* Left sidebar */}
//       <Box style={{ flex: 1, padding: '20px' }}>{children}</Box> {/* Main content */}
//     </Box>
//   );
// }

import Sidebar from './Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // Sidebar component ke andar hi display:flex aur main content ka logic hai
    // Isliye hum sirf Sidebar ko children pass karenge.
    <Sidebar>
      {children}
    </Sidebar>
  );
}
