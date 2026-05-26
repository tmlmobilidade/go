'use client';

import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

/**
 * A custom hook to prevent navigation when there are unsaved changes.
 * @param shouldBlock A boolean indicating whether to block or allow navigation.
 */
export function usePreventNavigation(shouldBlock: boolean) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const destinationUrl = useRef<null | string>(null);

	const originalPushFunctionRef = useRef<null | typeof router.push>(null);

	const shouldBlockRef = useRef(shouldBlock);
	shouldBlockRef.current = shouldBlock;

	//
	// B. Handle actions

	const proceedNavigation = () => {
		// Skip if no destination URL
		if (!destinationUrl.current) return;
		// Use the original push function to navigate
		originalPushFunctionRef.current(destinationUrl.current);
		// Clear destination URL
		destinationUrl.current = null;
	};

	const cancelNavigation = () => {
		destinationUrl.current = null;
	};

	const openModal = useCallback(() => modals.openConfirmModal({
		children: <Text size="sm">Todas as alterações não guardadas serão perdidas.</Text>,
		confirmProps: { variant: 'danger' },
		labels: { cancel: 'Cancelar', confirm: 'Sim, quero sair' },
		onCancel: cancelNavigation,
		onConfirm: proceedNavigation,
		title: 'Tem a certeza que pretende sair desta página?',
	}), []);

	const unblock = useCallback(() => {
		shouldBlockRef.current = false;
	}, []);

	//
	// C. Setup effects

	useEffect(() => {
		// Function to handle navigation attempts
		const handleNavigation = (url: string) => {
			// Store intended destination
			destinationUrl.current = url;
			// Proceed or block navigation based on shouldBlock flag
			if (!shouldBlockRef.current && originalPushFunctionRef.current) originalPushFunctionRef.current(url);
			// Otherwise, open confirmation modal
			else openModal();
		};
		// Store original router.push function
		if (!originalPushFunctionRef.current) originalPushFunctionRef.current = router.push;
		// Override router.push to intercept navigation attempts
		router.push = (url => handleNavigation(url)) as typeof router.push;
		// Cleanup on unmount
		return () => {
			router.push = originalPushFunctionRef.current;
			originalPushFunctionRef.current = null;
		};
	}, [openModal, router]);

	useEffect(() => {
		// Setup before unload listener to warn user about unsaved changes
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			// Warn user about unsaved changes
			if (shouldBlockRef.current) {
				// Prevent the default behavior of the event
				event.preventDefault();
				// Chrome requires returnValue to be set
				event.returnValue = 'Are you sure you want to leave?';
			}
		};
		// Setup before unload listener based (navigation change)
		window.addEventListener('beforeunload', handleBeforeUnload);
		// Cleanup listener on unmount or when shouldBlock changes
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, []);

	useEffect(() => {
		// Handle back/forward button press
		const handleCloseButton = (event: PopStateEvent) => {
			if (shouldBlockRef.current) {
				// Prevent navigation
				event.preventDefault();
				event.stopPropagation();
				// Store intended destination
				destinationUrl.current = document.referrer;
				// Re-add current state to history to prevent navigation
				history.pushState(null, '', window.location.href);
				// Open confirmation modal
				openModal();
			}
		};
		// Setup listener for popstate events (back/forward navigation)
		window.addEventListener('popstate', handleCloseButton);
		// Cleanup listener on unmount
		return () => {
			window.removeEventListener('popstate', handleCloseButton);
		};
	}, [openModal]);

	//
	// D. Return values

	return unblock;

	//
};
