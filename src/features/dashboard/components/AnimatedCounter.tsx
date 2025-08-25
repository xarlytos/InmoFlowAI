import { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number | string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 1000, className = '' }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Only animate numbers, not strings
    if (typeof value !== 'number') {
      return;
    }

    const startValue = 0;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;

      setDisplayValue(Math.floor(current));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    const timeoutId = setTimeout(animate, 100); // Small delay for stagger effect
    return () => clearTimeout(timeoutId);
  }, [value, duration]);

  return (
    <span className={className}>
      {typeof value === 'number' ? displayValue.toLocaleString() : value}
    </span>
  );
}