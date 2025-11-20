import { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import styles from './ProgressChart.module.css';

interface DataPoint {
    date: string;
    calories: number;
    steps: number;
    workoutMinutes: number;
}

interface Props {
    data: DataPoint[];
    title?: string;
}

type MetricType = 'calories' | 'steps' | 'workoutMinutes';

const METRIC_CONFIG = {
    calories: {
        label: 'Calories',
        color: '#FFB84D',
        gradientId: 'colorCalories',
        unit: 'kcal'
    },
    steps: {
        label: 'Steps',
        color: '#A7E9AF',
        gradientId: 'colorSteps',
        unit: 'steps'
    },
    workoutMinutes: {
        label: 'Active Time',
        color: '#BAE6FD',
        gradientId: 'colorWorkout',
        unit: 'min'
    }
};

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
    metric: MetricType;
}

const CustomTooltip = ({ active, payload, label, metric }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.tooltip}>
                <div className={styles.tooltipLabel}>{label}</div>
                <div className={styles.tooltipValue}>
                    {payload[0].value} {METRIC_CONFIG[metric].unit}
                </div>
            </div>
        );
    }
    return null;
};

export default function ProgressChart({ data, title = 'Activity Trends' }: Props) {
    const [activeMetric, setActiveMetric] = useState<MetricType>('calories');

    const config = METRIC_CONFIG[activeMetric];

    return (
        <div className={styles.chartContainer}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                <div className={styles.controls}>
                    {(Object.keys(METRIC_CONFIG) as MetricType[]).map((metric) => (
                        <button
                            key={metric}
                            className={`${styles.controlBtn} ${activeMetric === metric ? styles.activeControl : ''}`}
                            onClick={() => setActiveMetric(metric)}
                        >
                            {METRIC_CONFIG[metric].label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip metric={activeMetric} />} />
                        <Area
                            type="monotone"
                            dataKey={activeMetric}
                            stroke={config.color}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill={`url(#${config.gradientId})`}
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
