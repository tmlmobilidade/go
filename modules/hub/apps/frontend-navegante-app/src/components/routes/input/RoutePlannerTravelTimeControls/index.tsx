'use client';

import { type RoutePlannerTravelTime, type RoutePlannerTravelTimeMode } from '@/types/route-planner/models';
import { formatDateTimeLocalInputValue } from '@/utils/route-planner/format';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerTravelTimeControlsProps {
	onTravelTimeChange: (date: Date) => void
	onTravelTimeModeChange: (mode: RoutePlannerTravelTimeMode) => void
	travelTime: RoutePlannerTravelTime
}

/* * */

export function RoutePlannerTravelTimeControls({ onTravelTimeChange, onTravelTimeModeChange, travelTime }: RoutePlannerTravelTimeControlsProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Handle actions

	const handleTravelTimeInputChange = (value: string) => {
		const parsedDate = new Date(value);
		if (Number.isNaN(parsedDate.getTime())) return;
		onTravelTimeChange(parsedDate);
	};

	//
	// C. Render components

	return (
		<>
			<div className={styles.timeControls}>
				<button className={styles.timeModeButton} data-active={travelTime.mode === 'now'} onClick={() => onTravelTimeModeChange('now')} type="button">
					{t('default:routes.RoutePlannerInput.time.now')}
				</button>
				<button className={styles.timeModeButton} data-active={travelTime.mode === 'departure'} onClick={() => onTravelTimeModeChange('departure')} type="button">
					{t('default:routes.RoutePlannerInput.time.departure')}
				</button>
				<button className={styles.timeModeButton} data-active={travelTime.mode === 'arrival'} onClick={() => onTravelTimeModeChange('arrival')} type="button">
					{t('default:routes.RoutePlannerInput.time.arrival')}
				</button>
			</div>

			{travelTime.mode !== 'now' && (
				<label className={styles.timeInputWrapper}>
					<span>{t('default:routes.RoutePlannerInput.time.datetime_label')}</span>
					<input
						className={styles.timeInput}
						onChange={event => handleTravelTimeInputChange(event.currentTarget.value)}
						type="datetime-local"
						value={formatDateTimeLocalInputValue(travelTime.date)}
					/>
				</label>
			)}
		</>
	);

	//
}
