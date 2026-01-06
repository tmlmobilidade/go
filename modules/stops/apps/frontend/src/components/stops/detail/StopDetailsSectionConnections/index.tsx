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

	const { t } = useTranslation('stops');
	const stopDetailContext = useStopDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('stops.detail.SectionConnections.description')}
			title={t('stops.detail.SectionConnections.title')}
		>
			<Section>
				<Grid columns="abcd" gap="md">
					<Checkbox
						label={t('stops.detail.SectionConnections.fields.subway')}
						{...stopDetailContext.data.form.getInputProps('near_subway')}
					/>
					<Checkbox
						label={t('stops.detail.SectionConnections.fields.light_rail')}
						{...stopDetailContext.data.form.getInputProps('near_light_rail')}
					/>
					<Checkbox
						label={t('stops.detail.SectionConnections.fields.train')}
						{...stopDetailContext.data.form.getInputProps('near_train')}
					/>
					<Checkbox
						label={t('stops.detail.SectionConnections.fields.boat')}
						{...stopDetailContext.data.form.getInputProps('near_boat')}
					/>
					<Checkbox
						label={t('stops.detail.SectionConnections.fields.airport')}
						{...stopDetailContext.data.form.getInputProps('near_airport')}
					/>
					<Checkbox
						label={t('stops.detail.SectionConnections.fields.bike_sharing')}
						{...stopDetailContext.data.form.getInputProps('near_bike_sharing')}
					/>
					<Checkbox
						label={t('stops.detail.SectionConnections.fields.bike_parking')}
						{...stopDetailContext.data.form.getInputProps('neawr_bike_parking')}
					/>
					<Checkbox
						label={t('stops.detail.SectionConnections.fields.car_parking')}
						{...stopDetailContext.data.form.getInputProps('near_car_parking')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
