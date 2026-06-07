'use client';

import { BottomSheetClose } from '@/components/common/bottom-sheet/BottomSheetClose';
import { Drawer } from '@mantine/core';
import { type PropsWithChildren, useCallback, useRef, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface BottomSheetProps {
	onClose: () => void
	opened: boolean
	size?: 'full' | 'half'
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
		<Drawer.Root
			onClose={onClose}
			opened={opened}
			padding={0}
			position="bottom"
			size={size === 'full' ? '95%' : '55%'}
		>
			{size === 'full' && <Drawer.Overlay />}
			<Drawer.Content ref={contentRef} classNames={{ content: styles.content }} onScroll={handleScroll}>
				<Drawer.Header classNames={{ header: styles.header }} data-scrolled={isScrolled || undefined} data-with-title={!!title}>
					<BottomSheetClose onClick={onClose} />
					{title && <h1 className={styles.title}>{title}</h1>}
				</Drawer.Header>
				<Drawer.Body classNames={{ body: styles.body }} data-with-title={!!title}>
					{!!opened && children}
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
}
