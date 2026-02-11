import { Paper, Text, Group, Button, ThemeIcon } from '@mantine/core';
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

const variantStyles: Record<StatsCardVariant, { gradientFrom: string; gradientTo: string; iconColor: string }> = {
    blue: { gradientFrom: '#ebf4ff', gradientTo: '#cfe3ff', iconColor: '#1e40af' },
    purple: { gradientFrom: '#f3f0ff', gradientTo: '#e5dbff', iconColor: '#6d28d9' },
    orange: { gradientFrom: '#fff5f5', gradientTo: '#ffe3e3', iconColor: '#c2410c' },
    green: { gradientFrom: '#f0fff4', gradientTo: '#c6f6d5', iconColor: '#047857' },
    default: { gradientFrom: '#f8fafc', gradientTo: '#f1f5f9', iconColor: '#475569' },
};

export function StatsCard({ title, value, variant = 'blue', icon: Icon, action }: StatsCardProps) {
    const styles = variantStyles[variant];

    return (
        <Paper
            radius="md"
            className="p-4 sm:p-5 relative overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 h-full"
        >
            <div className="flex flex-col justify-between h-full relative z-10 gap-2">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        {Icon && (
                            <ThemeIcon size="md" radius="md" variant="light" style={{ backgroundColor: styles.gradientFrom, color: styles.iconColor }} className="flex-shrink-0">
                                <Icon size={18} stroke={1.5} />
                            </ThemeIcon>
                        )}
                        <Text className="stats-card-title truncate">{title}</Text>
                    </div>
                    {action && (
                        <Button
                            variant="subtle"
                            size="compact-xs"
                            className="rounded-md font-semibold flex-shrink-0"
                            style={{ fontSize: 'var(--text-sm)' }}
                            rightSection={<IconChevronRight size={12} />}
                            onClick={action?.onClick}
                        >
                            {action.label}
                        </Button>
                    )}
                </div>
                <Text className="stats-card-value">{value}</Text>
            </div>

            <div
                className="absolute bottom-0 right-0 w-32 h-24 pointer-events-none"
                style={{
                    background: `linear-gradient(135deg, transparent 20%, ${styles.gradientFrom} 50%, ${styles.gradientTo} 100%)`,
                    clipPath: 'ellipse(100% 100% at 100% 100%)',
                    opacity: 0.8
                }}
            />
            <div
                className="absolute bottom-[-20px] right-[-20px] w-40 h-40 rounded-full blur-3xl pointer-events-none"
                style={{ background: styles.gradientFrom, opacity: 0.3 }}
            />
        </Paper>
    );
}
