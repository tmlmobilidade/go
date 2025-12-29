import { type RefObject, useEffect, useRef } from 'react';

/* * */

interface UseWheelNavigationProps {
	calendarRef: RefObject<HTMLDivElement>
	isEnabled: boolean
	nextMonth: () => void
	previousMonth: () => void
}

/* * */

/**
 * Custom hook to handle horizontal wheel navigation for calendar months
 * Debounces navigation events to prevent rapid month switching
 */
export function useWheelNavigation({
	calendarRef,
	isEnabled,
	nextMonth,
	previousMonth,
}: UseWheelNavigationProps) {
	const isNavigatingRef = useRef(false);
	const lastNavigationRef = useRef(0);

	// Store the callback functions in refs to avoid effect re-runs
	const nextMonthRef = useRef(nextMonth);
	const previousMonthRef = useRef(previousMonth);

	// Update refs when callbacks change
	useEffect(() => {
		nextMonthRef.current = nextMonth;
		previousMonthRef.current = previousMonth;
	}, [nextMonth, previousMonth]);

	useEffect(() => {
		const calendarElement = calendarRef.current;
		if (!calendarElement || !isEnabled) return;

		const handleWheel = (e: WheelEvent) => {
			// Only handle horizontal scroll or shift+vertical scroll
			const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;

			if (isHorizontal) {
				e.preventDefault();

				// Prevent rapid navigation - minimum 300ms between navigations
				const now = Date.now();
				if (isNavigatingRef.current || now - lastNavigationRef.current < 300) {
					return;
				}

				const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
				const threshold = 30; // Lower threshold for more responsive feel

				if (Math.abs(delta) > threshold) {
					isNavigatingRef.current = true;
					lastNavigationRef.current = now;

					if (delta > 0) {
						// Scroll right = next month
						nextMonthRef.current();
					}
					else {
						// Scroll left = previous month
						previousMonthRef.current();
					}

					// Reset navigation flag after a short delay
					setTimeout(() => {
						isNavigatingRef.current = false;
					}, 100);
				}
			}
		};

		calendarElement.addEventListener('wheel', handleWheel, { passive: false });

		return () => {
			calendarElement.removeEventListener('wheel', handleWheel);
		};
	}, [calendarRef, isEnabled]);
}
