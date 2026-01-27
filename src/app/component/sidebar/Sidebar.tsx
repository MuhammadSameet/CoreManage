// --- USER ORIGINAL SIDEBAR (COMMENTED OUT) ---
// "use client";
//
// import * as React from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { styled, Theme, CSSObject } from '@mui/material/styles';
// import {
//   Box,
//   Drawer as MuiDrawer,
//   List,
//   Divider,
//   IconButton,
//   ListItem,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Collapse
// } from '@mui/material';
//
// // --- ICONS ---
// import {
//   Dashboard as DashboardIcon,
//   Mail as MailIcon,
//   Settings as SettingsIcon,
//   ExpandLess,
//   ExpandMore,
//   People as PeopleIcon,
//   AdminPanelSettings as AdminIcon,
//   AccountCircle as ProfileIcon,
//   ChevronLeft as ChevronLeftIcon,
//   ChevronRight as ChevronRightIcon
// } from '@mui/icons-material';
//
// // User Section Import
// import { UserSection } from './UserSection';
//
// const drawerWidth = 240;
// const closedDrawerWidth = 75;
//
// const COLORS = {
//   primary: '#6366f1',
//   activeBg: 'rgba(99, 102, 241, 0.1)',
//   hoverBg: 'rgba(0, 0, 0, 0.04)',
//   textMain: '#4b5563',
//   textActive: '#6366f1',
//   divider: '#e5e7eb'
// };
//
// // --- DRAWER ANIMATIONS ---
// const openedMixin = (theme: Theme): CSSObject => ({
//   width: drawerWidth,
//   transition: theme.transitions.create('width', {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.enteringScreen,
//   }),
//   overflowX: 'hidden',
//   backgroundColor: '#ffffff',
//   display: 'flex', // Flexbox add kiya taaki bottom section work kare
//   flexDirection: 'column',
//   borderRight: `1px solid ${COLORS.divider}`,
// });
//
// const closedMixin = (theme: Theme): CSSObject => ({
//   transition: theme.transitions.create('width', {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.leavingScreen,
//   }),
//   overflowX: 'hidden',
//   width: `${closedDrawerWidth}px`,
//   backgroundColor: '#ffffff',
//   display: 'flex', // Flexbox add kiya
//   flexDirection: 'column',
//   borderRight: `1px solid ${COLORS.divider}`,
// });
//
// const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
//   ({ theme, open }) => ({
//     width: drawerWidth,
//     flexShrink: 0,
//     whiteSpace: 'nowrap',
//     boxSizing: 'border-box',
//     ...(open && {
//       ...openedMixin(theme),
//       '& .MuiDrawer-paper': openedMixin(theme),
//     }),
//     ...(!open && {
//       ...closedMixin(theme),
//       '& .MuiDrawer-paper': closedMixin(theme),
//     }),
//   }),
// );
//
// const DrawerHeader = styled('div')(({ theme }) => ({
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'space-between',
//   padding: theme.spacing(0, 1.5),
//   ...theme.mixins.toolbar,
// }));
//
// export default function Sidebar({ children }: { children: React.ReactNode }) {
//   const [open, setOpen] = React.useState(true);
//   const [openUserMenu, setOpenUserMenu] = React.useState(false);
//   const pathname = usePathname();
//
//   const hiddenSidebarPaths = ['/login', '/signup'];
//   const shouldHideSidebar = hiddenSidebarPaths.includes(pathname);
//
//   const handleDropdownToggle = () => {
//     if (!open) setOpen(true);
//     setOpenUserMenu(!openUserMenu);
//   };
//
//   const getListItemStyle = (isActive: boolean, isSubItem: boolean = false) => ({
//     minHeight: 48,
//     justifyContent: open ? 'initial' : 'center',
//     px: 2.5,
//     mx: isSubItem && !open ? 0 : 1,
//     borderRadius: '10px',
//     mb: 0.5,
//     backgroundColor: isActive ? COLORS.activeBg : 'transparent',
//     color: isActive ? COLORS.textActive : COLORS.textMain,
//     '&:hover': { backgroundColor: COLORS.hoverBg },
//     transition: 'all 0.2s ease',
//   });
//
//   const getIconStyle = (isActive: boolean) => ({
//     minWidth: 0,
//     mr: open ? 3 : 'auto',
//     justifyContent: 'center',
//     color: isActive ? COLORS.primary : 'inherit',
//   });
//
//   if (shouldHideSidebar) {
//     return <Box component="main" sx={{ width: '100%', minHeight: '100vh' }}>{children}</Box>;
//   }
//
//   return (
//     <Box sx={{ display: 'flex' }}>
//       <Drawer variant="permanent" open={open}>
//         {/* HEADER: Brand Logo & Toggle Button */}
//         <DrawerHeader>
//           {open && (
//             <Box sx={{ fontWeight: 800, fontSize: '1.2rem', color: COLORS.primary, ml: 1 }}>
//               FIREBASE APP
//             </Box>
//           )}
//           <IconButton onClick={() => setOpen(!open)}>
//             {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
//           </IconButton>
//         </DrawerHeader>
//
//         <Divider sx={{ opacity: 0.6 }} />
//
//         {/* CENTER SECTION: Scrollable Menu Items */}
//         {/* flexGrow: 1 use kiya hai taaki ye area baki bachi hui space lele */}
//         <Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 1, px: 0.5 }}>
//           <List>
//             {/* Dashboard */}
//             <ListItem disablePadding sx={{ display: 'block' }}>
//               <Link href="/" style={{ textDecoration: 'none' }}>
//                 <ListItemButton sx={getListItemStyle(pathname === '/')}>
//                   <ListItemIcon sx={getIconStyle(pathname === '/')}>
//                     <DashboardIcon />
//                   </ListItemIcon>
//                   <ListItemText primary="Dashboard" sx={{ opacity: open ? 1 : 0 }} />
//                 </ListItemButton>
//               </Link>
//             </ListItem>
//
//             {/* Dropdown Example */}
//             <ListItem disablePadding sx={{ display: 'block' }}>
//               <ListItemButton onClick={handleDropdownToggle} sx={getListItemStyle(openUserMenu)}>
//                 <ListItemIcon sx={getIconStyle(openUserMenu)}>
//                   <PeopleIcon />
//                 </ListItemIcon>
//                 <ListItemText primary="User Management" sx={{ opacity: open ? 1 : 0 }} />
//                 {open && (openUserMenu ? <ExpandLess /> : <ExpandMore />)}
//               </ListItemButton>
//               <Collapse in={openUserMenu && open} timeout="auto" unmountOnExit>
//                 <List component="div" disablePadding>
//                   <Link href="/users" style={{ textDecoration: 'none' }}>
//                     <ListItemButton sx={getListItemStyle(pathname === '/users', true)}>
//                       <ListItemIcon sx={getIconStyle(pathname === '/users')}><ProfileIcon fontSize="small" /></ListItemIcon>
//                       <ListItemText primary="Collection" sx={{ opacity: open ? 1 : 0 }} />
//                     </ListItemButton>
//                   </Link>
//                   <Link href="/users" style={{ textDecoration: 'none' }}>
//                     <ListItemButton sx={getListItemStyle(pathname === '/users', true)}>
//                       <ListItemIcon sx={getIconStyle(pathname === '/users')}><ProfileIcon fontSize="small" /></ListItemIcon>
//                       <ListItemText primary="Data Entry" sx={{ opacity: open ? 1 : 0 }} />
//                     </ListItemButton>
//                   </Link>
//                   <Link href="/users" style={{ textDecoration: 'none' }}>
//                     <ListItemButton sx={getListItemStyle(pathname === '/users', true)}>
//                       <ListItemIcon sx={getIconStyle(pathname === '/users')}><ProfileIcon fontSize="small" /></ListItemIcon>
//                       <ListItemText primary="Users Settings" sx={{ opacity: open ? 1 : 0 }} />
//                     </ListItemButton>
//                   </Link>
//                 </List>
//               </Collapse>
//             </ListItem>
//
//             {/* Messages */}
//             <ListItem disablePadding sx={{ display: 'block' }}>
//               <Link href="/home" style={{ textDecoration: 'none' }}>
//                 <ListItemButton sx={getListItemStyle(pathname === '/home')}>
//                   <ListItemIcon sx={getIconStyle(pathname === '/home')}><MailIcon /></ListItemIcon>
//                   <ListItemText primary="Home" sx={{ opacity: open ? 1 : 0 }} />
//                 </ListItemButton>
//               </Link>
//             </ListItem>
//             <ListItem disablePadding sx={{ display: 'block' }}>
//               <Link href="/about" style={{ textDecoration: 'none' }}>
//                 <ListItemButton sx={getListItemStyle(pathname === '/about')}>
//                   <ListItemIcon sx={getIconStyle(pathname === '/about')}><MailIcon /></ListItemIcon>
//                   <ListItemText primary="About" sx={{ opacity: open ? 1 : 0 }} />
//                 </ListItemButton>
//               </Link>
//             </ListItem>
//           </List>
//         </Box>
//
//         {/* BOTTOM SECTION: User Profile Section */}
//         {/* Divider aur UserSection ko yahan rakha hai taaki ye hamesha niche rahe */}
//         <Divider sx={{ opacity: 0.6 }} />
//         <Box sx={{ py: 1 }}>
//           <UserSection open={open} />
//         </Box>
//       </Drawer>
//
//       {/* MAIN CONTENT AREA */}
//       <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
//         {children}
//       </Box>
//     </Box>
//   );
// }

