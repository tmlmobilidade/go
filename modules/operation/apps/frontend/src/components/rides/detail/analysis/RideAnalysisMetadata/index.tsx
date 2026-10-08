'use client';

import { Collapsible, displayDuration, displayUnixMilliseconds, Divider, Grid, Section, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useRidesDetailRideData } from '../../shared/use-rides-detail-ride-data';

/* * */

export function RideAnalysisMetadata() {
	//

	//
	// A. Setup variables

	const { data } = useRidesDetailRideData();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible description={t('default:rides.analysis.RideAnalysisMetadata.description')} title={t('default:rides.analysis.RideAnalysisMetadata.title')}>
			<Section gap="md">
				<Grid columns="abc" gap="md">
					<ValueDisplay label={t('default:rides.analysis.RideAnalysisMetadata.fields.operational_date.label')} value={data.operational_date ?? 'N/A'} variant="bordered" />
					<ValueDisplay label={t('default:rides.analysis.RideAnalysisMetadata.fields.shape_id.label')} value={data.shape_id ?? 'N/A'} variant="bordered" />
					<ValueDisplay label={t('default:rides.analysis.RideAnalysisMetadata.fields.trip_id.label')} value={data.trip_id ?? 'N/A'} variant="bordered" />
					<ValueDisplay label={t('default:rides.analysis.RideAnalysisMetadata.fields.vehicle_ids.label')} value={data.vehicle_ids.join(', ') ?? 'N/A'} variant="bordered" />
					<ValueDisplay label={t('default:rides.analysis.RideAnalysisMetadata.fields.driver_ids.label')} value={data.driver_ids.join(', ') ?? 'N/A'} variant="bordered" />
					<ValueDisplay label={t('default:rides.analysis.RideAnalysisMetadata.fields.scheduled_start_time.label')} value={`${displayUnixMilliseconds(data.start_time_scheduled)} (${data.start_time_scheduled})`} variant="bordered" />
					<ValueDisplay label={t('default:rides.analysis.RideAnalysisMetadata.fields.observed_start_time.label')} value={`${data.start_time_observed} (${data.start_time_observed})`} variant="bordered" />
					<ValueDisplay label={t('default:rides.analysis.RideAnalysisMetadata.fields.start_delay.label')} value={displayDuration(data.start_time_scheduled, data.start_time_observed) ?? 'N/A'} variant="bordered" />
					<ValueDisplay label={t('default:rides.analysis.RideAnalysisMetadata.fields.scheduled_end_time.label')} value={`${displayUnixMilliseconds(data.end_time_scheduled)} (${data.end_time_scheduled})`} variant="bordered" />
					<ValueDisplay label={t('default:rides.analysis.RideAnalysisMetadata.fields.observed_end_time.label')} value={`${displayUnixMilliseconds(data.end_time_observed)} (${data.end_time_observed})`} variant="bordered" />
					<ValueDisplay label={t('default:rides.analysis.RideAnalysisMetadata.fields.end_delay.label')} value={displayDuration(data.end_time_scheduled, data.end_time_observed) ?? 'N/A'} variant="bordered" />
				</Grid>
			</Section>
			<Divider />
			<Section gap="md">

				<Grid columns="abc" gap="md">
					<ValueDisplay label={t('default:rides.analysis.RideAnalysisMetadata.fields.passengers.label')} value={data.passengers_observed ?? 'N/A'} variant="bordered" />
					<ValueDisplay label={t('default:rides.analysis.RideAnalysisMetadata.fields.apex_validations_qty.label')} value={data.apex_validations_qty ?? 'N/A'} variant="bordered" />
					<ValueDisplay label={t('default:rides.analysis.RideAnalysisMetadata.fields.subscription_validations_qty.label')} value={`${data.passengers_observed_subscription_qty ?? 0}`} variant="bordered" />
					<ValueDisplay label={t('default:rides.analysis.RideAnalysisMetadata.fields.on_board_sales.label')} value={`${(data.passengers_observed_sales_amount ?? 0) / 100}€ (${data.passengers_observed_sales_qty ?? 'N/A'})`} variant="bordered" />
					<ValueDisplay label={t('default:rides.analysis.RideAnalysisMetadata.fields.prepaid_validations.label')} value={`${data.passengers_observed_prepaid_amount ?? 0} units (${data.passengers_observed_prepaid_qty ?? 'N/A'})`} variant="bordered" />
				</Grid>

			</Section>
		</Collapsible>
	);

	//
}
