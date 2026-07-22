'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { OmniSearch } from '@/components/search/OmniSearch';
import { useRef, useState } from 'react';

/* * */

export function SearchDetail() {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();
	const inputRef = useRef<HTMLInputElement>(null);
	const isOpen = activeBottomSheet?.view === 'search';
	const [isMounted, setIsMounted] = useState(isOpen);

	//
	// B. Handle actions

	const handleOpenEnd = () => {
		inputRef.current?.focus({ preventScroll: true });
	};

	if (!isOpen && !isMounted) return null;

	//
	// C. Render components

	return (
		<BottomSheet
			avoidKeyboard={false}
			headerMode="handle"
			onClose={closeActiveBottomSheet}
			onCloseEnd={() => setIsMounted(false)}
			onOpenEnd={handleOpenEnd}
			onOpenStart={() => setIsMounted(true)}
			opened={isOpen}
			size="full"
			snapPoints={[0, 1]}
			withCompactCloseButton
		>
			<OmniSearch inputRef={inputRef} />
		</BottomSheet>
	);
}
