'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { Collapsible, DateTimeInput, fetchApiData, Grid, MultiSelect, Section, StandardFormController, Switch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { useSchoolsCreateFormContext } from '../../shared/SchoolsCreateForm.context';

/* * */

interface SchoolStopOption {
	_id: number
	name: string
}

/* * */

export function SchoolCreateSectionOperations() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { form: schoolsCreateForm } = useSchoolsCreateFormContext();

	//
	// B. Fetch data

	const { data: stopsResponse, isLoading: stopsLoading } = useSWR<ApiResponse<SchoolStopOption[]>>(API_ROUTES.infrastructure.STOPS_LIST, {
		fetcher: async (url: string) => await fetchApiData<SchoolStopOption[]>({ url }),
	});

	//
	// C. Transform data

	const stopsOptions = useMemo(() => (stopsResponse?.data ?? [])
		.map(stop => ({ label: `[${stop._id}] ${stop.name}`, value: String(stop._id) }))
		.sort((a, b) => a.label.localeCompare(b.label, 'pt')), [stopsResponse?.data]);

	//
	// D. Render components

	return (
		<Collapsible
			description={t('schools:create.SchoolCreateSectionOperations.description')}
			title={t('schools:create.SchoolCreateSectionOperations.title')}
		>
			<Section padding="lg">
				<Grid columns="ab" gap="md">
					<StandardFormController
						control={schoolsCreateForm.control}
						name="is_active"
						render={({ field, fieldState }) => (
							<Switch
								checked={field.value ?? false}
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionOperations.fields.is_active')}
								onChange={e => field.onChange(e.currentTarget.checked)}
							/>
						)}
					/>

					<StandardFormController
						control={schoolsCreateForm.control}
						name="validation_date"
						render={({ field, fieldState }) => (
							<DateTimeInput
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionOperations.fields.validation_date')}
								onChange={field.onChange}
								value={field.value}
								clearable
							/>
						)}
					/>

					<StandardFormController
						control={schoolsCreateForm.control}
						name="stops"
						render={({ field, fieldState }) => (
							<MultiSelect
								data={stopsOptions}
								disabled={stopsLoading}
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionOperations.fields.stops')}
								onChange={field.onChange}
								value={field.value ?? []}
								w="100%"
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
