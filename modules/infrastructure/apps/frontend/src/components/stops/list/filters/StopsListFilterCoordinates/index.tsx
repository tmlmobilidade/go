'use client';

import { CoordinatesInput, FilterWrapper, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListFilterCoordinates } from './use-stops-list-filter-coordinates';

/* * */

export function StopsListFilterCoordinates() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterCoordinates = useStopsListFilterCoordinates();

	const [latitude, longitude] = filterCoordinates.value.split(',').map((value) => {
		if (!value.trim()) return undefined;
		const coordinate = Number(value);
		return Number.isFinite(coordinate) ? coordinate : undefined;
	});

	//
	// B. Handle actions

	const handleSetCoordinates = (value?: [number | undefined, number | undefined]) => {
		const [latitude, longitude] = value ?? [];
		filterCoordinates.set(latitude === undefined && longitude === undefined ? '' : `${latitude ?? ''}, ${longitude ?? ''}`);
	};

	//
	// C. Render components

	return (
		<FilterWrapper
			active={filterCoordinates.isActive}
			label={t('stops:list.StopsListFilterCoordinates.label')}
		>
			<Section gap="sm" height="auto" padding="md" width="auto">
				<CoordinatesInput
					onDraftChange={handleSetCoordinates}
					value={[latitude, longitude]}
				/>
				<Label size="sm" variant="muted">
					{t(filterCoordinates.isInvalid ? 'stops:list.StopsListFilterCoordinates.invalid' : 'stops:list.StopsListFilterCoordinates.description')}
				</Label>
			</Section>
		</FilterWrapper>
	);
}
