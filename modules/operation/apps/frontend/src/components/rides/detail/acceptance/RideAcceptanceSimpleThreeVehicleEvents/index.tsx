'use client';

import { IconCheck, IconMinus, IconX } from '@tabler/icons-react';
import { type RideAcceptance } from '@tmlmobilidade/go-types-operation';
import { Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { RideAcceptanceCheck } from '../RideAcceptanceCheck';

/* * */

const segments = ['first', 'middle', 'last'] as const;
const segmentResults = {
	ALL_STOPS_FOUND: ['detected', 'detected', 'detected'],
	MISSING_FIRST_STOPS: ['missing', 'unevaluated', 'unevaluated'],
	MISSING_LAST_STOPS: ['detected', 'detected', 'missing'],
	MISSING_MIDDLE_STOPS: ['detected', 'missing', 'unevaluated'],
	NO_VEHICLE_EVENTS: ['missing', 'missing', 'missing'],
} as const;
const segmentIcons = { detected: IconCheck, missing: IconX, unevaluated: IconMinus };

/* * */

export function RideAcceptanceSimpleThreeVehicleEvents({ check }: { check: RideAcceptance['analysis_summary'][string] }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const { reason } = check;
	const results = reason && Object.hasOwn(segmentResults, reason) ? segmentResults[reason as keyof typeof segmentResults] : undefined;

	//
	// C. Render components

	return (
		<RideAcceptanceCheck check={check} title={t('default:rides.acceptance.RideAcceptanceSimpleThreeVehicleEvents.title')} open>
			<div>
				<Text weight="bold">{t('default:rides.acceptance.RideAcceptanceSimpleThreeVehicleEvents.criterion_title')}</Text>
				<Text>{t('default:rides.acceptance.RideAcceptanceSimpleThreeVehicleEvents.criterion')}</Text>
			</div>
			<div className={styles.segments}>
				{segments.map((segment, index) => {
					const result = results?.[index] ?? 'unevaluated';
					const Icon = segmentIcons[result];
					return (
						<div key={segment} className={styles.segment} data-result={result}>
							<span className={styles.segmentIcon}><Icon size={21} aria-hidden /></span>
							<div>
								<Text weight="bold">{t(`default:rides.acceptance.RideAcceptanceSimpleThreeVehicleEvents.segments.${segment}`)}</Text>
								<Text size="sm">{t(`default:rides.acceptance.RideAcceptanceSimpleThreeVehicleEvents.segment_results.${result}`)}</Text>
							</div>
						</div>
					);
				})}
			</div>
		</RideAcceptanceCheck>
	);

	//
}