// --- END USER ORIGINAL SIDEBAR ---

"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import {
  Box,
  Drawer as MuiDrawer,
  List,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';

// --- ICONS ---
import {
  Dashboard as DashboardIcon,
  Mail as MailIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  AccountCircle as ProfileIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

// User Section Import
import { UserSection } from './UserSection';

// --- YAHAN WIDTH BARA DI GAYI HAI ---
const drawerWidth = 280;
const closedDrawerWidth = 75;

const COLORS = {
  primary: '#6366f1',
  activeBg: 'rgba(99, 102, 241, 0.1)',
  hoverBg: 'rgba(0, 0, 0, 0.04)',
  textMain: '#4b5563',
  textActive: '#6366f1',
  divider: '#e5e7eb'
};

// --- DRAWER ANIMATIONS ---
const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  borderRight: `1px solid ${COLORS.divider}`,
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `${closedDrawerWidth}px`,
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  borderRight: `1px solid ${COLORS.divider}`,
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1.5),
  ...theme.mixins.toolbar,
}));

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  const [openUserMenu, setOpenUserMenu] = React.useState(false);
  const pathname = usePathname();

  const hiddenSidebarPaths = ['/login', '/signup'];
  const shouldHideSidebar = hiddenSidebarPaths.includes(pathname);

  const handleDropdownToggle = () => {
    if (!open) setOpen(true);
    setOpenUserMenu(!openUserMenu);
  };

  const getListItemStyle = (isActive: boolean, isSubItem: boolean = false) => ({
    minHeight: 48,
    justifyContent: open ? 'initial' : 'center',
    px: 2.5,
    mx: isSubItem && !open ? 0 : 1,
    borderRadius: '10px',
    mb: 0.5,
    backgroundColor: isActive ? COLORS.activeBg : 'transparent',
    color: isActive ? COLORS.textActive : COLORS.textMain,
    '&:hover': { backgroundColor: COLORS.hoverBg },
    transition: 'all 0.2s ease',
  });

  const getIconStyle = (isActive: boolean) => ({
    minWidth: 0,
    mr: open ? 3 : 'auto',
    justifyContent: 'center',
    color: isActive ? COLORS.primary : 'inherit',
  });

  if (shouldHideSidebar) {
    return <Box component="main" sx={{ width: '100%', minHeight: '100vh' }}>{children}</Box>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer variant="permanent" open={open}>
        {/* HEADER: Brand Logo & Toggle Button */}
        <DrawerHeader>
          {open && (
            <Box sx={{ fontWeight: 800, fontSize: '1.2rem', color: COLORS.primary, ml: 1 }}>
              FIREBASE APP
            </Box>
          )}
          <IconButton onClick={() => setOpen(!open)}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>

        <Divider sx={{ opacity: 0.6 }} />

        {/* CENTER SECTION: Scrollable Menu Items */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 1, px: 0.5 }}>
          <List>
            {/* Dashboard */}
            <ListItem disablePadding sx={{ display: 'block' }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <ListItemButton sx={getListItemStyle(pathname === '/')}>
                  <ListItemIcon sx={getIconStyle(pathname === '/')}>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </Link>
            </ListItem>

            {/* Dropdown Example */}
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton onClick={handleDropdownToggle} sx={getListItemStyle(openUserMenu)}>
                <ListItemIcon sx={getIconStyle(openUserMenu)}>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="User Management" sx={{ opacity: open ? 1 : 0 }} />
                {open && (openUserMenu ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
              <Collapse in={openUserMenu && open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <Link href="/users" style={{ textDecoration: 'none' }}>
                    <ListItemButton sx={getListItemStyle(pathname === '/users', true)}>
                      <ListItemIcon sx={getIconStyle(pathname === '/users')}><ProfileIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Collection" sx={{ opacity: open ? 1 : 0 }} />
                    </ListItemButton>
                  </Link>
                  <Link href="/users" style={{ textDecoration: 'none' }}>
                    <ListItemButton sx={getListItemStyle(pathname === '/users', true)}>
                      <ListItemIcon sx={getIconStyle(pathname === '/users')}><ProfileIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Data Entry" sx={{ opacity: open ? 1 : 0 }} />
                    </ListItemButton>
                  </Link>
                  <Link href="/users" style={{ textDecoration: 'none' }}>
                    <ListItemButton sx={getListItemStyle(pathname === '/users', true)}>
                      <ListItemIcon sx={getIconStyle(pathname === '/users')}><ProfileIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Users Settings" sx={{ opacity: open ? 1 : 0 }} />
                    </ListItemButton>
                  </Link>
                </List>
              </Collapse>
            </ListItem>

            {/* Messages */}
            <ListItem disablePadding sx={{ display: 'block' }}>
              <Link href="/home" style={{ textDecoration: 'none' }}>
                <ListItemButton sx={getListItemStyle(pathname === '/home')}>
                  <ListItemIcon sx={getIconStyle(pathname === '/home')}><MailIcon /></ListItemIcon>
                  <ListItemText primary="Home" sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </Link>
            </ListItem>
            <ListItem disablePadding sx={{ display: 'block' }}>
              <Link href="/about" style={{ textDecoration: 'none' }}>
                <ListItemButton sx={getListItemStyle(pathname === '/about')}>
                  <ListItemIcon sx={getIconStyle(pathname === '/about')}><MailIcon /></ListItemIcon>
                  <ListItemText primary="About" sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </Link>
            </ListItem>
          </List>
        </Box>

        {/* BOTTOM SECTION: User Profile Section */}
        <Divider sx={{ opacity: 0.6 }} />
        <Box sx={{ py: 1 }}>
          <UserSection open={open} />
        </Box>
      </Drawer>

      {/* MAIN CONTENT AREA */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        {children}
      </Box>
    </Box>
  );
}