import { Box, NavLink, Text, ThemeIcon, rem } from '@mantine/core';
import { IconLayoutDashboard, IconWallet, IconUsers, IconUserShield, IconSettings, IconCircleFilled } from '@tabler/icons-react';

export function Sidebar() {
    return (
        <div className="w-64 h-screen bg-[#113a8f] text-white flex flex-col fixed left-0 top-0 overflow-y-auto">
            {/* Logo Section */}
            <div className="p-6 flex items-center gap-3">
                <IconCircleFilled className="text-white" size={24} />
                <Text className="text-xl font-bold tracking-wide">CMS</Text>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 py-4 space-y-1">
                <div className="mb-2">
                    <NavLink
                        label="Dashboard"
                        leftSection={<IconLayoutDashboard size={18} />}
                        active
                        variant="filled"
                        className="rounded-md font-medium data-[active=true]:bg-white data-[active=true]:text-[#113a8f] text-blue-100 hover:bg-blue-800 hover:text-white"
                        styles={{ root: { padding: '10px 16px' } }}
                    />
                </div>

                <NavLink
                    label="Payments"
                    leftSection={<IconWallet size={18} />}
                    className="rounded-md font-medium text-blue-100 hover:bg-blue-800 hover:text-white mb-1"
                    styles={{ root: { padding: '10px 16px' } }}
                />
                <NavLink
                    label="Users Management"
                    leftSection={<IconUsers size={18} />}
                    className="rounded-md font-medium text-blue-100 hover:bg-blue-800 hover:text-white mb-1"
                    styles={{ root: { padding: '10px 16px' } }}
                />
                <NavLink
                    label="Employee Management"
                    leftSection={<IconUserShield size={18} />}
                    className="rounded-md font-medium text-blue-100 hover:bg-blue-800 hover:text-white mb-1"
                    styles={{ root: { padding: '10px 16px' } }}
                />
                <NavLink
                    label="Settings"
                    leftSection={<IconSettings size={18} />}
                    className="rounded-md font-medium text-blue-100 hover:bg-blue-800 hover:text-white mb-1"
                    styles={{ root: { padding: '10px 16px' } }}
                />
            </div>
        </div>
    );
}
