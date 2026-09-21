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
					label={t('default:stops.create.StepLocationDetails.fields.district.label')}
					value={locationData?.district?.name ?? t('default:stops.shared.not_available')}
					variant="bordered"
				/>
				<ValueDisplay
					isLoading={isLoading}
					label={t('default:stops.create.StepLocationDetails.fields.municipality.label')}
					value={locationData?.municipality?.name ?? t('default:stops.shared.not_available')}
					variant="bordered"
				/>
				<ValueDisplay
					isLoading={isLoading}
					label={t('default:stops.create.StepLocationDetails.fields.parish.label')}
					value={locationData?.parish?.name ?? t('default:stops.shared.not_available')}
					variant="bordered"
				/>
				<ValueDisplay
					isLoading={isLoading}
					label={t('default:stops.create.StepLocationDetails.fields.locality.label')}
					value={locationData?.locality?.name ?? t('default:stops.shared.not_available')}
					variant="bordered"
				/>
			</Grid>
		</Section>
	);
}
