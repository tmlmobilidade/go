'use client';

import { usePlansAgenciesData } from '@/components/plans/shared/use-plans-agencies-data';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { DateInput, ErrorDisplay, Grid, Section, Select, StandardFormController, Text, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { usePlansSteppExtractFormContext } from '../PlansSteppExtractForm.context';
import { usePlansSteppExtractPlansData } from '../use-plans-stepp-extract-plans-data';

/* * */

export function PlansSteppExtractBody() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { error: agenciesError, isLoading, options: agencyOptions } = usePlansAgenciesData();
	const { capabilities, form } = usePlansSteppExtractFormContext();
	const agencyId = useStandardFormWatch({ control: form.control, name: 'agency_id' });
	const startDate = useStandardFormWatch({ control: form.control, name: 'start_date' });
	const endDate = useStandardFormWatch({ control: form.control, name: 'end_date' });
	const { data: eligiblePlans, error, isLoading: isLoadingPlans } = usePlansSteppExtractPlansData(agencyId, startDate, endDate);

	//
	// B. Render components

	return (
		<Section gap="md">
			<StandardFormController
				control={form.control}
				name="agency_id"
				render={({ field, fieldState }) => (
					<Select
						data={agencyOptions}
						disabled={isLoading || !capabilities.editEnabled}
						error={fieldState.error?.message ?? agenciesError}
						label={t('default:plans.stepp.PlansSteppExtractBody.fields.agency_id.label')}
						onChange={value => field.onChange(value ?? '')}
						value={field.value}
						w="100%"
						withAsterisk
					/>
				)}
			/>
			<Grid columns="a" gap="md">
				<StandardFormController
					control={form.control}
					name="start_date"
					render={({ field, fieldState }) => (
						<DateInput
							error={fieldState.error?.message}
							label={t('default:plans.stepp.PlansSteppExtractBody.fields.start_date.label')}
							onChange={value => field.onChange(value != null ? String(value) : '')}
							readOnly={!capabilities.editEnabled}
							value={field.value ? Number(field.value) as OperationalDateInt : null}
							w="100%"
							withAsterisk
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="end_date"
					render={({ field, fieldState }) => (
						<DateInput
							error={fieldState.error?.message}
							label={t('default:plans.stepp.PlansSteppExtractBody.fields.end_date.label')}
							onChange={value => field.onChange(value != null ? String(value) : '')}
							readOnly={!capabilities.editEnabled}
							value={field.value ? Number(field.value) as OperationalDateInt : null}
							w="100%"
							withAsterisk
						/>
					)}
				/>
			</Grid>
			{error && <ErrorDisplay message={error} />}
			{agencyId && startDate && endDate && startDate <= endDate && !isLoadingPlans && !error && eligiblePlans.length === 0 && (
				<Text>{t('default:plans.stepp.PlansSteppExtractBody.empty')}</Text>
			)}
		</Section>
	);
}
