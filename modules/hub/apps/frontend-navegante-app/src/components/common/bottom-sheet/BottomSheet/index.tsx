'use client';

import { BottomSheetClose } from '@/components/common/bottom-sheet/BottomSheetClose';
import { type PropsWithChildren, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface BottomSheetProps {
	onClose: () => void
	opened: boolean
	size?: 'fit' | 'full' | 'half' | 'short'
	title?: string
}

/* * */

export function BottomSheet({ children, onClose, opened, size = 'fit', title }: PropsWithChildren<BottomSheetProps>) {
	//

	//
	// A. Setup variables

	const titleId = useId();

	const bodyRef = useRef<HTMLDivElement>(null);
	const headerRef = useRef<HTMLDivElement>(null);
	const dialogRef = useRef<HTMLElement>(null);
	const closeButtonRef = useRef<HTMLDivElement>(null);
	const previousActiveElementRef = useRef<HTMLElement | null>(null);

	const [isScrolled, setIsScrolled] = useState(false);

	const [height, setHeight] = useState(100);

	//
	// B. Handle actions

	const handleDrag = useCallback((event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
		//
		// Get the coordinates of the click from either MouseEvent or TouchEvent
		const positionY = 'clientY' in event ? event.clientY : event.touches[0].clientY;
		// Calculate the click position on the header where
		// the user is dragging the bottom sheet from
		const headerY = headerRef.current?.getBoundingClientRect().top ?? 0;
		const marginY = positionY - headerY;

		const onMouseMove = (moveMoveEvent: MouseEvent | TouchEvent) => {
			// Get the coordinates of the click from either MouseEvent or TouchEvent
			const clientY = 'clientY' in moveMoveEvent ? moveMoveEvent.clientY : moveMoveEvent.touches[0].clientY;
			// Calculate the new height of the bottom sheet
			const newHeight = window.innerHeight - clientY + marginY;
			console.log('newHeight', newHeight, 'headerY', headerY, 'clientY', clientY, 'marginY', marginY);
			setHeight(newHeight);
		};

		const onMouseUp = () => {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			document.removeEventListener('touchmove', onMouseMove);
			document.removeEventListener('touchend', onMouseUp);
		};

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('touchmove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
		document.addEventListener('touchend', onMouseUp);
	}, [headerRef]);

	const handleScroll = useCallback(() => {
		const element = bodyRef.current;
		if (!element) return;
		setIsScrolled(element.scrollTop > 8);
	}, []);

	//
	// C. Setup effects

	useEffect(() => {
		if (!opened) return;
		const previousOverflow = document.body.style.overflow;
		const previousTouchAction = document.body.style.touchAction;
		document.body.style.overflow = 'hidden';
		document.body.style.touchAction = 'none';
		return () => {
			document.body.style.overflow = previousOverflow;
			document.body.style.touchAction = previousTouchAction;
		};
	}, [opened]);

	useLayoutEffect(() => {
		if (!opened) return;
		previousActiveElementRef.current = document.activeElement as HTMLElement | null;
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				const focusTarget = closeButtonRef.current ?? dialogRef.current;
				focusTarget?.focus({ preventScroll: true });
			});
		});
		return () => {
			previousActiveElementRef.current?.focus?.({ preventScroll: true });
		};
	}, [opened]);

	//
	// D. Render components

	return (
		<>
			<div
				aria-hidden="true"
				className={styles.overlay}
				data-opened={opened}
				onClick={onClose}
			/>

			<section
				ref={dialogRef}
				aria-hidden={!opened}
				aria-labelledby={title ? titleId : undefined}
				aria-modal={true}
				className={styles.content}
				data-opened={opened}
				data-size={size}
				role="dialog"
				style={{ height: `${height}px` }}
				tabIndex={opened ? -1 : undefined}
			>
				<header
					ref={headerRef}
					className={styles.header}
					data-scrolled={isScrolled}
					data-with-title={!!title}
					onMouseDown={handleDrag}
					onTouchStart={handleDrag}
				>
					<div className={styles.headerLeft} />

					<h1 className={styles.title} id={titleId}>
						{title ?? ''}
					</h1>

					<div className={styles.headerRight}>
						<BottomSheetClose ref={closeButtonRef} onClick={onClose} />
					</div>
				</header>

				<div
					ref={bodyRef}
					className={styles.body}
					onScroll={handleScroll}
				>
					{opened && children}
				</div>
			</section>
		</>
	);
}
