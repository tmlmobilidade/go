'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Translations } from '@/lib/translations';
import { AvailabilityStatusSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, Select, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionPublicInformation() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Transform data

	const availabilityStatusOptions = AvailabilityStatusSchema.options.map(value => ({
		label: Translations.AVAILABILITY_STATUS[value],
		value: value,
	}));

	//
	// C. Render components

	return (
		<Collapsible
			description="Informação relacionadas com os suportes de informação ao público."
			title="Informação ao público"
		>
			<Section>
				<Grid columns="a" gap="md">
					<Select
						key={stopDetailContext.data.form.key('has_stop_sign')}
						data={availabilityStatusOptions}
						label="Tem Postalete?"
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('has_stop_sign')}
					/>
					<Select
						key={stopDetailContext.data.form.key('has_schedules')}
						data={availabilityStatusOptions}
						label="Tem Horários?"
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('has_schedules')}
					/>
					<Select
						key={stopDetailContext.data.form.key('has_network_map')}
						data={availabilityStatusOptions}
						label="Tem Mapa de Rede?"
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
						label="Última Manutenção dos Horários?"
						placeholder="2023-02-10"
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('last_schedules_maintenance')}
					/>
					<TextInput
						key={stopDetailContext.data.form.key('last_schedules_check')}
						label="Última Verificação dos Horários?"
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
