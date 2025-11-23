import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './ChartTooltip.module.css';

interface TooltipData {
    title: string;
    items: { label: string; value: string | number; color?: string }[];
}

interface ChartTooltipProps {
    data: TooltipData | null;
    position: { x: number; y: number } | null;
}

export default function ChartTooltip({ data, position }: ChartTooltipProps) {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [adjustedPosition, setAdjustedPosition] = useState(position);

    useEffect(() => {
        if (!position || !tooltipRef.current) {
            setAdjustedPosition(null);
            return;
        }

        const tooltip = tooltipRef.current;
        const rect = tooltip.getBoundingClientRect();
        const padding = 10;

        let x = position.x;
        let y = position.y;

        if (x + rect.width + padding > window.innerWidth) {
            x = position.x - rect.width - padding;
        }

        if (y + rect.height + padding > window.innerHeight) {
            y = position.y - rect.height - padding;
        }

        if (x < padding) {
            x = padding;
        }

        if (y < padding) {
            y = padding;
        }

        setAdjustedPosition({ x, y });
    }, [position]);

    if (!data || !adjustedPosition) return null;

    const tooltipContent = (
        <div
            ref={tooltipRef}
            className={styles.tooltip}
            style={{
                left: `${adjustedPosition.x}px`,
                top: `${adjustedPosition.y}px`,
            }}
        >
            <div className={styles.title}>{data.title}</div>
            <div className={styles.content}>
                {data.items.map((item, index) => (
                    <div key={index} className={styles.item}>
                        {item.color && (
                            <div
                                className={styles.indicator}
                                style={{ backgroundColor: item.color }}
                            />
                        )}
                        <span className={styles.label}>{item.label}:</span>
                        <span className={styles.value}>{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    return createPortal(tooltipContent, document.body);
}
