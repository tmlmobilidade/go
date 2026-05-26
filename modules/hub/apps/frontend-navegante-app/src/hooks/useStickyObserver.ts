/* * */

import { useEffect, useRef, useState } from 'react';

/* * */

interface RootMarginProps {
	bottom?: string
	left?: string
	right?: string
	top?: string
}

interface OffsetValueProps {
	bottom?: number
	left?: number
	right?: number
	top?: number
}

const defaultRootMargin: RootMarginProps = { bottom: '0px', left: '0px', right: '0px', top: '-1px' };
const defaultOffsetValue: OffsetValueProps = { bottom: 0, left: 0, right: 0, top: 0 };

/* * */

export const useStickyObserver = (rootMargin?: RootMarginProps, threshold: number[] = [1], offsetValue?: OffsetValueProps, negativeValues = true) => {
	//

	//
	// A. Setup variables

	const ref = useRef<HTMLDivElement>(null);
	const [isSticky, setIsSticky] = useState(false);

	//
	// B. Transform data

	const preparedRootMargin = { ...defaultRootMargin };
	if (rootMargin) {
		for (const key of ['top', 'right', 'bottom', 'left'] as const) {
			const value = rootMargin[key];
			if (value !== undefined && value !== null && value !== '') {
				preparedRootMargin[key] = value;
			}
		}
	}
	const preparedOffsetValue = { ...defaultOffsetValue, ...offsetValue };

	const toObserverMarginPx = (raw: string, offset: number | undefined) => {
		const parsed = Number.parseInt(raw, 10);
		if (!Number.isFinite(parsed)) return '0px';
		const combined = parsed * (negativeValues ? -1 : 1) + (offset ?? 0);
		return `${combined}px`;
	};

	if (preparedRootMargin.top) preparedRootMargin.top = toObserverMarginPx(preparedRootMargin.top, preparedOffsetValue.top);
	if (preparedRootMargin.right) preparedRootMargin.right = toObserverMarginPx(preparedRootMargin.right, preparedOffsetValue.right);
	if (preparedRootMargin.left) preparedRootMargin.left = toObserverMarginPx(preparedRootMargin.left, preparedOffsetValue.left);
	if (preparedRootMargin.bottom) preparedRootMargin.bottom = toObserverMarginPx(preparedRootMargin.bottom, preparedOffsetValue.bottom);

	//
	// C. Setup hook

	useEffect(() => {
		// Exit early if the ref is not set
		if (!ref.current) return;
		// Setup the observer
		const observer = new IntersectionObserver(
			([event]) => setIsSticky(event.intersectionRatio < 1),
			{ rootMargin: `${preparedRootMargin.top} ${preparedRootMargin.right} ${preparedRootMargin.bottom} ${preparedRootMargin.left}`, threshold: threshold },
		);
		observer.observe(ref.current);
		// Remove the observer on cleanup
		return () => {
			observer.disconnect();
		};
	}, [ref, preparedRootMargin, offsetValue, threshold]);

	return { isSticky, ref };

	//
};
