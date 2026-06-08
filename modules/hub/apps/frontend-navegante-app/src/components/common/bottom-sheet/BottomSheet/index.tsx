'use client';

import { BottomSheetClose } from '@/components/common/bottom-sheet/BottomSheetClose';
import { Drawer } from '@mantine/core';
import { type PropsWithChildren, useCallback, useRef, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface BottomSheetProps {
	onClose: () => void
	opened: boolean
	size?: 'full' | 'half' | 'short'
	title?: string
}

export function BottomSheet({ children, onClose, opened, size = 'full', title }: PropsWithChildren<BottomSheetProps>) {
	const contentRef = useRef<HTMLDivElement>(null);
	const [isScrolled, setIsScrolled] = useState(false);

	const handleScroll = useCallback(() => {
		const el = contentRef.current;
		if (!el) return;
		setIsScrolled(el.scrollTop > 10);
	}, []);

	return (
		<>

			{size === 'full' && <div className={styles.overlay} data-opened={opened} />}

			<div className={styles.content} data-opened={opened} data-size={size}>
				<BottomSheetClose onClick={onClose} />
				{title && (
					<div className={styles.header} data-with-title={!!title}>
						<h1 className={styles.title}>{title}</h1>
					</div>
				)}
				<div className={styles.body} data-with-title={!!title}>
					{!!opened && children}
				</div>
			</div>

		</>
	);
}
