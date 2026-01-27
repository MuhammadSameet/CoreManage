import { Paper, Text, Button, Group, Box } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';

interface StatsCardProps {
    title: string;
    value: string;
    hasViewAll?: boolean;
}

export function StatsCard({ title, value, hasViewAll }: StatsCardProps) {
    return (
        <Paper
            radius="md"
            withBorder
            className="p-5 relative overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
        >
            <div className="flex flex-col justify-between h-full relative z-10">
                <div className="flex justify-between items-start">
                    <Text className="text-gray-600 font-medium text-sm">{title}</Text>
                    {hasViewAll && (
                        <Button
                            variant="subtle"
                            size="xs"
                            className="text-gray-400 hover:text-gray-600 h-6 px-2 text-xs font-normal"
                            rightSection={<IconChevronRight size={12} />}
                        >
                            View
                        </Button>
                    )}
                </div>

                <Text className="text-2xl font-bold text-gray-900 mt-2">{value}</Text>
            </div>

            {/* Decorative Wave/Gradient */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-tl from-blue-100/50 to-transparent rounded-full blur-xl pointer-events-none opacity-70"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-blue-50 to-transparent rounded-tl-[100px] pointer-events-none opacity-50"></div>
        </Paper>
    );
}
