'use client';

import { ActionBarButton } from '@/components/common/action-bar/ActionBarButton';
import { ActionBarUserLocation } from '@/components/common/action-bar/ActionBarUserLocation';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { IconAlertTriangle, IconQuestionMark, IconSearch } from '@tabler/icons-react';
import { Spacer } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function ActionBar() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { setActiveBottomSheet } = useBottomSheet();

	//
	// B. Render components

	return (
		<div className={styles.container}>

			<ActionBarButton
				ariaHint={t('default:action-bar.ActionBar.help.aria-hint')}
				ariaLabel={t('default:action-bar.ActionBar.help.aria-label')}
				icon={<IconQuestionMark size={30} />}
				onClick={() => setActiveBottomSheet({ view: 'help' })}
			/>

			<Spacer orientation="vertical" size="full" />

			<ActionBarButton
				ariaHint={t('default:action-bar.ActionBar.alerts.aria-hint')}
				ariaLabel={t('default:action-bar.ActionBar.alerts.aria-label')}
				icon={<IconAlertTriangle size={28} />}
				onClick={() => setActiveBottomSheet({ view: 'alerts-list' })}
			/>

			<ActionBarButton
				ariaHint={t('default:action-bar.ActionBar.search.aria-hint')}
				ariaLabel={t('default:action-bar.ActionBar.search.aria-label')}
				icon={<IconSearch size={28} />}
				onClick={() => setActiveBottomSheet({ view: 'search' })}
			/>

			<ActionBarUserLocation />

		</div>
	);
}
