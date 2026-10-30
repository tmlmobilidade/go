'use client';

import { useRidesAgenciesData } from '@/components/rides/shared/use-rides-agencies-data';
import { DateTimeInput, MultiSelect, Section, StandardFormController, TagsInput, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop } from '../../../../list/filters/RidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop/use-rides-list-filter-analysis-at-least-one-vehicle-event-on-last-stop';
import { useRidesListFilterEndDelayStatus } from '../../../../list/filters/RidesListFilterEndDelayStatus/use-rides-list-filter-end-delay-status';
import { useRidesListFilterOperationalStatus } from '../../../../list/filters/RidesListFilterOperationalStatus/use-rides-list-filter-operational-status';
import { useRidesExtractV2FormContext } from '../RidesExtractV2Form.context';

/* * */

export function RidesExtractV2Properties() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useRidesExtractV2FormContext();

	const { options: agenciesOptions } = useRidesAgenciesData();

	// The list filters already translate every option of these value sets,
	// which are shared by all the delay status and analysis grade fields.
	const { options: operationalStatusOptions } = useRidesListFilterOperationalStatus();
	const { options: delayStatusOptions } = useRidesListFilterEndDelayStatus();
	const { options: gradeStatusOptions } = useRidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop();

	//
	// B. Render components

	return (
		<Section gap="md">

			<StandardFormController
				control={form.control}
				name="agency_ids"
				render={({ field, fieldState }) => (
					<MultiSelect
						data={agenciesOptions}
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('default:rides.extract.RidesExtractV2Properties.fields.agency_ids.label')}
						onChange={field.onChange}
						placeholder={t('default:rides.extract.RidesExtractV2Properties.fields.agency_ids.placeholder')}
						value={field.value ?? []}
						w="100%"
						withAsterisk
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="start_time_scheduled_start"
				render={({ field, fieldState }) => (
					<DateTimeInput
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('default:rides.extract.RidesExtractV2Properties.fields.start_time_scheduled_start.label')}
						onChange={field.onChange}
						value={field.value}
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="start_time_scheduled_end"
				render={({ field, fieldState }) => (
					<DateTimeInput
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('default:rides.extract.RidesExtractV2Properties.fields.start_time_scheduled_end.label')}
						onChange={field.onChange}
						value={field.value}
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="search"
				render={({ field, fieldState }) => (
					<TextInput
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('default:rides.extract.RidesExtractV2Properties.fields.search.label')}
						onChange={field.onChange}
						placeholder={t('default:rides.extract.RidesExtractV2Properties.fields.search.placeholder')}
						value={field.value ?? ''}
						w="100%"
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="operational_statuses"
				render={({ field, fieldState }) => (
					<MultiSelect
						data={operationalStatusOptions}
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('default:rides.extract.RidesExtractV2Properties.fields.operational_statuses.label')}
						onChange={field.onChange}
						value={field.value ?? []}
						w="100%"
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="start_delay_statuses"
				render={({ field, fieldState }) => (
					<MultiSelect
						data={delayStatusOptions}
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('default:rides.extract.RidesExtractV2Properties.fields.start_delay_statuses.label')}
						onChange={field.onChange}
						value={field.value ?? []}
						w="100%"
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="end_delay_statuses"
				render={({ field, fieldState }) => (
					<MultiSelect
						data={delayStatusOptions}
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('default:rides.extract.RidesExtractV2Properties.fields.end_delay_statuses.label')}
						onChange={field.onChange}
						value={field.value ?? []}
						w="100%"
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="driver_ids"
				render={({ field, fieldState }) => (
					<TagsInput
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('default:rides.extract.RidesExtractV2Properties.fields.driver_ids.label')}
						onChange={field.onChange}
						placeholder={t('default:rides.extract.RidesExtractV2Properties.fields.driver_ids.placeholder')}
						value={field.value ?? []}
						w="100%"
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="vehicle_ids"
				render={({ field, fieldState }) => (
					<TagsInput
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('default:rides.extract.RidesExtractV2Properties.fields.vehicle_ids.label')}
						onChange={field.onChange}
						placeholder={t('default:rides.extract.RidesExtractV2Properties.fields.vehicle_ids.placeholder')}
						value={field.value ?? []}
						w="100%"
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="analysis_simple_three_vehicle_events_grades"
				render={({ field, fieldState }) => (
					<MultiSelect
						data={gradeStatusOptions}
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('default:rides.extract.RidesExtractV2Properties.fields.analysis_simple_three_vehicle_events_grades.label')}
						onChange={field.onChange}
						value={field.value ?? []}
						w="100%"
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="analysis_at_least_one_vehicle_event_on_last_stop_grades"
				render={({ field, fieldState }) => (
					<MultiSelect
						data={gradeStatusOptions}
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('default:rides.extract.RidesExtractV2Properties.fields.analysis_at_least_one_vehicle_event_on_last_stop_grades.label')}
						onChange={field.onChange}
						value={field.value ?? []}
						w="100%"
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="analysis_expected_apex_validation_interval_grades"
				render={({ field, fieldState }) => (
					<MultiSelect
						data={gradeStatusOptions}
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('default:rides.extract.RidesExtractV2Properties.fields.analysis_expected_apex_validation_interval_grades.label')}
						onChange={field.onChange}
						value={field.value ?? []}
						w="100%"
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="analysis_transaction_sequentiality_grades"
				render={({ field, fieldState }) => (
					<MultiSelect
						data={gradeStatusOptions}
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('default:rides.extract.RidesExtractV2Properties.fields.analysis_transaction_sequentiality_grades.label')}
						onChange={field.onChange}
						value={field.value ?? []}
						w="100%"
					/>
				)}
			/>

		</Section>
	);
}
