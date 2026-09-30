'use client';

import { AvailabilityStatusValues } from '@tmlmobilidade/go-types-shared';
import { Collapsible, Grid, Section, Select, StandardFormController } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStopsDetailFormContext } from '../../StopsDetailForm.context';

/* * */

export function StopsDetailSectionAmenities() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useStopsDetailFormContext();

	//
	// B. Transform data

	const availabilityStatusOptions = useMemo(() => AvailabilityStatusValues.map(value => ({
		label: t(`shared:status.availability_status.${value}`),
		value,
	})), [t]);

	//
	// C. Render components

	return (
		<Collapsible
			description={t('default:stops.detail.SectionAmenities.description')}
			title={t('default:stops.detail.SectionAmenities.title')}
		>
			<Section>
				<Grid columns="ab" gap="md">
					<StandardFormController
						control={form.control}
						name="amenities.has_stop_sign"
						render={({ field, fieldState }) => (
							<Select
								data={availabilityStatusOptions}
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionAmenities.fields.has_stop_sign.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="amenities.has_shelter"
						render={({ field, fieldState }) => (
							<Select
								data={availabilityStatusOptions}
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionAmenities.fields.has_shelter.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="amenities.has_bench"
						render={({ field, fieldState }) => (
							<Select
								data={availabilityStatusOptions}
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionAmenities.fields.has_bench.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="amenities.has_mupi"
						render={({ field, fieldState }) => (
							<Select
								data={availabilityStatusOptions}
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionAmenities.fields.has_mupi.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="amenities.has_schedules"
						render={({ field, fieldState }) => (
							<Select
								data={availabilityStatusOptions}
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionAmenities.fields.has_schedules.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="amenities.has_network_map"
						render={({ field, fieldState }) => (
							<Select
								data={availabilityStatusOptions}
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionAmenities.fields.has_network_map.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
