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

	const { t } = useTranslation();
	const stopDetailContext = useStopDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('stops:stops.detail.StopDetailsSectionConnections.description')}
			title={t('stops:stops.detail.StopDetailsSectionConnections.title')}
		>
			<Section>
				<Grid columns="abcd" gap="md">
					<Checkbox
						label={t('stops:stops.detail.StopDetailsSectionConnections.fields.subway.label')}
						{...stopDetailContext.data.form.getInputProps('near_subway')}
					/>
					<Checkbox
						label={t('stops:stops.detail.StopDetailsSectionConnections.fields.light_rail.label')}
						{...stopDetailContext.data.form.getInputProps('near_light_rail')}
					/>
					<Checkbox
						label={t('stops:stops.detail.StopDetailsSectionConnections.fields.train.label')}
						{...stopDetailContext.data.form.getInputProps('near_train')}
					/>
					<Checkbox
						label={t('stops:stops.detail.StopDetailsSectionConnections.fields.boat.label')}
						{...stopDetailContext.data.form.getInputProps('near_boat')}
					/>
					<Checkbox
						label={t('stops:stops.detail.StopDetailsSectionConnections.fields.airport.label')}
						{...stopDetailContext.data.form.getInputProps('near_airport')}
					/>
					<Checkbox
						label={t('stops:stops.detail.StopDetailsSectionConnections.fields.bike_sharing.label')}
						{...stopDetailContext.data.form.getInputProps('near_bike_sharing')}
					/>
					<Checkbox
						label={t('stops:stops.detail.StopDetailsSectionConnections.fields.bike_parking.label')}
						{...stopDetailContext.data.form.getInputProps('neawr_bike_parking')}
					/>
					<Checkbox
						label={t('stops:stops.detail.StopDetailsSectionConnections.fields.car_parking.label')}
						{...stopDetailContext.data.form.getInputProps('near_car_parking')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
