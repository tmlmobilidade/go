'use client';

import { RoutePlannerLocationResults } from '@/components/routes/input/RoutePlannerLocationResults';
import { type RoutePlannerLocation } from '@/utils/route-planner-motis';
import { IconCurrentLocation } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface RoutePlannerLocationInputProps {
	actionLabel?: string
	error: null | string
	isActive: boolean
	isLoading: boolean
	label: string
	loadingLabel: string
	locations: RoutePlannerLocation[]
	onAction?: () => void
	onFocus: () => void
	onQueryChange: (value: string) => void
	onSelect: (location: RoutePlannerLocation) => void
	placeholder: string
	query: string
	variant: 'compact' | 'default'
}

/* * */

export function RoutePlannerLocationInput({
	actionLabel,
	error,
	isActive,
	isLoading,
	label,
	loadingLabel,
	locations,
	onAction,
	onFocus,
	onQueryChange,
	onSelect,
	placeholder,
	query,
	variant,
}: RoutePlannerLocationInputProps) {
	return (
		<div className={styles.row} data-variant={variant}>
			<div className={styles.field}>
				<span className={styles.label}>{label}</span>
				<input
					autoComplete="off"
					className={styles.locationValue}
					onChange={event => onQueryChange(event.currentTarget.value)}
					onFocus={onFocus}
					placeholder={placeholder}
					type="search"
					value={query}
				/>
				{isActive && (
					<RoutePlannerLocationResults
						error={error}
						isLoading={isLoading}
						loadingLabel={loadingLabel}
						locations={locations}
						onSelect={onSelect}
					/>
				)}
			</div>

			{onAction && actionLabel && (
				<button aria-label={actionLabel} className={styles.locationButton} onClick={onAction} type="button">
					<IconCurrentLocation size={20} />
				</button>
			)}
		</div>
	);
}
