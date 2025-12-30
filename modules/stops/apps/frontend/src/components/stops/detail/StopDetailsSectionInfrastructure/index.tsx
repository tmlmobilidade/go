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

	const stopDetailContext = useStopDetailContext();
	const { t } = useTranslation('stops', { keyPrefix: 'detail.sections.infrastructure' });
	const { t: tAvailabilityStatus } = useTranslation('stops', { keyPrefix: Translations.AVAILABILITY_STATUS });
	const { t: tRoadType } = useTranslation('stops', { keyPrefix: Translations.ROAD_TYPE });

	//
	// B. Transform data

	const availabilityStatusOptions = AvailabilityStatusSchema.options.map(value => ({
		label: tAvailabilityStatus(value),
		value: value,
	}));

	const roadTypeOptions = StopRoadTypeSchema.options.map(value => ({
		label: tRoadType(value),
		value: value,
	}));

	//
	// C. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section>
				<Grid columns="ab" gap="md">
					<Select
						key={stopDetailContext.data.form.key('has_mupi')}
						data={availabilityStatusOptions}
						label={t('fields.mupi')}
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('has_mupi')}
					/>
					<Select
						key={stopDetailContext.data.form.key('has_bench')}
						data={availabilityStatusOptions}
						label={t('fields.bench')}
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('has_bench')}
					/>
					<Select
						key={stopDetailContext.data.form.key('electricity_status')}
						data={availabilityStatusOptions}
						label={t('fields.electricity')}
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
						label={t('fields.roadType')}
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('road_type')}
					/>
				</Grid>
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<TextInput
						key={stopDetailContext.data.form.key('last_infrastructure_maintenance')}
						label={t('fields.lastMaintenance')}
						placeholder="2023-02-10"
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('last_infrastructure_maintenance')}
					/>
					<TextInput
						key={stopDetailContext.data.form.key('last_infrastructure_check')}
						label={t('fields.lastCheck')}
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
