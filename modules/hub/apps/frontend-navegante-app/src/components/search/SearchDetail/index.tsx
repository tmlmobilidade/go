'use client';

import { BottomSheet } from '@/components/viewport/BottomSheet';
import { useBottomSheet } from '@/hooks/use-bottom-sheet';
import { TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function SearchDetail() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { activeBottomSheet, setActiveBottomSheet } = useBottomSheet();

	//
	// B. Render components

	return (
		<BottomSheet
			onClose={() => setActiveBottomSheet(null)}
			opened={activeBottomSheet === 'search'}
			title={t('default:search.SearchDetail.title')}
		>

			<TextInput placeholder="Pesquisar por nome, número..." />

		</BottomSheet>
	);
}
