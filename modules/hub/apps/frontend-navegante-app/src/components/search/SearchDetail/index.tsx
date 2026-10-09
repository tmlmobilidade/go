'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { Search } from '@/components/search/Search';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { clearSearchDraft } from '@/utils/search/search-draft';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function SearchDetail() {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, pop } = useBottomSheet();
	const { t } = useTranslation();
	const inputRef = useRef<HTMLInputElement>(null);
	const isOpen = activeBottomSheet?.view === 'search';
	const [isMounted, setIsMounted] = useState(isOpen);

	//
	// B. Handle actions

	const handleOpenStart = () => {
		setIsMounted(true);
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
			accessibleTitle={t('default:search.Search.title')}
			avoidKeyboard={false}
			headerMode="handle"
			initialFocusRef={inputRef}
			modality="modal"
			onClose={handleClose}
			onCloseEnd={() => setIsMounted(false)}
			onOpenStart={handleOpenStart}
			opened={isOpen}
			size="full"
			withCompactCloseButton
		>
			<Search inputRef={inputRef} />
		</BottomSheet>
	);
}
