"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface SalarySliderProps {
    min: number;
    max: number;
    step?: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
}

export default function SalarySlider({ min, max, step = 1000, value, onChange }: SalarySliderProps) {
    const [minVal, setMinVal] = useState(value[0]);
    const [maxVal, setMaxVal] = useState(value[1]);
    const minValRef = useRef(value[0]);
    const maxValRef = useRef(value[1]);
    const range = useRef<HTMLDivElement>(null);

    // Convert to percentage
    const getPercent = useCallback(
        (value: number) => Math.round(((value - min) / (max - min)) * 100),
        [min, max]
    );

    // Update range width/left
    useEffect(() => {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxValRef.current);

        if (range.current) {
            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, getPercent]);

    useEffect(() => {
        const minPercent = getPercent(minValRef.current);
        const maxPercent = getPercent(maxVal);

        if (range.current) {
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [maxVal, getPercent]);

    // Update states when prop changes externally (e.g. reset)
    useEffect(() => {
        setMinVal(value[0]);
        minValRef.current = value[0];
        setMaxVal(value[1]);
        maxValRef.current = value[1];
    }, [value]);

    return (
        <div className="relative w-full h-5 flex items-center justify-center">
            {/* Background track */}
            <div className="absolute w-full h-1 bg-[var(--border)] rounded-full z-0" />
            
            {/* Active track (blue) */}
            <div ref={range} className="absolute h-1 bg-[var(--primary)] rounded-full z-10" />

            {/* Min Input */}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={minVal}
                onChange={(event) => {
                    const val = Math.min(Number(event.target.value), maxVal - step);
                    setMinVal(val);
                    minValRef.current = val;
                    onChange([val, maxVal]);
                }}
                className="pointer-events-none absolute w-full h-0 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[var(--primary)] cursor-pointer"
                style={{ zIndex: minVal > max - 100 ? 50 : 30 }}
            />
            
            {/* Max Input */}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={maxVal}
                onChange={(event) => {
                    const val = Math.max(Number(event.target.value), minVal + step);
                    setMaxVal(val);
                    maxValRef.current = val;
                    onChange([minVal, val]);
                }}
                className="pointer-events-none absolute w-full h-0 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[var(--primary)] cursor-pointer"
                style={{ zIndex: 40 }}
            />
        </div>
    );
}
