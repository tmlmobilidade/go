'use client';

import { IconMapPin } from '@tabler/icons-react';
import { type LocationItem } from '@tmlmobilidade/go-types-locations';
import { Button, LocationsSelect, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAnnotationsLocationsData } from '../use-annotations-locations-data';

/* * */

interface AnnotationsLocationsSelectProps {
	error?: string
	onChange: (value: LocationItem[]) => void
	readOnly: boolean
	value?: LocationItem[]
}

/* * */

export function AnnotationsLocationsSelect({ error, onChange, readOnly, value }: AnnotationsLocationsSelectProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { error: lookupError, isLoading, isValidating, locationsById, mutate, tree } = useAnnotationsLocationsData();

	//
	// B. Transform data

	// Retain saved selections during loading, lookup failures or reference-data changes.
	const savedById = useMemo(() => new Map((value ?? []).map(location => [String(location.osm_id), location])), [value]);
	const selectedIds = useMemo(() => [...savedById.keys()], [savedById]);

	//
	// C. Handle actions

	const handleChange = (ids: string[]) => {
		const locations: LocationItem[] = [];
		for (const id of new Set(ids)) {
			const location = locationsById.get(id) ?? savedById.get(id);
			if (!location) return;
			locations.push(location);
		}
		onChange(locations);
	};

	//
	// D. Render components

	return (
		<Section gap="xs" padding="none">
			<LocationsSelect
				description={t('annotations:AnnotationsLocationsSelect.description')}
				disabled={isLoading}
				error={error ?? (lookupError ? t('annotations:AnnotationsLocationsSelect.load_error') : undefined)}
				fallbackLocations={value}
				label={t('annotations:AnnotationsLocationsSelect.label')}
				leftSection={<IconMapPin size={18} aria-hidden />}
				maxDropdownHeight={320}
				onChange={handleChange}
				readOnly={readOnly || !!lookupError}
				tree={tree}
				value={selectedIds}
				w="100%"
				clearable
				groups
			/>
			{lookupError && <Button label={t('annotations:AnnotationsLocationsSelect.retry')} loading={isValidating} onClick={() => mutate()} size="xs" variant="transparent" />}
		</Section>
	);
}
