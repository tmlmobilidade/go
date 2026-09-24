'use client';

/* * */

import { type HTMLAttributes, type ReactNode, type RefObject, useEffect, useRef } from 'react';
import { FocusScope, mergeProps, useDialog, useModal, useModalProvider, useOverlay } from 'react-aria';

/* * */

type BottomSheetContainerProps = Pick<HTMLAttributes<HTMLElement>, 'aria-describedby' | 'aria-hidden' | 'aria-labelledby' | 'onBlur' | 'onFocus' | 'onKeyDown' | 'onKeyUp' | 'role' | 'tabIndex'> & {
	'data-ismodal'?: boolean
};

interface BottomSheetAccessibilityRenderProps {
	containerProps: BottomSheetContainerProps
	containerRef: RefObject<HTMLDivElement | null>
	titleProps: HTMLAttributes<HTMLElement>
}

interface BottomSheetAccessibilityProps {
	children: (props: BottomSheetAccessibilityRenderProps) => ReactNode
	initialFocusRef?: RefObject<HTMLElement | null>
	modality: 'modal' | 'non-modal'
	onClose: () => void
}

/* * */

export function BottomSheetAccessibility({ children, initialFocusRef, modality, onClose }: BottomSheetAccessibilityProps) {
	//

	//
	// A. Setup variables

	const containerRef = useRef<HTMLDivElement>(null);
	const isModal = modality === 'modal';
	const dialog = useDialog({}, containerRef);
	const overlay = useOverlay({ isDismissable: false, isOpen: true, onClose }, containerRef);
	const modal = useModal({ isDisabled: !isModal });
	const modalProvider = useModalProvider();
	const containerProps = mergeProps(dialog.dialogProps, overlay.overlayProps, modal.modalProps, modalProvider.modalProviderProps);

	//
	// B. Setup effects

	useEffect(() => {
		if (!initialFocusRef) return;

		const animationFrameId = window.requestAnimationFrame(() => {
			initialFocusRef.current?.focus({ preventScroll: true });
		});

		return () => window.cancelAnimationFrame(animationFrameId);
	}, [initialFocusRef]);

	//
	// C. Render components

	return (
		<FocusScope autoFocus={isModal && !initialFocusRef} contain={isModal} restoreFocus>
			{children({ containerProps, containerRef, titleProps: dialog.titleProps })}
		</FocusScope>
	);

	//
}
