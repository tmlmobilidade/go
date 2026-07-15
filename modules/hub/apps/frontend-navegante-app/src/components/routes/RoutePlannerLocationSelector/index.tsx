'use client';

import { type RoutePlannerLocation } from '@/utils/route-planner-motis';
import { IconArrowsUpDown, IconMapPinFilled, IconPointFilled } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerLocationSelectorProps {
	destination: null | RoutePlannerLocation
	onDestinationClick: () => void
	onOriginClick: () => void
	onSwap: () => void
	origin: null | RoutePlannerLocation
}

/* * */

export function RoutePlannerLocationSelector({ destination, onDestinationClick, onOriginClick, onSwap, origin }: RoutePlannerLocationSelectorProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<div className={styles.track}>
				<IconPointFilled className={styles.originDot} size={13} />
				<span className={styles.trackLine} />
				<IconMapPinFilled className={styles.destinationPin} size={15} />
			</div>

			<div className={styles.fields}>
				<button className={styles.fieldButton} onClick={onOriginClick} type="button">
					<span className={styles.label}>{t('default:routes.RoutePlannerInput.origin.label')}</span>
					<span className={styles.value}>{origin?.label || t('default:routes.RoutePlannerInput.origin.placeholder')}</span>
				</button>

				<button className={styles.fieldButton} onClick={onDestinationClick} type="button">
					<span className={styles.label}>{t('default:routes.RoutePlannerInput.destination.label')}</span>
					<span className={styles.value}>{destination?.label || t('default:routes.RoutePlannerInput.destination.placeholder')}</span>
				</button>
			</div>

			<button
				aria-label={t('default:routes.RoutePlannerInput.swap')}
				className={styles.swapButton}
				onClick={onSwap}
				type="button"
			>
				<IconArrowsUpDown size={16} />
			</button>
		</div>
	);

	//
}
