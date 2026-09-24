'use client';

import { RoutePlannerFilterButton } from '@/components/routes/list/RoutePlannerFilterButton';
import { RoutePlannerFilterPanel } from '@/components/routes/list/RoutePlannerFilterPanel';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { type RoutePlannerTravelTime, type RoutePlannerTravelTimeMode } from '@/types/route-planner/models';
import { formatDateTimeLocalInputValue } from '@/utils/route-planner/presentation/format';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerTimeFilterProps {
	id?: string
	onClose: () => void
}

/* * */

export function RoutePlannerTimeFilter({ id, onClose }: RoutePlannerTimeFilterProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const routePlannerContext = useRoutePlannerContext();
	const dateTimeInputId = useId();
	const dateTimeErrorId = useId();
	const [dateTimeDraft, setDateTimeDraft] = useState<null | string>(null);
	const committedDateTime = formatDateTimeLocalInputValue(routePlannerContext.data.travel_time.date);
	const dateTimeValue = dateTimeDraft ?? committedDateTime;
	const hasDateTimeError = dateTimeDraft !== null && !isValidDateTimeLocalValue(dateTimeDraft);

	//
	// B. Handle actions

	const handleTravelTimeModeChange = (mode: RoutePlannerTravelTimeMode) => {
		const nextTravelTime: RoutePlannerTravelTime = {
			date: mode === 'now' || routePlannerContext.data.travel_time.mode === 'now' ? new Date() : routePlannerContext.data.travel_time.date,
			mode,
		};

		routePlannerContext.actions.setTravelTimeMode(mode);
		void routePlannerContext.actions.planRoute({ destination: routePlannerContext.data.destination, origin: routePlannerContext.data.origin, travelTime: nextTravelTime });

		if (mode === 'now') onClose();
	};

	const handleTravelTimeChange = (value: string) => {
		setDateTimeDraft(value);
		if (!isValidDateTimeLocalValue(value)) return;

		const parsedDate = new Date(value);
		const nextTravelTime: RoutePlannerTravelTime = {
			date: parsedDate,
			mode: routePlannerContext.data.travel_time.mode,
		};

		setDateTimeDraft(null);
		routePlannerContext.actions.setTravelTime(parsedDate);
		void routePlannerContext.actions.planRoute({ destination: routePlannerContext.data.destination, origin: routePlannerContext.data.origin, travelTime: nextTravelTime });
	};

	//
	// C. Render components

	return (
		<RoutePlannerFilterPanel
			id={id}
			label={t('default:routes.RoutePlannerInput.time.datetime_label')}
			selection="single"
			footer={routePlannerContext.data.travel_time.mode !== 'now' && (
				<div className={styles.dateTimeField}>
					<label className={styles.dateTimeLabel} htmlFor={dateTimeInputId}>
						<span className={styles.visuallyHidden}>
							{t('default:routes.RoutePlannerInput.time.datetime_label')}
						</span>
						<input
							aria-describedby={hasDateTimeError ? dateTimeErrorId : undefined}
							aria-invalid={hasDateTimeError || undefined}
							className={styles.timeInput}
							id={dateTimeInputId}
							onChange={event => handleTravelTimeChange(event.currentTarget.value)}
							type="datetime-local"
							value={dateTimeValue}
						/>
					</label>
					{hasDateTimeError && (
						<p className={styles.dateTimeError} id={dateTimeErrorId} role="alert">
							{t('default:routes.RoutePlannerInput.time.datetime_invalid')}
						</p>
					)}
				</div>
			)}
		>
			<RoutePlannerFilterButton
				isActive={routePlannerContext.data.travel_time.mode === 'now'}
				name="route-planner-time"
				onClick={() => handleTravelTimeModeChange('now')}
				selection="radio"
				value="now"
			>
				{t('default:routes.RoutePlannerInput.time.now')}
			</RoutePlannerFilterButton>
			<RoutePlannerFilterButton
				isActive={routePlannerContext.data.travel_time.mode === 'departure'}
				name="route-planner-time"
				onClick={() => handleTravelTimeModeChange('departure')}
				selection="radio"
				value="departure"
			>
				{t('default:routes.RoutePlannerInput.time.departure')}
			</RoutePlannerFilterButton>
			<RoutePlannerFilterButton
				isActive={routePlannerContext.data.travel_time.mode === 'arrival'}
				name="route-planner-time"
				onClick={() => handleTravelTimeModeChange('arrival')}
				selection="radio"
				value="arrival"
			>
				{t('default:routes.RoutePlannerInput.time.arrival')}
			</RoutePlannerFilterButton>
		</RoutePlannerFilterPanel>
	);

	//
}

function isValidDateTimeLocalValue(value: string) {
	if (!value) return false;
	return !Number.isNaN(new Date(value).getTime());
}
