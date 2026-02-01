/* * */

import { useLineDetailContext } from '@/components/lines/detail/LineDetail.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { LineSchema, PermissionCatalog, transportTypeOptions } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, Select, TextInput, useDataAgencies } from '@tmlmobilidade/ui';

/* * */

export function LineDetailSectionConfig() {
	//

	//
	// A. Setup variables

	const lineDetailContext = useLineDetailContext();

	// Bypass permissions to show all agency labels in read-only mode
	// When editable, filter agencies based on user permissions
	const { options: agencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: lineDetailContext.flags.isReadOnly ? undefined : [PermissionCatalog.all.lines.actions.update],
		scope: lineDetailContext.flags.isReadOnly ? undefined : PermissionCatalog.all.lines.scope,
	});

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
						data={agencyOptions}
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
