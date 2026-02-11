import { Paper, Text, Group, Button, ThemeIcon, UnstyledButton } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import type { TablerIcon } from '@tabler/icons-react';

export type StatsCardVariant = 'blue' | 'purple' | 'orange' | 'green' | 'default';

interface StatsCardProps {
    title: string;
    value: string;
    variant?: StatsCardVariant;
    icon?: TablerIcon;
    action?: {
        label: string;
        onClick?: () => void;
    };
    fullWidth?: boolean;
}

const variantStyles: Record<StatsCardVariant, { gradientFrom: string; gradientTo: string; iconColor: string; accent: string }> = {
    blue: { gradientFrom: '#4338ca', gradientTo: '#312e81', iconColor: '#ffffff', accent: '#6366f1' },
    purple: { gradientFrom: '#7e22ce', gradientTo: '#4c1d95', iconColor: '#ffffff', accent: '#a855f7' },
    orange: { gradientFrom: '#b45309', gradientTo: '#78350f', iconColor: '#ffffff', accent: '#f59e0b' },
    green: { gradientFrom: '#047857', gradientTo: '#064e3b', iconColor: '#ffffff', accent: '#10b981' },
    default: { gradientFrom: '#334155', gradientTo: '#0f172a', iconColor: '#ffffff', accent: '#64748b' },
};

export function StatsCard({ title, value, variant = 'blue', icon: Icon, action }: StatsCardProps) {
    const styles = variantStyles[variant];

    return (
        <Paper
            radius="md"
            className="p-4 sm:p-5 relative overflow-hidden bg-white shadow-sm border border-gray-100 h-full group transition-all duration-300 hover:shadow-md hover:border-gray-200"
        >
            <div className="flex flex-col justify-between h-full relative z-10 gap-2">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 min-w-0">
                        {Icon && (
                            <ThemeIcon
                                size="md"
                                radius="md"
                                variant="filled"
                                style={{
                                    background: `linear-gradient(135deg, ${styles.gradientFrom} 0%, ${styles.gradientTo} 100%)`,
                                    color: styles.iconColor
                                }}
                                className="flex-shrink-0 shadow-sm"
                            >
                                <Icon size={18} stroke={2} />
                            </ThemeIcon>
                        )}
                        <Text className="font-bold uppercase tracking-wider text-gray-500 truncate" style={{ fontSize: '0.65rem' }}>{title}</Text>
                    </div>
                </div>
                <div className="flex flex-col gap-0.5">
                    <Text className="font-extrabold text-gray-900" style={{ fontSize: 'var(--text-2xl)', lineHeight: 1.2 }}>{value}</Text>
                    {action && (
                        <UnstyledButton
                            className="inline-flex items-center gap-1 font-bold mt-1 text-[#6366f1] hover:text-[#4f46e5] transition-colors"
                            style={{ fontSize: 'var(--text-xs)' }}
                            onClick={action?.onClick}
                        >
                            <span className="border-b border-transparent hover:border-current leading-tight">{action.label}</span>
                            <IconChevronRight size={12} className="mt-0.5" />
                        </UnstyledButton>
                    )}
                </div>
            </div>

            <div
                className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity"
                style={{
                    background: `linear-gradient(225deg, ${styles.gradientFrom} 0%, transparent 80%)`
                }}
            />
        </Paper>
    );
}
