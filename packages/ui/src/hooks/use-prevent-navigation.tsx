/* * */

import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/* * */

export function usePreventNavigation(shouldBlock: boolean) {
	//

	const router = useRouter();

	const pathname = usePathname();

	const [nextRoute, setNextRoute] = useState<null | string>(null);
	const originalPushRef = useRef(router.push); // Store original router.push
	const lastLocationRef = useRef<null | string>(null); // Store last visited route

	// ✅ Check if navigation is allowed

	useEffect(() => {
		const handleNavigation = (url: string) => {
			setNextRoute(url);
			if (!shouldBlock || url === pathname) {
				originalPushRef.current(url);
				return;
			}
			openModal();
		};
		router.push = ((url, _options) => {
			handleNavigation(url);
		}) as typeof router.push;
		return () => {
			router.push = originalPushRef.current;
		};
	}, [shouldBlock, pathname]);

	// 🔄 Prevent Page Reloads
	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (shouldBlock) {
				event.preventDefault();
				event.returnValue = 'Are you sure you want to leave?';
			}
		};
		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [shouldBlock]);

	// 🔙 Handle Back Button Navigation
	useEffect(() => {
		const handleBackButton = (event: PopStateEvent) => {
			if (shouldBlock) {
				event.preventDefault();
				const previousURL = lastLocationRef.current || document.referrer || '/'; // Fallback to home if unknown
				setNextRoute(previousURL);
				history.pushState(null, '', window.location.href); // Keep user on the same page
				openModal();
			}
		};
		lastLocationRef.current = pathname; // Track last known location
		history.pushState(null, '', window.location.href);
		window.addEventListener('popstate', handleBackButton);
		return () => {
			window.removeEventListener('popstate', handleBackButton);
		};
	}, [shouldBlock, pathname]);

	// ✅ Proceed or Cancel Navigation

	const proceedNavigation = () => {
		console.log('Navigating to:', nextRoute);
		if (nextRoute) {
			originalPushRef.current(nextRoute); // Navigate to previous or next route
			setNextRoute(null);
		}
	};

	const cancelNavigation = () => {
		setNextRoute(null);
	};

	const openModal = () => modals.openConfirmModal({
		children: (
			<Text size="sm">
				This action is so important that you are required to confirm it with a modal. Please click
				one of these buttons to proceed.
			</Text>
		),
		labels: { cancel: 'Cancel', confirm: 'Confirm' },
		onCancel: cancelNavigation,
		onConfirm: proceedNavigation,
		title: 'Please confirm your action',
	});

	return { cancelNavigation, proceedNavigation };

	//
};
