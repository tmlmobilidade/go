'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Translations } from '@/lib/translations';
import { AvailabilityStatusSchema, StopRoadTypeSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, Select, Spacer, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopDetailsSectionInfrastructure() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const stopDetailContext = useStopDetailContext();

	//
	// B. Transform data

	const availabilityStatusOptions = AvailabilityStatusSchema.options.map(value => ({
		label: t(`${Translations.AVAILABILITY_STATUS}.${value}`),
		value: value,
	}));

	const roadTypeOptions = StopRoadTypeSchema.options.map(value => ({
		label: t(`${Translations.ROAD_TYPE}.${value}`),
		value: value,
	}));

	//
	// C. Render components

	return (
		<Collapsible
			description={t('stops:stops.detail.StopDetailsSectionInfrastructure.description')}
			title={t('stops:stops.detail.StopDetailsSectionInfrastructure.title')}
		>
			<Section>
				<Grid columns="ab" gap="md">
					<Select
						key={stopDetailContext.data.form.key('has_mupi')}
						data={availabilityStatusOptions}
						label={t('stops:stops.detail.StopDetailsSectionInfrastructure.fields.has_mupi.label')}
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('has_mupi')}
					/>
					<Select
						key={stopDetailContext.data.form.key('has_bench')}
						data={availabilityStatusOptions}
						label={t('stops:stops.detail.StopDetailsSectionInfrastructure.fields.has_bench.label')}
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('has_bench')}
					/>
					<Select
						key={stopDetailContext.data.form.key('electricity_status')}
						data={availabilityStatusOptions}
						label={t('stops:stops.detail.StopDetailsSectionInfrastructure.fields.has_electricity.label')}
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('electricity_status')}
					/>
				</Grid>
				<Spacer />
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<Select
						key={stopDetailContext.data.form.key('road_type')}
						data={roadTypeOptions}
						label={t('stops:stops.detail.StopDetailsSectionInfrastructure.fields.road_type.label')}
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('road_type')}
					/>
				</Grid>
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<TextInput
						key={stopDetailContext.data.form.key('last_infrastructure_maintenance')}
						label={t('stops:stops.detail.StopDetailsSectionInfrastructure.fields.last_maintenance.label')}
						placeholder="2023-02-10"
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('last_infrastructure_maintenance')}
					/>
					<TextInput
						key={stopDetailContext.data.form.key('last_infrastructure_check')}
						label={t('stops:stops.detail.StopDetailsSectionInfrastructure.fields.last_check.label')}
						placeholder="2023-02-10"
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('last_infrastructure_check')}
					/>
				</Grid>
				<Spacer />
			</Section>
		</Collapsible>
	);

	//
}
