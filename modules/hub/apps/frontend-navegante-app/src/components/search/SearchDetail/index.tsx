'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { Search } from '@/components/search/Search';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { clearSearchDraft } from '@/utils/search/search-draft';
import { useRef, useState } from 'react';

/* * */

export function SearchDetail() {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, pop } = useBottomSheet();
	const inputRef = useRef<HTMLInputElement>(null);
	const isOpen = activeBottomSheet?.view === 'search';
	const [isMounted, setIsMounted] = useState(isOpen);

	//
	// B. Handle actions

	const focusInput = () => {
		window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
	};

	const handleOpenStart = () => {
		setIsMounted(true);
		focusInput();
	};

	const handleOpenEnd = () => {
		focusInput();
	};

	const handleClose = () => {
		clearSearchDraft();
		pop();
	};

	if (!isOpen && !isMounted) return null;

	//
	// C. Render components

	return (
		<BottomSheet
			avoidKeyboard={false}
			headerMode="handle"
			onClose={handleClose}
			onCloseEnd={() => setIsMounted(false)}
			onOpenEnd={handleOpenEnd}
			onOpenStart={handleOpenStart}
			opened={isOpen}
			size="full"
			withCompactCloseButton
		>
			<Search inputRef={inputRef} />
		</BottomSheet>
	);
}
