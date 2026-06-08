'use client';

/* * */

import { BottomSheetClose } from '@/components/common/bottom-sheet/BottomSheetClose';
import { type PropsWithChildren, useCallback, useRef, useState } from 'react';

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

	const bodyRef = useRef<HTMLDivElement>(null);

	const [isScrolled, setIsScrolled] = useState(false);

	//
	// B. Handle actions

	const handleScroll = useCallback(() => {
		const element = bodyRef.current;

		if (!element) return;

		setIsScrolled(element.scrollTop > 8);
	}, []);

	//
	// C. Render components

	return (
		<>
			{size === 'full' && (
				<div
					className={styles.overlay}
					data-opened={opened}
					onClick={onClose}
				/>
			)}

			<section
				aria-hidden={!opened}
				aria-modal="true"
				className={styles.content}
				data-opened={opened}
				data-size={size}
				role="dialog"
			>
				<header
					className={styles.header}
					data-scrolled={isScrolled}
					data-with-title={!!title}
				>
					<div className={styles.headerLeft}>
						<BottomSheetClose onClick={onClose} />
					</div>

					{title && (
						<h1 className={styles.title}>
							{title}
						</h1>
					)}

					<div className={styles.headerRight} />
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
