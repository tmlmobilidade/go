'use client';

import { useRidesAgenciesData } from '@/components/rides/shared/use-rides-agencies-data';
import { DateTimeInput, Grid, MultiSelect, Section, StandardFormController } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesExtractV1FormContext } from '../RidesExtractV1Form.context';

/* * */

export function RidesExtractV1Properties() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useRidesExtractV1FormContext();

	const { options: agenciesOptions } = useRidesAgenciesData();

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
						label={t('default:rides.extract.RidesExtractV1Properties.fields.agency_ids.label')}
						onChange={field.onChange}
						placeholder={t('default:rides.extract.RidesExtractV1Properties.fields.agency_ids.placeholder')}
						value={field.value ?? []}
						w="100%"
						withAsterisk
					/>
				)}
			/>

			<Grid columns="ab" gap="md">

				<StandardFormController
					control={form.control}
					name="start_time_scheduled_start"
					render={({ field, fieldState }) => (
						<DateTimeInput
							disabled={!capabilities.editEnabled}
							error={fieldState.error?.message}
							label={t('default:rides.extract.RidesExtractV1Properties.fields.start_time_scheduled_start.label')}
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
							label={t('default:rides.extract.RidesExtractV1Properties.fields.start_time_scheduled_end.label')}
							onChange={field.onChange}
							value={field.value}
						/>
					)}
				/>

			</Grid>

		</Section>
	);
}
