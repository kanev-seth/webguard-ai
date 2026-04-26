import { useEffect, useRef } from 'react';

interface SystemPulseLineProps {
    width?: number;
    height?: number;
    color?: string;
    threatColor?: string;
    isThreat?: boolean;
}

/**
 * SystemPulseLine — animated SVG waveform showing "live system health".
 * Uses requestAnimationFrame to continuously update a sine-wave path,
 * giving the impression of a real-time signal monitor in the TopBar.
 */
export function SystemPulseLine({
    width = 120,
    height = 32,
    color = '#BDB2FF',
    threatColor = '#DC2626',
    isThreat = false,
}: SystemPulseLineProps) {
    const pathRef   = useRef<SVGPathElement>(null);
    const dotRef    = useRef<SVGCircleElement>(null);
    const glowRef   = useRef<SVGCircleElement>(null);
    const frameRef  = useRef<number>(0);
    const startRef  = useRef<number>(performance.now());

    const activeColor = isThreat ? threatColor : color;

    useEffect(() => {
        const path   = pathRef.current;
        const dot    = dotRef.current;
        const glow   = glowRef.current;
        if (!path || !dot || !glow) return;

        const W = width;
        const H = height;
        const MID = H / 2;
        const POINTS = 60;

        function frame(now: number) {
            const t = (now - startRef.current) / 1000;

            // Build a composite waveform (sine + overtone + noise-like)
            const pts: [number, number][] = [];
            for (let i = 0; i <= POINTS; i++) {
                const x = (i / POINTS) * W;
                const phase = (i / POINTS) * Math.PI * 6;
                const amp1  = MID * 0.45 * Math.sin(phase + t * 2.2);
                const amp2  = MID * 0.18 * Math.sin(phase * 2.1 + t * 3.7);
                const amp3  = MID * 0.08 * Math.sin(phase * 4.3 + t * 5.1);
                const spike = i >= POINTS * 0.55 && i <= POINTS * 0.65
                    ? MID * 0.35 * Math.sin((i / POINTS - 0.6) * Math.PI * 10 + t * 4)
                    : 0;
                pts.push([x, MID + amp1 + amp2 + amp3 + spike]);
            }

            // Build smooth SVG path using cubic bezier
            let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
            for (let i = 1; i < pts.length; i++) {
                const prev = pts[i - 1];
                const curr = pts[i];
                const cpx1 = prev[0] + (curr[0] - prev[0]) / 3;
                const cpx2 = curr[0] - (curr[0] - prev[0]) / 3;
                d += ` C ${cpx1.toFixed(1)} ${prev[1].toFixed(1)}, ${cpx2.toFixed(1)} ${curr[1].toFixed(1)}, ${curr[0].toFixed(1)} ${curr[1].toFixed(1)}`;
            }
            path.setAttribute('d', d);

            // Animate the trailing dot at the right edge
            const last = pts[pts.length - 1];
            const cx = last[0].toFixed(1);
            const cy = last[1].toFixed(1);
            dot.setAttribute('cx', cx);
            dot.setAttribute('cy', cy);
            glow.setAttribute('cx', cx);
            glow.setAttribute('cy', cy);

            frameRef.current = requestAnimationFrame(frame);
        }

        frameRef.current = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(frameRef.current);
    }, [width, height]);

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ overflow: 'visible' }}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="spline-grad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%"   stopColor={activeColor} stopOpacity="0" />
                    <stop offset="40%"  stopColor={activeColor} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={activeColor} stopOpacity="1" />
                </linearGradient>
                <filter id="spline-glow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Main waveform */}
            <path
                ref={pathRef}
                fill="none"
                stroke="url(#spline-grad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                filter="url(#spline-glow)"
            />

            {/* Trailing glow dot */}
            <circle ref={glowRef} r="5" fill={activeColor} opacity="0.2" />

            {/* Sharp dot */}
            <circle
                ref={dotRef}
                r="2"
                fill={activeColor}
                style={{ filter: `drop-shadow(0 0 4px ${activeColor})` }}
            />
        </svg>
    );
}
