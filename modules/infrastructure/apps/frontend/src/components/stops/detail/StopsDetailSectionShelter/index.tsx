'use client';

import { useStopsDetailFormContext } from '@/components/stops/detail/StopsDetailForm.context';
import { ConditionStatusValues } from '@tmlmobilidade/go-types-shared';
import { Collapsible, DateTimeInput, Grid, Section, Select, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function StopsDetailSectionShelter() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useStopsDetailFormContext();

	//
	// B. Transform data

	const conditionStatusOptions = useMemo(() => ConditionStatusValues.map(value => ({
		label: t(`shared:status.condition_status.${value}`),
		value,
	})), [t]);

	//
	// C. Render components

	return (
		<Collapsible
			description={t('default:stops.detail.SectionShelter.description')}
			title={t('default:stops.detail.SectionShelter.title')}
		>
			<Section>
				<Grid columns="ab" gap="md">
					<StandardFormController
						control={form.control}
						name="shelter.status"
						render={({ field, fieldState }) => (
							<Select
								data={conditionStatusOptions}
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionShelter.fields.shelter_status.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="shelter.code"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionShelter.fields.shelter_code.label')}
								onChange={e => field.onChange(e.currentTarget.value || null)}
								readOnly={!capabilities.editEnabled}
								value={field.value ?? ''}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="shelter.maintainer"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionShelter.fields.shelter_maintainer.label')}
								onChange={e => field.onChange(e.currentTarget.value || null)}
								readOnly={!capabilities.editEnabled}
								value={field.value ?? ''}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="shelter.installation_date"
						render={({ field, fieldState }) => (
							<DateTimeInput
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionShelter.fields.shelter_installation_date.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
								clearable
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="shelter.make"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionShelter.fields.shelter_make.label')}
								onChange={e => field.onChange(e.currentTarget.value || null)}
								readOnly={!capabilities.editEnabled}
								value={field.value ?? ''}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="shelter.model"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionShelter.fields.shelter_model.label')}
								onChange={e => field.onChange(e.currentTarget.value || null)}
								readOnly={!capabilities.editEnabled}
								value={field.value ?? ''}
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
