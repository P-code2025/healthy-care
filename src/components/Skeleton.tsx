import styles from './Skeleton.module.css';

interface SkeletonProps {
    variant?: 'text' | 'rect' | 'circle' | 'card';
    width?: string | number;
    height?: string | number;
    className?: string;
}

export default function Skeleton({
    variant = 'text',
    width,
    height,
    className = ''
}: SkeletonProps) {
    const style: React.CSSProperties = {};

    if (width) {
        style.width = typeof width === 'number' ? `${width}px` : width;
    }

    if (height) {
        style.height = typeof height === 'number' ? `${height}px` : height;
    }

    return (
        <div
            className={`${styles.skeleton} ${styles[variant]} ${className}`}
            style={style}
        />
    );
}

// Composite skeleton components for common patterns
export function SkeletonCard() {
    return (
        <div className={styles.skeletonCard}>
            <Skeleton variant="rect" height={120} className={styles.cardImage} />
            <div className={styles.cardContent}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="80%" height={16} />
                <Skeleton variant="text" width="40%" height={14} />
            </div>
        </div>
    );
}

export function SkeletonStatCard() {
    return (
        <div className={styles.skeletonStatCard}>
            <Skeleton variant="circle" width={48} height={48} />
            <div className={styles.statContent}>
                <Skeleton variant="text" width="50%" height={14} />
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="text" width="40%" height={12} />
            </div>
        </div>
    );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div className={styles.skeletonList}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={styles.skeletonListItem}>
                    <Skeleton variant="circle" width={40} height={40} />
                    <div className={styles.listContent}>
                        <Skeleton variant="text" width="70%" height={16} />
                        <Skeleton variant="text" width="50%" height={14} />
                    </div>
                </div>
            ))}
        </div>
    );
}
