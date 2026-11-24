'use client';

import { Button, FilterWrapper, LocationsSelect, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { ANNOTATIONS_WITHOUT_LOCATIONS, useAnnotationsListFilterLocations } from './use-annotations-list-filter-locations';

/* * */

export function AnnotationsListFilterLocations() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const location = useAnnotationsListFilterLocations();

	//
	// B. Render components

	return (
		<FilterWrapper active={location.isActive} label={t('annotations:list.AnnotationsListFilterLocations.label')}>
			<Section gap="sm" padding="md" width={380}>
				<LocationsSelect
					additionalOptions={[{ label: t('annotations:list.AnnotationsListFilterLocations.empty'), value: ANNOTATIONS_WITHOUT_LOCATIONS }]}
					comboboxProps={{ withinPortal: false }}
					description={t('annotations:list.AnnotationsListFilterLocations.description')}
					disabled={location.isLoading || !!location.error}
					error={location.error ? t('annotations:AnnotationsLocationsSelect.load_error') : undefined}
					label={t('annotations:list.AnnotationsListFilterLocations.label')}
					onChange={location.set}
					tree={location.tree}
					value={location.value}
					clearable
					groups
				/>
				{location.error && <Button label={t('annotations:AnnotationsLocationsSelect.retry')} loading={location.isValidating} onClick={() => location.mutate()} size="xs" variant="transparent" />}
				{!!location.value.length && <Button label={t('annotations:list.AnnotationsListFilterLocations.clear')} onClick={() => location.set([])} size="xs" variant="transparent" />}
			</Section>
		</FilterWrapper>
	);
}
