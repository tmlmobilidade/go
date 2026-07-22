'use client';

import { RoutePlannerLocationIcon } from '@/components/routes/input/RoutePlannerLocationIcon';
import { type RoutePlannerLocation } from '@/types/route-planner';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerLocationResultsProps {
	error: null | string
	isLoading: boolean
	loadingLabel: string
	locations: RoutePlannerLocation[]
	onSelect: (location: RoutePlannerLocation) => void
	variant?: 'dropdown' | 'inline'
}

/* * */

export function RoutePlannerLocationResults({ error, isLoading, loadingLabel, locations, onSelect, variant = 'dropdown' }: RoutePlannerLocationResultsProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const getLocationModeLabels = (location: RoutePlannerLocation) => {
		const labels = getNormalizedModes(location).map((mode) => {
			if (mode === 'SUBWAY' || mode === 'METRO') return t('default:routes.RoutePlannerInput.search.modes.subway');
			if (mode === 'BUS') return t('default:routes.RoutePlannerInput.search.modes.bus');
			if (mode === 'RAIL' || mode === 'TRAIN') return t('default:routes.RoutePlannerInput.search.modes.rail');
			if (mode === 'TRAM' || mode === 'LIGHT_RAIL') return t('default:routes.RoutePlannerInput.search.modes.tram');
			if (mode === 'FERRY' || mode === 'BOAT') return t('default:routes.RoutePlannerInput.search.modes.ferry');
			return mode;
		});

		return Array.from(new Set(labels));
	};

	const getLocationTypeLabel = (location: RoutePlannerLocation) => {
		if (location.type === 'STOP') return t('default:routes.RoutePlannerInput.search.types.stop');
		if (location.type === 'ADDRESS') return t('default:routes.RoutePlannerInput.search.types.address');
		if (location.type === 'PLACE') return t('default:routes.RoutePlannerInput.search.types.place');
		return location.type;
	};

	//
	// C. Setup flags

	if (isLoading) {
		return <div className={styles.locationResultsStatus} data-variant={variant}>{loadingLabel}</div>;
	}

	if (error) {
		return <div className={styles.locationResultsStatus} data-variant={variant}>{error}</div>;
	}

	if (locations.length === 0) return null;

	//
	// D. Render components

	return (
		<div className={styles.locationResults} data-variant={variant}>
			{locations.map(location => (
				<button
					key={`${location.type}-${location.id || location.label}-${location.lat || ''}-${location.lon || ''}`}
					className={styles.locationResult}
					onClick={() => onSelect(location)}
					onMouseDown={event => event.preventDefault()}
					type="button"
				>
					<span className={styles.locationIcon}>
						<RoutePlannerLocationIcon location={location} />
					</span>
					<span className={styles.locationContent}>
						<span className={styles.locationTitle}>{location.label}</span>
						<span className={styles.locationMeta}>
							<span className={styles.locationChip}>{getLocationTypeLabel(location)}</span>
							{getLocationModeLabels(location).map(modeLabel => (
								<span key={modeLabel} className={styles.locationChip}>{modeLabel}</span>
							))}
						</span>
						{getLocationSecondaryLabel(location) && (
							<small>{getLocationSecondaryLabel(location)}</small>
						)}
					</span>
				</button>
			))}
		</div>
	);

	//
}

/* * */

function getLocationSecondaryLabel(location: RoutePlannerLocation) {
	const areas = Array.isArray(location.areas)
		? location.areas.map(area => area.name).filter(Boolean).slice(0, 2)
		: [];

	return areas.join(' | ');
}

function getNormalizedModes(location: RoutePlannerLocation) {
	return Array.isArray(location.modes) ? location.modes.map(mode => mode.toUpperCase()) : [];
}
