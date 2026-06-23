'use client';

/* * */

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

export function BottomSheet({
	children,
	onClose,
	opened,
	size = 'fit',
	title,
}: PropsWithChildren<BottomSheetProps>) {
	//

	//
	// A. Setup variables

	const titleId = useId();

	const bodyRef = useRef<HTMLDivElement>(null);
	const dialogRef = useRef<HTMLElement>(null);
	const closeButtonRef = useRef<HTMLDivElement>(null);
	const previousActiveElementRef = useRef<HTMLElement | null>(null);

	const [isScrolled, setIsScrolled] = useState(false);

	//
	// B. Handle actions

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

		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = previousOverflow;
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
				tabIndex={opened ? -1 : undefined}
			>
				<header
					className={styles.header}
					data-scrolled={isScrolled}
					data-with-title={!!title}
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

	//
}
