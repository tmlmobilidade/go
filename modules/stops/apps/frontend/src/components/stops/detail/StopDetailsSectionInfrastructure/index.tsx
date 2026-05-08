'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Translations } from '@/lib/translations';
import { AvailabilityStatusSchema, StopRoadTypeSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, Select, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionInfrastructure() {
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

	const roadTypeOptions = StopRoadTypeSchema.options.map(value => ({
		label: Translations.ROAD_TYPE[value],
		value: value,
	}));

	//
	// C. Render components

	return (
		<Collapsible
			description="Informações relacionadas com os equipamentos da paragem e envolvente."
			title="Infraestrutura"
		>
			<Section>
				<Grid columns="ab" gap="md">
					<Select
						key={stopDetailContext.data.form.key('has_mupi')}
						data={availabilityStatusOptions}
						label="Existe Mupi?"
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('has_mupi')}
					/>
					<Select
						key={stopDetailContext.data.form.key('has_bench')}
						data={availabilityStatusOptions}
						label="Existe Banco?"
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('has_bench')}
					/>
					<Select
						key={stopDetailContext.data.form.key('electricity_status')}
						data={availabilityStatusOptions}
						label="Existe Ligação Elétrica?"
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
						label="Tipo de Relação com a Via"
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('road_type')}
					/>
				</Grid>
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<TextInput
						key={stopDetailContext.data.form.key('last_infrastructure_maintenance')}
						label="Última Manutenção da Infraestrutura"
						placeholder="2023-02-10"
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('last_infrastructure_maintenance')}
					/>
					<TextInput
						key={stopDetailContext.data.form.key('last_infrastructure_check')}
						label="Última Verificação da Infraestrutura"
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
