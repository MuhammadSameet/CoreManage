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

const variantStyles: Record<StatsCardVariant, { gradient: string; iconColor: string; textColor: string; subTextColor: string }> = {
    blue: {
        gradient: 'linear-gradient(135deg, #00A5A8 0%, #25C4DD 100%)',
        iconColor: '#ffffff',
        textColor: '#ffffff',
        subTextColor: 'rgba(255, 255, 255, 0.85)'
    },
    purple: {
        gradient: 'linear-gradient(135deg, #7e22ce 0%, #a855f7 100%)',
        iconColor: '#ffffff',
        textColor: '#ffffff',
        subTextColor: 'rgba(255, 255, 255, 0.85)'
    },
    orange: {
        gradient: 'linear-gradient(135deg, #FF6275 0%, #FF9BA7 100%)',
        iconColor: '#ffffff',
        textColor: '#ffffff',
        subTextColor: 'rgba(255, 255, 255, 0.85)'
    },
    green: {
        gradient: 'linear-gradient(135deg, #10C888 0%, #58E1B5 100%)',
        iconColor: '#ffffff',
        textColor: '#ffffff',
        subTextColor: 'rgba(255, 255, 255, 0.85)'
    },
    default: {
        gradient: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
        iconColor: '#ffffff',
        textColor: '#ffffff',
        subTextColor: 'rgba(255, 255, 255, 0.85)'
    },
};

export function StatsCard({ title, value, variant = 'blue', icon: Icon, action }: StatsCardProps) {
    const styles = variantStyles[variant];

    return (
        <Paper
            radius="lg"
            className="p-5 sm:p-6 relative overflow-hidden shadow-md border-none h-full group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ background: styles.gradient }}
        >
            <div className="flex flex-col justify-center h-full relative z-10 gap-4">
                <div className="flex items-center gap-4">
                    {Icon && (
                        <ThemeIcon
                            size={48}
                            radius="md"
                            variant="white"
                            style={{
                                color: 'rgba(0, 0, 0, 0.1)',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(8px)'
                            }}
                            className="flex-shrink-0 border border-white/20"
                        >
                            <Icon size={26} stroke={2} className="text-white" />
                        </ThemeIcon>
                    )}
                    <div className="min-w-0">
                        <Text
                            className="font-bold uppercase tracking-widest truncate"
                            style={{
                                fontSize: '0.65rem',
                                color: styles.subTextColor,
                                fontFamily: "'Outfit', sans-serif"
                            }}
                        >
                            {title}
                        </Text>
                        <Text
                            className="font-extrabold truncate"
                            style={{
                                fontSize: '1.75rem',
                                lineHeight: 1.1,
                                color: styles.textColor,
                                letterSpacing: '-0.02em',
                                fontFamily: "'Outfit', sans-serif"
                            }}
                        >
                            {value}
                        </Text>
                    </div>
                </div>
            </div>

            {/* Subtle gloss effect */}
            <div
                className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none transition-all duration-500 group-hover:scale-150"
            />
            <div
                className="absolute -left-4 -bottom-4 w-32 h-32 bg-black/5 rounded-full blur-3xl pointer-events-none"
            />
        </Paper>
    );
}
