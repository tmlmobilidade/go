'use client';

import { IconArrowUpRight } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type RideJustification } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, Section, Tag, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RideAcceptanceJustificationReadOnly({ justification }: { justification: null | RideJustification }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	if (!justification) {
		return <Text c="var(--color-system-text-200)">{t('default:rides.acceptance.RideAcceptanceJustificationReadOnly.empty')}</Text>;
	}

	return (
		<Section gap="sm" padding="none">
			<Tag
				label={t(`default:rides.acceptance.RideAcceptanceJustificationReadOnly.source.${justification.justification_source}`)}
				variant={justification.justification_source === 'alert' ? 'primary' : 'secondary'}
			/>
			<div>
				<Text c="var(--color-system-text-200)" size="sm">{t('default:rides.acceptance.RideAcceptanceJustificationReadOnly.cause')}</Text>
				<Text weight="bold">{t(`shared:alerts.causes.${justification.justification_cause}.title`)}</Text>
			</div>
			<div>
				<Text c="var(--color-system-text-200)" size="sm">{t('default:rides.acceptance.RideAcceptanceJustificationReadOnly.message')}</Text>
				<Text className={styles.message}>{justification.pto_message}</Text>
			</div>
			{justification.manual_trip_id && (
				<div>
					<Text c="var(--color-system-text-200)" size="sm">{t('default:rides.acceptance.RideAcceptanceJustificationReadOnly.manual_trip_id')}</Text>
					<Text className={styles.message}>{justification.manual_trip_id}</Text>
				</div>
			)}
			{justification.justification_source === 'alert' && justification.alert_id && (
				<HasPermission action={PermissionCatalog.all.alerts.actions.read} scope={PermissionCatalog.all.alerts.scope}>
					<Button
						href={PAGE_ROUTES.operation.ALERTS_DETAIL(justification.alert_id)}
						label={t('default:rides.acceptance.RideAcceptanceJustificationReadOnly.view_alert')}
						rightSection={<IconArrowUpRight size={16} aria-hidden />}
						variant="transparent"
					/>
				</HasPermission>
			)}
		</Section>
	);

	//
}
