'use client';

import { type RideAcceptance, type RideAnalysesRegistry } from '@tmlmobilidade/go-types-operation';
import { Label, Section, Surface, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import acceptanceStyles from '../RideAcceptance/styles.module.css';
import styles from './styles.module.css';

import { RideAcceptanceCheck } from '../RideAcceptanceCheck';
import { RideAcceptanceSimpleThreeVehicleEvents } from '../RideAcceptanceSimpleThreeVehicleEvents';

/* * */

export function RideAcceptanceChecks({ summary }: { summary: RideAcceptance['analysis_summary'] }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const checks = Object.entries(summary);

	//
	// C. Render components

	return (
		<Surface className={acceptanceStyles.card}>
			<Section gap="lg" padding="lg">
				<Label size="lg">{t('default:rides.acceptance.RideAcceptanceChecks.title')}</Label>
				{checks.length === 0 ? <Text c="var(--color-system-text-200)">{t('default:rides.acceptance.RideAcceptanceChecks.empty')}</Text> : (
					<div className={styles.checks}>
						<div className={`${styles.row} ${styles.tableHeading}`} aria-hidden>
							<span>{t('default:rides.acceptance.RideAcceptanceChecks.check')}</span>
							<span>{t('default:rides.acceptance.RideAcceptanceChecks.application')}</span>
							<span>{t('default:rides.acceptance.RideAcceptanceChecks.result')}</span>
						</div>
						{checks.map(([id, check]) => id === 'simple_three_vehicle_events' ? (
							<RideAcceptanceSimpleThreeVehicleEvents key={id} check={check} />
						) : (
							<RideAcceptanceCheck
								key={id}
								check={check}
								title={t(`ride_analysis:${id as keyof RideAnalysesRegistry}.label`, { defaultValue: id })}
							/>
						))}
					</div>
				)}
			</Section>
		</Surface>
	);

	//
}
