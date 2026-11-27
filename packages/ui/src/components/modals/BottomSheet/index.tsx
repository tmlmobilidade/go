'use client';

import { type PropsWithChildren, useRef, useState } from 'react';
import { Sheet } from 'react-modal-sheet';

import styles from './styles.module.css';

import { BottomSheetDialog } from '../BottomSheetDialog';

/* * */

export interface BottomSheetProps {
	closeLabel: string
	onClose: () => void
	opened: boolean
	title: string
}

/* * */

export function BottomSheet({ children, closeLabel, onClose, opened, title }: PropsWithChildren<BottomSheetProps>) {
	//
	// A. Setup variables

	const dialogRef = useRef<HTMLDivElement>(null);
	const [isEntering, setIsEntering] = useState(true);

	//
	// B. Handle actions

	const handleOpenEnd = () => {
		setIsEntering(false);
		if (!dialogRef.current?.contains(document.activeElement)) dialogRef.current?.focus({ preventScroll: true });
	};

	//
	// C. Render components

	return (
		<Sheet className={styles.root} detent="content" isOpen={opened} onClose={onClose} onCloseEnd={() => setIsEntering(true)} onOpenEnd={handleOpenEnd} onOpenStart={() => setIsEntering(true)} disableScrollLocking>
			<BottomSheetDialog closeLabel={closeLabel} dialogRef={dialogRef} isEntering={isEntering} onClose={onClose} title={title}>
				{children}
			</BottomSheetDialog>
		</Sheet>
	);
}
