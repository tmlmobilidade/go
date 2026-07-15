'use client';

import { RoutePlannerLocationResults } from '@/components/routes/RoutePlannerLocationResults';
import { type RoutePlannerLocation, type RoutePlannerTravelTime, type RoutePlannerTravelTimeMode } from '@/utils/route-planner-motis';
import { IconArrowsUpDown, IconCurrentLocation, IconMapPinFilled, IconPointFilled } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useMotisLocationSearch } from './useMotisLocationSearch';

/* * */

interface RoutePlannerInputProps {
	destination: null | RoutePlannerLocation
	onDestinationChange: (location: null | RoutePlannerLocation) => void
	onOriginChange: (location: null | RoutePlannerLocation) => void
	onSwap: () => void
	onTravelTimeChange: (date: Date) => void
	onTravelTimeModeChange: (mode: RoutePlannerTravelTimeMode) => void
	origin: null | RoutePlannerLocation
	travelTime: RoutePlannerTravelTime
	variant?: 'compact' | 'default'
	withTravelTimeControls?: boolean
}

/* * */

export function RoutePlannerInput({
	destination,
	onDestinationChange,
	onOriginChange,
	onSwap,
	onTravelTimeChange,
	onTravelTimeModeChange,
	origin,
	travelTime,
	variant = 'default',
	withTravelTimeControls = false,
}: RoutePlannerInputProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [activeField, setActiveField] = useState<'destination' | 'origin' | null>(null);
	const [destinationQuery, setDestinationQuery] = useState('');
	const [originQuery, setOriginQuery] = useState('');

	const originSearch = useMotisLocationSearch(originQuery);
	const destinationSearch = useMotisLocationSearch(destinationQuery);

	//
	// B. Transform data

	useEffect(() => {
		if (origin) setOriginQuery(origin.label);
	}, [origin]);

	useEffect(() => {
		if (destination) setDestinationQuery(destination.label);
	}, [destination]);

	const currentLocationOption = useMemo<RoutePlannerLocation>(() => {
		return {
			detail: t('default:routes.RoutePlannerSearch.origin.current_location_detail'),
			id: CURRENT_LOCATION_OPTION_ID,
			label: t('default:routes.RoutePlannerSearch.origin.current_location'),
			type: 'PLACE',
		};
	}, [t]);

	const isCurrentLocationOrigin = origin?.label === currentLocationOption.label;

	const originSearchData = useMemo(() => {
		if (isCurrentLocationOrigin) return originSearch.data;
		return [currentLocationOption, ...originSearch.data.filter(location => location.id !== CURRENT_LOCATION_OPTION_ID)];
	}, [currentLocationOption, isCurrentLocationOrigin, originSearch.data]);

	//
	// C. Handle actions

	const handleOriginLocationClick = () => {
		handleCurrentLocationSelect(onOriginChange, setOriginQuery, currentLocationOption.label, currentLocationOption.detail);
	};

	const handleOriginQueryChange = (value: string) => {
		setOriginQuery(value);
		onOriginChange(null);
		setActiveField('origin');
	};

	const handleDestinationQueryChange = (value: string) => {
		setDestinationQuery(value);
		onDestinationChange(null);
		setActiveField('destination');
	};

	const handleOriginSelect = (location: RoutePlannerLocation) => {
		if (location.id === CURRENT_LOCATION_OPTION_ID) {
			handleOriginLocationClick();
			setActiveField(null);
			return;
		}

		onOriginChange(location);
		setOriginQuery(location.label);
		setActiveField(null);
	};

	const handleDestinationSelect = (location: RoutePlannerLocation) => {
		onDestinationChange(location);
		setDestinationQuery(location.label);
		setActiveField(null);
	};

	const handleTravelTimeInputChange = (value: string) => {
		const parsedDate = new Date(value);
		if (Number.isNaN(parsedDate.getTime())) return;
		onTravelTimeChange(parsedDate);
	};

	//
	// D. Render components

	return (
		<div className={styles.wrapper} data-variant={variant}>

			<div className={styles.container} data-variant={variant}>

				<div className={styles.track}>
					<IconPointFilled className={styles.originDot} size={16} />
					<span className={styles.trackLine} />
					<IconMapPinFilled className={styles.destinationPin} size={16} />
				</div>

				<div className={styles.fields}>

					<div className={styles.row}>
						<div className={styles.field}>
							<span className={styles.label}>{t('default:routes.RoutePlannerInput.origin.label')}</span>
							<input
								autoComplete="off"
								className={styles.locationValue}
								onChange={event => handleOriginQueryChange(event.currentTarget.value)}
								onFocus={() => setActiveField('origin')}
								placeholder={t('default:routes.RoutePlannerInput.origin.placeholder')}
								type="search"
								value={originQuery}
							/>
							{activeField === 'origin' && (
								<RoutePlannerLocationResults
									error={originSearch.error}
									isLoading={originSearch.isLoading && originSearchData.length === 0}
									loadingLabel={t('default:routes.RoutePlannerInput.search.loading')}
									locations={originSearchData}
									onSelect={handleOriginSelect}
								/>
							)}
						</div>
						{!isCurrentLocationOrigin && (
							<button
								aria-label={t('default:routes.RoutePlannerInput.origin.useLocation')}
								className={styles.locationButton}
								onClick={handleOriginLocationClick}
								type="button"
							>
								<IconCurrentLocation size={20} />
							</button>
						)}
					</div>

					<div className={styles.swapRow}>
						<button
							aria-label={t('default:routes.RoutePlannerInput.swap')}
							className={styles.swapButton}
							onClick={onSwap}
							type="button"
						>
							<IconArrowsUpDown size={16} />
						</button>
					</div>

					<div className={styles.row}>
						<div className={styles.field}>
							<span className={styles.label}>{t('default:routes.RoutePlannerInput.destination.label')}</span>
							<input
								autoComplete="off"
								className={styles.locationValue}
								onChange={event => handleDestinationQueryChange(event.currentTarget.value)}
								onFocus={() => setActiveField('destination')}
								placeholder={t('default:routes.RoutePlannerInput.destination.placeholder')}
								type="search"
								value={destinationQuery}
							/>
							{activeField === 'destination' && (
								<RoutePlannerLocationResults
									error={destinationSearch.error}
									isLoading={destinationSearch.isLoading}
									loadingLabel={t('default:routes.RoutePlannerInput.search.loading')}
									locations={destinationSearch.data}
									onSelect={handleDestinationSelect}
								/>
							)}
						</div>
					</div>

				</div>

			</div>

			{withTravelTimeControls && (
				<>
					<div className={styles.timeControls}>
						<button
							className={styles.timeModeButton}
							data-active={travelTime.mode === 'now'}
							onClick={() => onTravelTimeModeChange('now')}
							type="button"
						>
							{t('default:routes.RoutePlannerInput.time.now')}
						</button>
						<button
							className={styles.timeModeButton}
							data-active={travelTime.mode === 'departure'}
							onClick={() => onTravelTimeModeChange('departure')}
							type="button"
						>
							{t('default:routes.RoutePlannerInput.time.departure')}
						</button>
						<button
							className={styles.timeModeButton}
							data-active={travelTime.mode === 'arrival'}
							onClick={() => onTravelTimeModeChange('arrival')}
							type="button"
						>
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
								value={formatDateForInput(travelTime.date)}
							/>
						</label>
					)}
				</>
			)}

		</div>
	);

	//
}

/* * */

const CURRENT_LOCATION_OPTION_ID = '__current_location__';

/* * */

function formatDateForInput(date: Date) {
	const offset = date.getTimezoneOffset();
	const localDate = new Date(date.getTime() - offset * 60_000);
	return localDate.toISOString().slice(0, 16);
}

/* * */

function handleCurrentLocationSelect(
	onChange: (location: RoutePlannerLocation) => void,
	setQuery: (query: string) => void,
	label: string,
	detail: string,
) {
	if (typeof navigator === 'undefined' || !navigator.geolocation) return;

	navigator.geolocation.getCurrentPosition((position) => {
		const lat = Number(position.coords.latitude.toFixed(6));
		const lon = Number(position.coords.longitude.toFixed(6));
		const location: RoutePlannerLocation = {
			detail,
			label,
			lat,
			lon,
			type: 'PLACE',
		};

		onChange(location);
		setQuery(label);
	});
}
