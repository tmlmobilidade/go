'use client';

import { type Latitude, type Longitude } from '@tmlmobilidade/go-types-geo';
import { CoordinatesInput, ErrorDisplay, Pane, Section, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsDetailUpdateCoordinatesFormContext } from '../StopsDetailUpdateCoordinatesForm.context';
import { StopsDetailUpdateCoordinatesModalHeader } from '../StopsDetailUpdateCoordinatesModalHeader';
import { StopsDetailUpdateCoordinatesModalMap } from '../StopsDetailUpdateCoordinatesModalMap';

/* * */

export function StopsDetailUpdateCoordinatesModal() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useStopsDetailUpdateCoordinatesFormContext();

	const latitudeValue = useStandardFormWatch({ control: form.control, name: 'latitude' });
	const longitudeValue = useStandardFormWatch({ control: form.control, name: 'longitude' });

	//
	// B. Handle actions

	const handleSetCoordinates = (value?: [number | undefined, number | undefined]) => {
		form.setValue('latitude', value?.[0] as Latitude, { shouldDirty: true, shouldValidate: true });
		form.setValue('longitude', value?.[1] as Longitude, { shouldDirty: true, shouldValidate: true });
	};

	//
	// C. Render components

	return (
		<Pane header={[<StopsDetailUpdateCoordinatesModalHeader key="header" />]}>
			<StopsDetailUpdateCoordinatesModalMap />
			<Section>
				<CoordinatesInput
					disabled={!capabilities.editEnabled}
					label={`${t('stops:detail.StopsDetailUpdateCoordinatesModal.fields.latitude.label')} / ${t('stops:detail.StopsDetailUpdateCoordinatesModal.fields.longitude.label')}`}
					onChange={handleSetCoordinates}
					onDraftChange={handleSetCoordinates}
					value={[latitudeValue, longitudeValue]}
				/>
				{form.formState.errors.latitude && <ErrorDisplay message={form.formState.errors.latitude.message} />}
				{form.formState.errors.longitude && <ErrorDisplay message={form.formState.errors.longitude.message} />}
			</Section>
		</Pane>
	);
}
