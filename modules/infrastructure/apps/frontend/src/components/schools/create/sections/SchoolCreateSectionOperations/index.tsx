'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { Collapsible, DateTimeInput, fetchApiData, Grid, MultiSelect, Section, StandardFormController, Switch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { useSchoolsCreateFormContext } from '../../shared/SchoolsCreateForm.context';

/* * */

export function SchoolCreateSectionOperations() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { form } = useSchoolsCreateFormContext();

	//
	// B. Fetch data

	const { data: stopsResponse, isLoading: stopsLoading } = useSWR<ApiResponse<Pick<Stop, '_id' | 'name'>[]>>(API_ROUTES.infrastructure.STOPS_LIST, {
		fetcher: async (url: string) => await fetchApiData<Pick<Stop, '_id' | 'name'>[]>({ url }),
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
						control={form.control}
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
						control={form.control}
						name="validation_date"
						render={({ field, fieldState }) => (
							<DateTimeInput
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionOperations.fields.validation_date.label')}
								onChange={field.onChange}
								placeholder={t('schools:create.SchoolCreateSectionOperations.fields.validation_date.placeholder')}
								value={field.value}
								clearable
							/>
						)}
					/>

					<StandardFormController
						control={form.control}
						name="stops"
						render={({ field, fieldState }) => (
							<MultiSelect
								data={stopsOptions}
								disabled={stopsLoading}
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionOperations.fields.stops.label')}
								onChange={field.onChange}
								placeholder={t('schools:create.SchoolCreateSectionOperations.fields.stops.placeholder')}
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
