'use client';

import { ConditionStatusValues } from '@tmlmobilidade/go-types-shared';
import { Collapsible, DateTimeInput, Grid, NumberInput, Section, Select, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStopsDetailFormContext } from '../../StopsDetailForm.context';

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
						name="shelter.shelter_status"
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
						name="shelter.shelter_code"
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
						name="shelter.shelter_maintainer"
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
						name="shelter.shelter_installation_date"
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
						name="shelter.shelter_make"
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
						name="shelter.shelter_model"
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
					<StandardFormController
						control={form.control}
						name="shelter.shelter_frame_size"
						render={({ field, fieldState }) => (
							<>
								<NumberInput
									error={fieldState.error?.message}
									label={t('default:stops.detail.SectionShelter.fields.shelter_frame_size_width.label')}
									onChange={(value) => {
										const height = field.value?.[1] ?? null;
										if (value === '' || value == null) {
											field.onChange(height == null ? null : [0, height]);
											return;
										}
										field.onChange([Number(value), height ?? 0]);
									}}
									readOnly={!capabilities.editEnabled}
									value={field.value?.[0] ?? undefined}
								/>
								<NumberInput
									error={fieldState.error?.message}
									label={t('default:stops.detail.SectionShelter.fields.shelter_frame_size_height.label')}
									onChange={(value) => {
										const width = field.value?.[0] ?? null;
										if (value === '' || value == null) {
											field.onChange(width == null ? null : [width, 0]);
											return;
										}
										field.onChange([width ?? 0, Number(value)]);
									}}
									readOnly={!capabilities.editEnabled}
									value={field.value?.[1] ?? undefined}
								/>
							</>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
