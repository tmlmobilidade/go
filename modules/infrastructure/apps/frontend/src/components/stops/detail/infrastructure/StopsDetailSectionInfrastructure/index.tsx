'use client';

import { StopRoadTypeSchema } from '@tmlmobilidade/go-types-infrastructure';
import { AvailabilityStatusValues, ConditionStatusValues } from '@tmlmobilidade/go-types-shared';
import { Collapsible, Grid, Section, Select, StandardFormController } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStopsDetailFormContext } from '../../StopsDetailForm.context';

/* * */

export function StopsDetailSectionInfrastructure() {
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

	const conditionStatusOptions = useMemo(() => ConditionStatusValues.map(value => ({
		label: t(`shared:status.condition_status.${value}`),
		value,
	})), [t]);

	const roadTypeOptions = useMemo(() => StopRoadTypeSchema.options.map(value => ({
		label: t(`default:stops.shared.road_type.${value}`),
		value,
	})), [t]);

	//
	// C. Render components

	return (
		<Collapsible
			description={t('default:stops.detail.SectionInfrastructure.description')}
			title={t('default:stops.detail.SectionInfrastructure.title')}
		>
			<Section>
				<Grid columns="ab" gap="md">
					<StandardFormController
						control={form.control}
						name="infrastructure.bench_status"
						render={({ field, fieldState }) => (
							<Select
								data={conditionStatusOptions}
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionInfrastructure.fields.bench_status.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="infrastructure.pole_status"
						render={({ field, fieldState }) => (
							<Select
								data={conditionStatusOptions}
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionInfrastructure.fields.pole_status.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="infrastructure.electricity_status"
						render={({ field, fieldState }) => (
							<Select
								data={availabilityStatusOptions}
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionInfrastructure.fields.electricity_status.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="infrastructure.road_type"
						render={({ field, fieldState }) => (
							<Select
								data={roadTypeOptions}
								error={fieldState.error?.message}
								label={t('default:stops.detail.SectionInfrastructure.fields.road_type.label')}
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
