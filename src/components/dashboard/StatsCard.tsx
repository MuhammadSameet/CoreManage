import { Paper, Text, Group, Button, Box } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';

export type StatsCardVariant = 'blue' | 'purple' | 'orange' | 'green' | 'default';

interface StatsCardProps {
    title: string;
    value: string;
    variant?: StatsCardVariant;
    action?: {
        label: string; // e.g. "View", "View All"
        onClick?: () => void;
    };
    fullWidth?: boolean; // For when it spans more columns
}

const variantStyles: Record<StatsCardVariant, { gradientFrom: string; gradientTo: string; text: string }> = {
    blue: { gradientFrom: '#ebf4ff', gradientTo: '#cfe3ff', text: 'text-blue-600' },
    purple: { gradientFrom: '#f3f0ff', gradientTo: '#e5dbff', text: 'text-purple-600' },
    orange: { gradientFrom: '#fff5f5', gradientTo: '#ffe3e3', text: 'text-orange-600' },
    green: { gradientFrom: '#f0fff4', gradientTo: '#c6f6d5', text: 'text-emerald-600' },
    default: { gradientFrom: '#f8fafc', gradientTo: '#f1f5f9', text: 'text-gray-600' },
};

export function StatsCard({ title, value, variant = 'blue', action }: StatsCardProps) {
    const styles = variantStyles[variant];

    return (
        <Paper
            radius="md"
            className="p-6 relative overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 h-full"
        >
            <div className="flex flex-col justify-between h-full relative z-10">
                <div className="flex justify-between items-start mb-1">
                    <Text className="text-gray-500 font-semibold text-xs tracking-tight uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>{title}</Text>
                    {action && (
                        <Button
                            variant="subtle"
                            size="compact-xs"
                            className="bg-gray-100/50 text-gray-500 hover:bg-gray-200 h-6 px-3 text-[10px] font-bold rounded-full transition-colors"
                            rightSection={<IconChevronRight size={10} />}
                            onClick={action.onClick}
                        >
                            {action.label}
                        </Button>
                    )}
                </div>

                <Text className="text-[32px] font-extrabold text-[#1e293b] leading-none mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{value}</Text>
            </div>

            {/* Decorative Curved Shape - Gradient quadrant as per design */}
            <div
                className="absolute bottom-0 right-0 w-32 h-24 pointer-events-none transition-opacity duration-500"
                style={{
                    background: `linear-gradient(135deg, transparent 20%, ${styles.gradientFrom} 50%, ${styles.gradientTo} 100%)`,
                    clipPath: 'ellipse(100% 100% at 100% 100%)',
                    opacity: 0.8
                }}
            ></div>

            {/* Subtle soft glow */}
            <div
                className="absolute bottom-[-20px] right-[-20px] w-40 h-40 rounded-full blur-3xl pointer-events-none"
                style={{
                    background: styles.gradientFrom,
                    opacity: 0.3
                }}
            ></div>
        </Paper>
    );
}
