'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Checkbox, Collapsible, Grid, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopDetailsSectionConnections() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const { t } = useTranslation('stops', { keyPrefix: 'detail.sections.connections' });

	//
	// B. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section>
				<Grid columns="abcd" gap="md">
					<Checkbox
						label={t('fields.subway')}
						{...stopDetailContext.data.form.getInputProps('near_subway')}
					/>
					<Checkbox
						label={t('fields.lightRail')}
						{...stopDetailContext.data.form.getInputProps('near_light_rail')}
					/>
					<Checkbox
						label={t('fields.train')}
						{...stopDetailContext.data.form.getInputProps('near_train')}
					/>
					<Checkbox
						label={t('fields.boat')}
						{...stopDetailContext.data.form.getInputProps('near_boat')}
					/>
					<Checkbox
						label={t('fields.airport')}
						{...stopDetailContext.data.form.getInputProps('near_airport')}
					/>
					<Checkbox
						label={t('fields.bikeSharing')}
						{...stopDetailContext.data.form.getInputProps('near_bike_sharing')}
					/>
					<Checkbox
						label={t('fields.bikeParking')}
						{...stopDetailContext.data.form.getInputProps('neawr_bike_parking')}
					/>
					<Checkbox
						label={t('fields.carParking')}
						{...stopDetailContext.data.form.getInputProps('near_car_parking')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
