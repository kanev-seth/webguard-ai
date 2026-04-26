/**
 * SkeletonLoader — "Schematic Shimmer" components
 *
 * Renders scanning-line placeholders that look like a radar
 * sweeping over technical data, replacing plain spinners.
 */

interface SkeletonTableProps {
    rows?: number;
    cols?: number;
}

/** A single skeleton shimmer bar */
export function SkeletonBar({ width = '100%', height = 12, delay = 0 }: { width?: string | number; height?: number; delay?: number }) {
    return (
        <div
            className="skeleton-line rounded"
            style={{
                width,
                height,
                animationDelay: `${delay}ms`,
            }}
        />
    );
}

/** Full-width table skeleton with scanning lines */
export function SkeletonTable({ rows = 8, cols = 5 }: SkeletonTableProps) {
    const colWidths = ['12%', '18%', '8%', '28%', '10%', '10%', '8%', '6%'];

    return (
        <div className="w-full space-y-0 overflow-hidden rounded-xl border border-white/5">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white/3 border-b border-white/5">
                {Array.from({ length: cols }).map((_, i) => (
                    <SkeletonBar
                        key={i}
                        width={colWidths[i] ?? '15%'}
                        height={8}
                        delay={i * 60}
                    />
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div
                    key={rowIdx}
                    className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.03]"
                    style={{ opacity: 1 - rowIdx * 0.08 }}
                >
                    {Array.from({ length: cols }).map((_, colIdx) => (
                        <SkeletonBar
                            key={colIdx}
                            width={colWidths[colIdx] ?? '15%'}
                            height={10}
                            delay={rowIdx * 40 + colIdx * 30}
                        />
                    ))}
                </div>
            ))}

            {/* Scan line overlay */}
            <div className="scan-overlay absolute inset-0 pointer-events-none" aria-hidden="true" />
        </div>
    );
}

/** Inline card skeleton */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
    return (
        <div className="glass-panel rounded-xl p-4 space-y-3">
            <SkeletonBar width="60%" height={14} />
            {Array.from({ length: lines }).map((_, i) => (
                <SkeletonBar key={i} width={i === lines - 1 ? '45%' : '100%'} height={10} delay={i * 80} />
            ))}
        </div>
    );
}
