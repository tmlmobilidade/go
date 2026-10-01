'use client';

/* * */

import { useCallback, useEffect, useRef, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface CarouselItem {
	body?: string
	id: string
	image?: string
	title?: string
	video?: string
}

interface AppleStyleCarouselProps {
	items: CarouselItem[]
}

/* * */

const SNAP_THRESHOLD = 2;

/* * */

export function AppleStyleCarousel({ items }: AppleStyleCarouselProps) {
	//

	//
	// A. Setup variables

	const scrollerRef = useRef<HTMLDivElement>(null);
	const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
	const activeIndexRef = useRef(0);

	const [activeIndex, setActiveIndex] = useState(0);

	//
	// C. Handle lifecycle

	const getClosestIndex = useCallback(() => {
		const scroller = scrollerRef.current;
		if (!scroller) return 0;

		let closestIndex = 0;
		let closestDistance = Number.POSITIVE_INFINITY;

		itemRefs.current.forEach((item, index) => {
			if (!item) return;

			const distance = Math.abs(scroller.scrollLeft - item.offsetLeft);

			if (distance < closestDistance) {
				closestDistance = distance;
				closestIndex = index;
			}
		});

		return closestIndex;
	}, []);

	const getScrollLeftForIndex = useCallback((index: number) => {
		const target = itemRefs.current[index];

		if (!target) return 0;

		return target.offsetLeft;
	}, []);

	const snapToClosest = useCallback(() => {
		const scroller = scrollerRef.current;
		if (!scroller || items.length <= 1) return;

		const closestIndex = getClosestIndex();
		const targetScrollLeft = getScrollLeftForIndex(closestIndex);

		activeIndexRef.current = closestIndex;
		setActiveIndex(closestIndex);

		if (Math.abs(scroller.scrollLeft - targetScrollLeft) > SNAP_THRESHOLD) {
			scroller.scrollTo({
				behavior: 'instant',
				left: targetScrollLeft,
			});
		}
	}, [getClosestIndex, getScrollLeftForIndex, items.length]);

	const scrollToIndexInstant = useCallback((index: number) => {
		const scroller = scrollerRef.current;
		if (!scroller) return;

		activeIndexRef.current = index;
		setActiveIndex(index);

		scroller.scrollTo({
			behavior: 'instant',
			left: getScrollLeftForIndex(index),
		});
	}, [getScrollLeftForIndex]);

	useEffect(() => {
		const scroller = scrollerRef.current;
		if (!scroller) return;

		let rafId = 0;

		const handleScroll = () => {
			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(() => {
				const closestIndex = getClosestIndex();
				activeIndexRef.current = closestIndex;
				setActiveIndex(closestIndex);
			});
		};

		const handleScrollEnd = () => {
			snapToClosest();
		};

		const handleResize = () => {
			scrollToIndexInstant(activeIndexRef.current);
		};

		scroller.addEventListener('scroll', handleScroll, { passive: true });
		scroller.addEventListener('scrollend', handleScrollEnd, { passive: true });
		window.addEventListener('resize', handleResize, { passive: true });

		requestAnimationFrame(() => {
			scrollToIndexInstant(0);
		});

		return () => {
			cancelAnimationFrame(rafId);
			scroller.removeEventListener('scroll', handleScroll);
			scroller.removeEventListener('scrollend', handleScrollEnd);
			window.removeEventListener('resize', handleResize);
		};
	}, [getClosestIndex, items.length, scrollToIndexInstant, snapToClosest]);

	//
	// D. Handle actions

	const scrollToIndex = (index: number) => {
		const scroller = scrollerRef.current;
		if (!scroller) return;

		activeIndexRef.current = index;
		setActiveIndex(index);

		scroller.scrollTo({
			behavior: 'smooth',
			left: getScrollLeftForIndex(index),
		});
	};

	const handlePrevious = () => {
		scrollToIndex(activeIndex === 0 ? items.length - 1 : activeIndex - 1);
	};

	const handleNext = () => {
		scrollToIndex((activeIndex + 1) % items.length);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			handlePrevious();
		}

		if (event.key === 'ArrowRight') {
			event.preventDefault();
			handleNext();
		}
	};

	//
	// F. Render components

	return (
		<section
			aria-label="Demonstrações dos módulos"
			className={styles.container}
			onKeyDown={handleKeyDown}
		>
			<div
				ref={scrollerRef}
				className={styles.scroller}
				tabIndex={0}
			>
				{items.map((item, index) => (
					<div
						key={item.id}
						ref={(element) => {
							itemRefs.current[index] = element;
						}}
						aria-label={`${index + 1} de ${items.length}: ${item.title}`}
						aria-roledescription="slide"
						className={styles.card}
						role="group"
					>
						<div className={styles.media}>
							{item.video ? (
								<video
									className={styles.video}
									poster={item.image}
									preload="metadata"
									src={item.video}
									loop
									muted
									playsInline
								/>
							) : item.image ? (
								<img alt="" className={styles.image} src={item.image} />
							) : null}
						</div>

						<div className={styles.content}>
							<h3>{item.title}</h3>
							{item.body && <p>{item.body}</p>}
						</div>
					</div>
				))}
			</div>

			{items.length > 1 && (
				<div className={styles.controls}>
					<div aria-label="Selecionar slide" className={styles.dots} role="tablist">
						{items.map((item, index) => (
							<button
								key={item.id}
								aria-label={`Ir para ${item.title}`}
								aria-selected={activeIndex === index}
								className={`${styles.dot} ${activeIndex === index ? styles.activeDot : ''}`}
								onClick={() => scrollToIndex(index)}
								role="tab"
								type="button"
							/>
						))}
					</div>
				</div>
			)}
		</section>
	);

	//
}
