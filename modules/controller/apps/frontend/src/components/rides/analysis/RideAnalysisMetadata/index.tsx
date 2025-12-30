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
	const { t } = useTranslation('controller', { keyPrefix: 'rides.analysis.metadata' });
	//
	// B. Render components

	return (
		<Collapsible description={t('description')} title={t('title')}>
			<Section gap="md">
				<Grid columns="abc" gap="md">
					<ValueDisplay label={t('operationalDate')} value={RideAnalysisContext.data.ride?.operational_date ?? 'N/A'} bordered />
					<ValueDisplay label={t('patternId')} value={RideAnalysisContext.data.ride?.pattern_id ?? 'N/A'} bordered />
					<ValueDisplay label={t('tripId')} value={RideAnalysisContext.data.ride?.trip_id ?? 'N/A'} bordered />
					<ValueDisplay label={t('vehicleIds')} value={RideAnalysisContext.data.ride?.vehicle_ids.join(', ') ?? 'N/A'} bordered />
					<ValueDisplay label={t('driverIds')} value={RideAnalysisContext.data.ride?.driver_ids.join(', ') ?? 'N/A'} bordered />
					<ValueDisplay label={t('scheduledStartTime')} value={`${RideAnalysisContext.data.ride?.start_time_scheduled_display} (${RideAnalysisContext.data.ride?.start_time_scheduled})`} bordered />
					<ValueDisplay label={t('observedStartTime')} value={`${RideAnalysisContext.data.ride?.start_time_observed_display} (${RideAnalysisContext.data.ride?.start_time_observed})`} bordered />
					<ValueDisplay label={t('startDelay')} value={RideAnalysisContext.data.ride?.start_delay_value_display ?? 'N/A'} bordered />
					<ValueDisplay label={t('scheduledEndTime')} value={`${RideAnalysisContext.data.ride?.end_time_scheduled_display} (${RideAnalysisContext.data.ride?.end_time_scheduled})`} bordered />
					<ValueDisplay label={t('observedEndTime')} value={`${RideAnalysisContext.data.ride?.end_time_observed_display} (${RideAnalysisContext.data.ride?.end_time_observed})`} bordered />
					<ValueDisplay label={t('endDelay')} value={RideAnalysisContext.data.ride?.end_delay_value_display ?? 'N/A'} bordered />
				</Grid>
			</Section>
			<Divider />
			<Section gap="md">

				<Grid columns="abc" gap="md">
					<ValueDisplay label={t('passengers')} value={RideAnalysisContext.data.ride?.passengers_observed ?? 'N/A'} bordered />
					<ValueDisplay label={t('apexValidationsQty')} value={RideAnalysisContext.data.ride?.apex_validations_qty ?? 'N/A'} bordered />
					<ValueDisplay label={t('subscriptionValidationsQty')} value={`${RideAnalysisContext.data.ride?.passengers_observed_subscription_qty ?? 0}`} bordered />
					<ValueDisplay label={t('onBoardSales')} value={`${(RideAnalysisContext.data.ride?.passengers_observed_on_board_sales_amount ?? 0) / 100}€ (${RideAnalysisContext.data.ride?.passengers_observed_on_board_sales_qty ?? 'N/A'})`} bordered />
					<ValueDisplay label={t('prepaidValidations')} value={`${RideAnalysisContext.data.ride?.passengers_observed_prepaid_amount ?? 0} units (${RideAnalysisContext.data.ride?.passengers_observed_prepaid_qty ?? 'N/A'})`} bordered />
				</Grid>

			</Section>
		</Collapsible>
	);

	//
}
