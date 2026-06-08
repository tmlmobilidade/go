'use client';

import { ActionBarButton } from '@/components/common/action-bar/ActionBarButton';
import { ActionBarUserLocation } from '@/components/common/action-bar/ActionBarUserLocation';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { IconAlertTriangle, IconQuestionMark, IconReload, IconSearch } from '@tabler/icons-react';
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
				icon={<IconQuestionMark size={30} />}
				label={t('default:action-bar.ActionBar.help.label')}
				onClick={() => setActiveBottomSheet({ view: 'help' })}
			/>
			<ActionBarButton
				icon={<IconReload size={30} />}
				label="reload"
				onClick={() => window.location.reload()}
			/>

			<Spacer orientation="vertical" size="full" />

			<ActionBarButton
				icon={<IconAlertTriangle size={28} />}
				label={t('default:action-bar.ActionBar.alerts.label')}
				onClick={() => setActiveBottomSheet({ view: 'alerts-list' })}
			/>

			<ActionBarButton
				icon={<IconSearch size={28} />}
				label={t('default:action-bar.ActionBar.search.label')}
				onClick={() => setActiveBottomSheet({ view: 'search' })}
			/>

			<ActionBarUserLocation />

		</div>
	);
}
