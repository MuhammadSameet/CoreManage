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
  Collapse,
  Typography,
} from '@mui/material';

// --- ICONS ---
import {
  Dashboard as DashboardIcon,
  ExpandLess,
  ExpandMore,
  People as PeopleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ManageAccounts as ManageAccountsIcon,
  ReceiptLong as ReceiptIcon,
  ContactSupport as SupportIcon,
  Badge as IDBadgeIcon
} from '@mui/icons-material';

// User Section Import
import { UserSection } from './UserSection';
import { CreationModals } from '@/components/dashboard/CreationModals';

const drawerWidth = 280;
const closedDrawerWidth = 80;

const COLORS = {
  primary: '#6366f1',
  activeBg: 'rgba(99, 102, 241, 0.08)',
  hoverBg: 'rgba(0, 0, 0, 0.02)',
  textMain: '#64748b',
  textActive: '#4f46e5',
  divider: '#f1f5f9'
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
  padding: theme.spacing(0, 2.5),
  minHeight: 80,
  ...theme.mixins.toolbar,
}));

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({
    user: false,
    payment: false,
    employee: false
  });

  const [creationModal, setCreationModal] = React.useState<{ opened: boolean; type: 'user' | 'employee' | 'attendance' }>({
    opened: false,
    type: 'user'
  });

  const pathname = usePathname();

  const handleToggle = (menu: string) => {
    if (!open) {
      setOpen(true);
      setOpenMenus({ ...openMenus, [menu]: true });
    } else {
      setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
    }
  };

  const isPathActive = (path: string) => pathname === path;

  const mainItemStyle = (isActive: boolean) => ({
    minHeight: 52,
    px: 2.5,
    mx: 1.5,
    borderRadius: '12px',
    mb: 0.8,
    backgroundColor: isActive ? COLORS.activeBg : 'transparent',
    color: isActive ? COLORS.textActive : COLORS.textMain,
    '&:hover': {
      backgroundColor: COLORS.hoverBg,
      color: COLORS.primary,
      '& .MuiListItemIcon-root': { color: COLORS.primary }
    },
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  });

  const subItemStyle = (isActive: boolean) => ({
    minHeight: 44,
    pl: 7,
    pr: 2,
    mx: 1.5,
    borderRadius: '10px',
    mb: 0.4,
    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
    color: isActive ? COLORS.textActive : COLORS.textMain,
    '&:hover': { color: COLORS.primary, backgroundColor: '#fcfcfc' },
    '& .MuiTypography-root': {
      fontSize: '0.875rem',
      fontWeight: isActive ? 700 : 500,
    }
  });

  const iconStyle = (isActive: boolean) => ({
    minWidth: 0,
    mr: open ? 2 : 'auto',
    justifyContent: 'center',
    color: isActive ? COLORS.primary : 'inherit',
    '& svg': { fontSize: '1.4rem' }
  });

  if (['/login', '/signup'].includes(pathname)) {
    return <Box component="main" sx={{ width: '100%', minHeight: '100vh' }}>{children}</Box>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, opacity: open ? 1 : 0, transition: 'opacity 0.2s' }}>
            <Box sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: COLORS.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <DashboardIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
              CoreManage
            </Typography>
          </Box>
          <IconButton onClick={() => setOpen(!open)} sx={{ color: COLORS.textMain }}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>

        <Divider sx={{ opacity: 0.4, mb: 1, mx: 2 }} />

        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 0.5, py: 1 }}>
          <List disablePadding>
            {/* Dashboard Link */}
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton component={Link} href="/" sx={mainItemStyle(isPathActive('/'))}>
                <ListItemIcon sx={iconStyle(isPathActive('/'))}><DashboardIcon /></ListItemIcon>
                <ListItemText primary="Dashboard Overview" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>

            {/* Section Header */}
            {open && <Typography variant="caption" sx={{ px: 4, py: 1.5, display: 'block', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}>Organization</Typography>}

            {/* User Management Dropdown */}
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton onClick={() => handleToggle('user')} sx={mainItemStyle(openMenus.user)}>
                <ListItemIcon sx={iconStyle(openMenus.user)}><PeopleIcon /></ListItemIcon>
                <ListItemText primary="User Management" sx={{ opacity: open ? 1 : 0 }} />
                {open && (openMenus.user ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
              <Collapse in={openMenus.user && open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ position: 'relative', '&::before': { content: '""', position: 'absolute', left: 34, top: 0, bottom: 10, width: '1.5px', bgcolor: COLORS.divider } }}>
                  <ListItemButton component={Link} href="/users" sx={subItemStyle(isPathActive('/users'))}>
                    <ListItemText primary="Users Directory" />
                  </ListItemButton>
                  <ListItemButton onClick={() => setCreationModal({ opened: true, type: 'user' })} sx={subItemStyle(false)}>
                    <ListItemText primary="Register New User" />
                  </ListItemButton>
                  <ListItemButton component={Link} href="/users/roles" sx={subItemStyle(isPathActive('/users/roles'))}>
                    <ListItemText primary="Access Controls" />
                  </ListItemButton>
                </List>
              </Collapse>
            </ListItem>

            {/* Employees Dropdown */}
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton onClick={() => handleToggle('employee')} sx={mainItemStyle(openMenus.employee)}>
                <ListItemIcon sx={iconStyle(openMenus.employee)}><IDBadgeIcon /></ListItemIcon>
                <ListItemText primary="Employee Portal" sx={{ opacity: open ? 1 : 0 }} />
                {open && (openMenus.employee ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
              <Collapse in={openMenus.employee && open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ position: 'relative', '&::before': { content: '""', position: 'absolute', left: 34, top: 0, bottom: 10, width: '1.5px', bgcolor: COLORS.divider } }}>
                  <ListItemButton component={Link} href="/employees" sx={subItemStyle(isPathActive('/employees'))}>
                    <ListItemText primary="Staff Roster" />
                  </ListItemButton>
                  <ListItemButton onClick={() => setCreationModal({ opened: true, type: 'attendance' })} sx={subItemStyle(false)}>
                    <ListItemText primary="Attendance Log" />
                  </ListItemButton>
                </List>
              </Collapse>
            </ListItem>

            {/* Section Header */}
            {open && <Typography variant="caption" sx={{ px: 4, py: 1.5, display: 'block', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}>Operations</Typography>}

            {/* Payments Dropdown */}
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton onClick={() => handleToggle('payment')} sx={mainItemStyle(openMenus.payment)}>
                <ListItemIcon sx={iconStyle(openMenus.payment)}><ReceiptIcon /></ListItemIcon>
                <ListItemText primary="Finance Hub" sx={{ opacity: open ? 1 : 0 }} />
                {open && (openMenus.payment ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
              <Collapse in={openMenus.payment && open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ position: 'relative', '&::before': { content: '""', position: 'absolute', left: 34, top: 0, bottom: 10, width: '1.5px', bgcolor: COLORS.divider } }}>
                  <ListItemButton component={Link} href="/payments" sx={subItemStyle(isPathActive('/payments'))}>
                    <ListItemText primary="Billing Logs" />
                  </ListItemButton>
                </List>
              </Collapse>
            </ListItem>

            {/* Platform Settings */}
            {open && <Typography variant="caption" sx={{ px: 4, py: 1.5, display: 'block', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}>System</Typography>}

            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton component={Link} href="/home" sx={mainItemStyle(isPathActive('/home'))}>
                <ListItemIcon sx={iconStyle(isPathActive('/home'))}><SupportIcon /></ListItemIcon>
                <ListItemText primary="Welcome Origin" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton component={Link} href="/about" sx={mainItemStyle(isPathActive('/about'))}>
                <ListItemIcon sx={iconStyle(isPathActive('/about'))}><ManageAccountsIcon /></ListItemIcon>
                <ListItemText primary="Knowledge Base" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>

        <Box sx={{ p: 2, borderTop: `1px solid ${COLORS.divider}`, backgroundColor: '#fafafa' }}>
          <UserSection open={open} />
        </Box>
      </Drawer>

      <CreationModals
        opened={creationModal.opened}
        onClose={() => setCreationModal({ ...creationModal, opened: false })}
        type={creationModal.type}
      />

      <Box component="main" sx={{
        flexGrow: 1,
        p: 4,
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {children}
      </Box>
    </Box>
  );
}