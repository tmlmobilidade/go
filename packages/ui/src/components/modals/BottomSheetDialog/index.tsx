'use client';

import { IconX } from '@tabler/icons-react';
import { type HTMLAttributes, type PropsWithChildren, type RefObject, useRef } from 'react';
import { FocusScope, mergeProps, useDialog, useModalOverlay } from 'react-aria';
import { Sheet } from 'react-modal-sheet';

import styles from '../BottomSheet/styles.module.css';

import { type BottomSheetProps } from '../BottomSheet';

/* * */

interface BottomSheetDialogProps extends Omit<BottomSheetProps, 'opened'> {
	dialogRef: RefObject<HTMLDivElement | null>
	isEntering: boolean
}

/* * */

export function BottomSheetDialog({ children, closeLabel, dialogRef, isEntering, onClose, title }: PropsWithChildren<BottomSheetDialogProps>) {
	//
	// A. Setup variables

	const overlayRef = useRef<HTMLDivElement>(null);
	const { dialogProps, titleProps } = useDialog({ isEntering }, dialogRef);
	const { modalProps } = useModalOverlay({ isDismissable: false, isEntering }, {
		close: onClose,
		isOpen: true,
		open: () => undefined,
		point: null,
		setOpen: (value) => { if (!value) onClose(); },
		setPoint: () => undefined,
		toggle: onClose,
	}, overlayRef);
	const containerProps: Pick<HTMLAttributes<HTMLElement>, 'aria-describedby' | 'aria-labelledby' | 'id' | 'onBlur' | 'onFocus' | 'onKeyDown' | 'onKeyUp' | 'role' | 'tabIndex'> = mergeProps(dialogProps, modalProps);

	//
	// B. Render components

	return (
		<FocusScope contain restoreFocus>
			<div ref={overlayRef}>
				<Sheet.Container {...containerProps} ref={dialogRef} aria-modal="true" className={styles.container}>
					<Sheet.Header className={styles.header}>
						<div aria-hidden="true" className={styles.handle} />
						<div className={styles.heading}>
							<h2 {...titleProps} className={styles.title}>{title}</h2>
							<button aria-label={closeLabel} className={styles.close} onClick={onClose} type="button">
								<IconX aria-hidden="true" size={20} />
							</button>
						</div>
					</Sheet.Header>
					<Sheet.Content disableDrag>
						<div className={styles.body}>{children}</div>
					</Sheet.Content>
				</Sheet.Container>
				<Sheet.Backdrop aria-hidden="true" className={styles.backdrop} onClick={onClose} tabIndex={-1} />
			</div>
		</FocusScope>
	);
}
