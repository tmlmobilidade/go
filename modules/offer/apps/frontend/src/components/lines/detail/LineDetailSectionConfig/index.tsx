/* * */

import { useLineDetailContext } from '@/components/lines/detail/LineDetail.context';
import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { LineSchema, transportTypeOptions } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, Select, TextInput } from '@tmlmobilidade/ui';
/* * */

export function LineDetailSectionConfig() {
	//

	//
	// A. Setup variables

	const lineDetailContext = useLineDetailContext();
	const linesListContext = useLinesListContext();

	//
	// B. Render components

	return (
		<Collapsible title="Configuração da Linha" defaultOpen>
			<Section gap="sm">
				<TextInput
					key={lineDetailContext.data.form.key('code')}
					disabled={lineDetailContext.flags.isReadOnly}
					label="Código"
					placeholder="Ex: 1001"
					required={!LineSchema.shape.code.isOptional()}
					w="100%"
					{...lineDetailContext.data.form.getInputProps('code')}
				/>

				<TextInput
					key={lineDetailContext.data.form.key('name')}
					disabled={lineDetailContext.flags.isReadOnly}
					label="Nome"
					placeholder="Ex: 1001"
					required={!LineSchema.shape.name.isOptional()}
					w="100%"
					{...lineDetailContext.data.form.getInputProps('name')}
				/>

				<Grid columns="ab" gap="sm">
					<Select
						key={lineDetailContext.data.form.key('agency_id')}
						data={linesListContext.data.agencyOptions}
						disabled={lineDetailContext.flags.isReadOnly}
						label="Operador"
						required={!LineSchema.shape.agency_id.isOptional()}
						w="100%"
						{...lineDetailContext.data.form.getInputProps('agency_id')}
					/>

					<Select
						key={lineDetailContext.data.form.key('transport_type')}
						data={transportTypeOptions}
						disabled={lineDetailContext.flags.isReadOnly}
						label="Tipo de Veículo"
						required={!LineSchema.shape.transport_type.isOptional()}
						w="100%"
						{...lineDetailContext.data.form.getInputProps('transport_type')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
