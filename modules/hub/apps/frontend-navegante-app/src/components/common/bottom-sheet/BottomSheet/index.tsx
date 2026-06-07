'use client';

import { BottomSheetClose } from '@/components/common/bottom-sheet/BottomSheetClose';
import { Drawer } from '@mantine/core';
import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

interface BottomSheetProps {
	onClose: () => void
	opened: boolean
	size?: 'full' | 'half' | 'short'
	title?: string
}

export function BottomSheet({ children, onClose, opened, size = 'full', title }: PropsWithChildren<BottomSheetProps>) {
	return (
		<Drawer.Root
			onClose={onClose}
			opened={opened}
			padding={0}
			position="bottom"
			size={size === 'full' ? '95%' : size === 'half' ? '55%' : '200px'}
		>
			{size === 'full' && <Drawer.Overlay />}
			<Drawer.Content classNames={{ content: styles.content }}>
				<Drawer.Header classNames={{ header: styles.header }} data-with-title={!!title}>
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
