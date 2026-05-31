'use client';

import { useAlertsListContext } from '@/components/alerts/list/AlertsList.context';
import { IconCalendarEvent, IconDeviceMobileDown, IconSunset2 } from '@tabler/icons-react';
import { Button } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export default function Component() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const alertsContext = useAlertsListContext();

	//
	// D. Render components

	return (
		<div className={styles.container}>
			<IconSunset2 className={styles.icon} size={50} />
			<h1 className={styles.title}>{t('default:alerts.AlertsListEmpty.title')}</h1>
			<h2 className={styles.subtitle}>{t('default:alerts.AlertsListEmpty.subtitle')}</h2>
			<div className={styles.actionWrapper}>
				{/* <Button icon={<IconCalendarEvent size={18} />} label={t('default:alerts.AlertsListEmpty.action_1')} onClick={() => alertsContext.actions.updateFilterByDate('current')} /> */}
				<Button href="/app" icon={<IconDeviceMobileDown size={18} />} label={t('default:alerts.AlertsListEmpty.action_2')} />
			</div>
		</div>
	);

	//
}
