'use client';

/* * */

import { useCallback, useEffect, useRef, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface ScrollChipsProps {
	children: React.ReactNode
}

/* * */

export function ScrollChips({ children }: ScrollChipsProps) {
	//

	//
	// A. Setup variables

	const scrollRef = useRef<HTMLDivElement>(null);

	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	//
	// B. Handle actions

	const updateScrollState = useCallback(() => {
		const element = scrollRef.current;

		if (!element) return;

		const { clientWidth, scrollLeft, scrollWidth } = element;

		const hasOverflow = scrollWidth > clientWidth;
		const isAtStart = scrollLeft <= 1;
		const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;

		setCanScrollLeft(hasOverflow && !isAtStart);
		setCanScrollRight(hasOverflow && !isAtEnd);
	}, []);

	//
	// C. Setup effects

	useEffect(() => {
		const element = scrollRef.current;

		if (!element) return;

		updateScrollState();

		const resizeObserver = new ResizeObserver(updateScrollState);

		resizeObserver.observe(element);

		if (element.firstElementChild) {
			resizeObserver.observe(element.firstElementChild);
		}

		return () => {
			resizeObserver.disconnect();
		};
	}, [updateScrollState, children]);

	//
	// D. Render components

	return (
		<div className={styles.scrollChipsWrapper}>
			<div
				ref={scrollRef}
				className={styles.scrollChipsScroll}
				data-fade-left={canScrollLeft}
				data-fade-right={canScrollRight}
				onScroll={updateScrollState}
			>
				<div className={styles.scrollChipsGroup}>
					{children}
				</div>
			</div>
		</div>
	);

	//
}
