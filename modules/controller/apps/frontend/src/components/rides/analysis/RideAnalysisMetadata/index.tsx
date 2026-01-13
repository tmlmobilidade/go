'use client';

/* * */

import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { Collapsible, Divider, Grid, Section, ValueDisplay } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisMetadata() {
	//

	//
	// A. Setup variables

	const RideAnalysisContext = useRideAnalysisContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible description={t('controller:rides.analysis.RideAnalysisMetadata.description')} title={t('controller:rides.analysis.RideAnalysisMetadata.title')}>
			<Section gap="md">
				<Grid columns="abc" gap="md">
					<ValueDisplay label={t('controller:rides.analysis.RideAnalysisMetadata.fields.operational_date.label')} value={RideAnalysisContext.data.ride?.operational_date ?? 'N/A'} bordered />
					<ValueDisplay label={t('controller:rides.analysis.RideAnalysisMetadata.fields.pattern_id.label')} value={RideAnalysisContext.data.ride?.pattern_id ?? 'N/A'} bordered />
					<ValueDisplay label={t('controller:rides.analysis.RideAnalysisMetadata.fields.trip_id.label')} value={RideAnalysisContext.data.ride?.trip_id ?? 'N/A'} bordered />
					<ValueDisplay label={t('controller:rides.analysis.RideAnalysisMetadata.fields.vehicle_ids.label')} value={RideAnalysisContext.data.ride?.vehicle_ids.join(', ') ?? 'N/A'} bordered />
					<ValueDisplay label={t('controller:rides.analysis.RideAnalysisMetadata.fields.driver_ids.label')} value={RideAnalysisContext.data.ride?.driver_ids.join(', ') ?? 'N/A'} bordered />
					<ValueDisplay label={t('controller:rides.analysis.RideAnalysisMetadata.fields.scheduled_start_time.label')} value={`${RideAnalysisContext.data.ride?.start_time_scheduled_display} (${RideAnalysisContext.data.ride?.start_time_scheduled})`} bordered />
					<ValueDisplay label={t('controller:rides.analysis.RideAnalysisMetadata.fields.observed_start_time.label')} value={`${RideAnalysisContext.data.ride?.start_time_observed_display} (${RideAnalysisContext.data.ride?.start_time_observed})`} bordered />
					<ValueDisplay label={t('controller:rides.analysis.RideAnalysisMetadata.fields.start_delay.label')} value={RideAnalysisContext.data.ride?.start_delay_value_display ?? 'N/A'} bordered />
					<ValueDisplay label={t('controller:rides.analysis.RideAnalysisMetadata.fields.scheduled_end_time.label')} value={`${RideAnalysisContext.data.ride?.end_time_scheduled_display} (${RideAnalysisContext.data.ride?.end_time_scheduled})`} bordered />
					<ValueDisplay label={t('controller:rides.analysis.RideAnalysisMetadata.fields.observed_end_time.label')} value={`${RideAnalysisContext.data.ride?.end_time_observed_display} (${RideAnalysisContext.data.ride?.end_time_observed})`} bordered />
					<ValueDisplay label={t('controller:rides.analysis.RideAnalysisMetadata.fields.end_delay.label')} value={RideAnalysisContext.data.ride?.end_delay_value_display ?? 'N/A'} bordered />
				</Grid>
			</Section>
			<Divider />
			<Section gap="md">

				<Grid columns="abc" gap="md">
					<ValueDisplay label={t('controller:rides.analysis.RideAnalysisMetadata.fields.passengers.label')} value={RideAnalysisContext.data.ride?.passengers_observed ?? 'N/A'} bordered />
					<ValueDisplay label={t('controller:rides.analysis.RideAnalysisMetadata.fields.apex_validations_qty.label')} value={RideAnalysisContext.data.ride?.apex_validations_qty ?? 'N/A'} bordered />
					<ValueDisplay label={t('controller:rides.analysis.RideAnalysisMetadata.fields.subscription_validations_qty.label')} value={`${RideAnalysisContext.data.ride?.passengers_observed_subscription_qty ?? 0}`} bordered />
					<ValueDisplay label={t('controller:rides.analysis.RideAnalysisMetadata.fields.on_board_sales.label')} value={`${(RideAnalysisContext.data.ride?.passengers_observed_on_board_sales_amount ?? 0) / 100}€ (${RideAnalysisContext.data.ride?.passengers_observed_on_board_sales_qty ?? 'N/A'})`} bordered />
					<ValueDisplay label={t('controller:rides.analysis.RideAnalysisMetadata.fields.prepaid_validations.label')} value={`${RideAnalysisContext.data.ride?.passengers_observed_prepaid_amount ?? 0} units (${RideAnalysisContext.data.ride?.passengers_observed_prepaid_qty ?? 'N/A'})`} bordered />
				</Grid>

			</Section>
		</Collapsible>
	);

	//
}
