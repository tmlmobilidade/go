import { useEffect, useState } from 'react';

export function AnimatedNumber({ className, duration = 800, value }: { className?: string, duration?: number, value: number }) {
	const [displayValue, setDisplayValue] = useState(0);

	useEffect(() => {
		let start: null | number = null;
		const startValue = displayValue;
		const diff = value - startValue;

		const step = (timestamp: number) => {
			if (!start) start = timestamp;
			const progress = Math.min((timestamp - start) / duration, 1);
			setDisplayValue(startValue + diff * progress);
			if (progress < 1) requestAnimationFrame(step);
		};

		requestAnimationFrame(step);
	}, [value]);

	return <span className={className}>{Math.round(displayValue).toLocaleString('pt-PT')}</span>;
}
