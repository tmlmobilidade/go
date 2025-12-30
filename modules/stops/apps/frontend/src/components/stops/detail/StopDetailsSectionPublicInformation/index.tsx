'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Translations } from '@/lib/translations';
import { AvailabilityStatusSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, Select, Spacer, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopDetailsSectionPublicInformation() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const { t } = useTranslation('stops', { keyPrefix: 'detail.sections.publicInformation' });
	const { t: tTypes } = useTranslation('stops', { keyPrefix: Translations.AVAILABILITY_STATUS });

	//
	// B. Transform data

	const availabilityStatusOptions = AvailabilityStatusSchema.options.map(value => ({
		label: tTypes(value),
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
				<Grid columns="a" gap="md">
					<Select
						key={stopDetailContext.data.form.key('has_stop_sign')}
						data={availabilityStatusOptions}
						label={t('fields.hasStopSign')}
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('has_stop_sign')}
					/>
					<Select
						key={stopDetailContext.data.form.key('has_schedules')}
						data={availabilityStatusOptions}
						label={t('fields.hasSchedules')}
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('has_schedules')}
					/>
					<Select
						key={stopDetailContext.data.form.key('has_network_map')}
						data={availabilityStatusOptions}
						label={t('fields.hasNetworkMap')}
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('has_network_map')}
					/>
				</Grid>
				<Spacer />
			</Section>
			<Section>
				<Grid columns="ab" gap="md">
					<TextInput
						key={stopDetailContext.data.form.key('last_schedules_maintenance')}
						label={t('fields.lastSchedulesMaintenance')}
						placeholder="2023-02-10"
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('last_schedules_maintenance')}
					/>
					<TextInput
						key={stopDetailContext.data.form.key('last_schedules_check')}
						label={t('fields.lastSchedulesCheck')}
						placeholder="2023-02-10"
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('last_schedules_check')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
