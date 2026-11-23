'use client';

import { Grid, Section, useStandardFormWatch, ValueDisplay } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsGetLocationData } from '../../shared/use-stops-get-location-data';
import { useStopsCreateFormContext } from '../StopsCreateForm.context';

/* * */

export function StopsCreateStepLocationDetails() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form } = useStopsCreateFormContext();

	const latitudeValue = useStandardFormWatch({ control: form.control, name: 'latitude' });
	const longitudeValue = useStandardFormWatch({ control: form.control, name: 'longitude' });

	//
	// B. Fetch data

	const { data: locationData, isLoading } = useStopsGetLocationData({
		latitude: latitudeValue,
		longitude: longitudeValue,
	});

	//
	// C. Render components

	return (
		<Section>
			<Grid columns="ab" gap="md">
				<ValueDisplay
					isLoading={isLoading}
					label={t('stops:create.StopsCreateStepLocationDetails.fields.location_primary.label')}
					value={locationData?.primary.name ?? t('stops:create.StopsCreateStepLocationDetails.not_available')}
					variant="bordered"
				/>
				<ValueDisplay
					isLoading={isLoading}
					label={t('stops:create.StopsCreateStepLocationDetails.fields.location_secondary.label')}
					value={locationData?.secondary.name ?? t('stops:create.StopsCreateStepLocationDetails.not_available')}
					variant="bordered"
				/>
				<ValueDisplay
					isLoading={isLoading}
					label={t('stops:create.StopsCreateStepLocationDetails.fields.location_tertiary.label')}
					value={locationData?.tertiary.name ?? t('stops:create.StopsCreateStepLocationDetails.not_available')}
					variant="bordered"
				/>
				<ValueDisplay
					isLoading={isLoading}
					label={t('stops:create.StopsCreateStepLocationDetails.fields.location_neighbourhood.label')}
					value={locationData?.neighbourhood?.name ?? t('stops:create.StopsCreateStepLocationDetails.not_available')}
					variant="bordered"
				/>
			</Grid>
		</Section>
	);
}
