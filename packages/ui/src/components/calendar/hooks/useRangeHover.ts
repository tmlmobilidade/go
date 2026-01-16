import { type RefObject, useEffect, useRef } from 'react';

import yearlyMonthStyles from '../components/YearlyCalendarMonth/styles.module.css';

import { DateRangeState } from '../contexts/CalendarUI.context';

/* * */

interface UseRangeHoverProps {
	containerRef: RefObject<HTMLElement>
	isEnabled: boolean
	rangeSelection: DateRangeState
}

/* * */

/**
 * Custom hook to handle range selection hover interactions
 * Uses DOM manipulation with requestAnimationFrame for optimal performance
 * Applies CSS module classes directly to day cells without triggering React re-renders
 */
export function useRangeHover({
	containerRef,
	isEnabled,
	rangeSelection,
}: UseRangeHoverProps) {
	const rafIdRef = useRef<number | undefined>(undefined);
	const currentHoveredDateRef = useRef<null | string>(null);

	// Handle hover interactions
	useEffect(() => {
		const el = containerRef.current;
		if (!el || !isEnabled) return;

		const updateHoverClasses = (hoveredDate: null | string, startDate: null | string) => {
			// Cancel any pending update
			if (rafIdRef.current) {
				cancelAnimationFrame(rafIdRef.current);
			}

			rafIdRef.current = requestAnimationFrame(() => {
				if (!startDate) return;

				// Get all day cells
				const dayCells = el.querySelectorAll<HTMLElement>('[data-date]');

				// Determine range
				const minDate = hoveredDate && hoveredDate < startDate ? hoveredDate : startDate;
				const maxDate = hoveredDate && hoveredDate > startDate ? hoveredDate : startDate;

				// Batch update classes
				dayCells.forEach((cell) => {
					const cellDate = cell.getAttribute('data-date');
					if (!cellDate) return;

					const isHoveredEnd = cellDate === hoveredDate;
					const isInHoverRange = hoveredDate && cellDate > minDate && cellDate < maxDate;

					// Update classes using CSS module class names
					cell.classList.toggle(yearlyMonthStyles.dayHoveredEnd, isHoveredEnd);
					cell.classList.toggle(yearlyMonthStyles.dayInHoverRange, !!isInHoverRange);
				});
			});
		};

		const onMove = (e: MouseEvent) => {
			// Only track hover if we have a start but no end
			if (!rangeSelection.start || rangeSelection.end) {
				// Clear any existing hover classes
				if (currentHoveredDateRef.current) {
					updateHoverClasses(null, null);
					currentHoveredDateRef.current = null;
				}
				return;
			}

			const target = (e.target as HTMLElement).closest('[data-date]');
			const hoveredDate = target?.getAttribute('data-date') || null;

			// Only update if hovered date changed
			if (hoveredDate !== currentHoveredDateRef.current) {
				currentHoveredDateRef.current = hoveredDate;
				updateHoverClasses(hoveredDate, rangeSelection.start);
			}
		};

		const onLeave = () => {
			if (currentHoveredDateRef.current) {
				updateHoverClasses(null, null);
				currentHoveredDateRef.current = null;
			}
		};

		el.addEventListener('mousemove', onMove, { passive: true });
		el.addEventListener('mouseleave', onLeave);

		return () => {
			el.removeEventListener('mousemove', onMove);
			el.removeEventListener('mouseleave', onLeave);
			if (rafIdRef.current) {
				cancelAnimationFrame(rafIdRef.current);
			}
		};
	}, [containerRef, isEnabled, rangeSelection.start, rangeSelection.end]);

	// Clean up hover classes when range is completed
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		if (rangeSelection.end) {
			// Clear hover classes when selection is complete
			const dayCells = el.querySelectorAll<HTMLElement>('[data-date]');
			dayCells.forEach((cell) => {
				cell.classList.remove(yearlyMonthStyles.dayHoveredEnd, yearlyMonthStyles.dayInHoverRange);
			});
		}
	}, [containerRef, rangeSelection.end]);
}
