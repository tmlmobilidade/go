'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/shape/parameters/create/ParameterCreate.context';
import { IconClock, IconGauge, IconMapPin, IconPlayerTrackNext } from '@tabler/icons-react';
import { Section, Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

function formatSeconds(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	if (h > 0) return `${h}h ${m}m ${s}s`;
	if (m > 0) return `${m}m ${s}s`;
	return `${s}s`;
}

function formatDistance(meters: number): string {
	if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
	return `${Math.round(meters)} m`;
}

/* * */

interface MetricTileProps {
	icon: React.ReactNode
	label: string
	value: string
}

function MetricTile({ icon, label, value }: MetricTileProps) {
	return (
		<div className={styles.tile}>
			<div className={styles.tileIcon}>{icon}</div>
			<Section gap="xs" padding="none">
				<Text c="var(--color-system-text-200)" size="xs">{label}</Text>
				<Text weight="semibold">{value}</Text>
			</Section>
		</div>
	);
}

/* * */

export function ParameterCreateSummaryCard() {
	const ctx = useParameterCreateContext();
	const { avgCommercialSpeed, pureDwellSeconds, totalDistance, travelTimes } = ctx.data.parameterForUI;

	return (
		<Section flexDirection="row" gap="sm" padding="none">
			<MetricTile
				icon={<IconMapPin size={18} />}
				label="Distância total"
				value={totalDistance > 0 ? formatDistance(totalDistance) : '—'}
			/>

			<MetricTile
				icon={<IconClock size={18} />}
				label="Duração total"
				value={travelTimes.totalTripSecondsWithStops.formatted || '—'}
			/>

			<MetricTile
				icon={<IconPlayerTrackNext size={18} />}
				label="Tempo de viagem"
				value={travelTimes.totalTripSecondsWithoutStops.formatted || '—'}
			/>

			<MetricTile
				icon={<IconClock size={18} />}
				label="Tempo de paragens"
				value={pureDwellSeconds > 0 ? formatSeconds(pureDwellSeconds) : '—'}
			/>

			<MetricTile
				icon={<IconGauge size={18} />}
				label="Vel. média comercial"
				value={avgCommercialSpeed != null ? `${avgCommercialSpeed} km/h` : '—'}
			/>
		</Section>
	);
}
