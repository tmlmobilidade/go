/* * */

import { useAgenciesData } from '@/components/common/use-agencies-data';
import { useLineDetailContext } from '@/components/lines/detail/LineDetail.context';
import { LineSchema, transportTypeOptions } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Collapsible, Grid, Section, Select, StandardFormController, TextInput } from '@tmlmobilidade/ui';
/* * */

export function LineDetailSectionConfig() {
	//

	//
	// A. Setup variables

	const lineDetailContext = useLineDetailContext();
	const { options: agencyOptions } = useAgenciesData({ permissions: { actions: [lineDetailContext.capabilities.editEnabled ? PermissionCatalog.all.lines.actions.update : PermissionCatalog.all.lines.actions.read], scope: PermissionCatalog.all.lines.scope } });

	//
	// B. Render components

	return (
		<Collapsible title="Configuração da Linha" defaultOpen>
			<Section gap="sm">
				<StandardFormController
					control={lineDetailContext.form.control}
					name="code"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label="Código"
							placeholder="Ex: 1001"
							readOnly={!lineDetailContext.capabilities.editEnabled}
							required={!LineSchema.shape.code.isOptional()}
							w="100%"
							{...field}
							value={field.value ?? ''}
						/>
					)}
				/>

				<StandardFormController
					control={lineDetailContext.form.control}
					name="name"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label="Nome"
							placeholder="Ex: 1001"
							readOnly={!lineDetailContext.capabilities.editEnabled}
							required={!LineSchema.shape.name.isOptional()}
							w="100%"
							{...field}
							value={field.value ?? ''}
						/>
					)}
				/>

				<Grid columns="ab" gap="sm">
					<StandardFormController
						control={lineDetailContext.form.control}
						name="agency_id"
						render={({ field, fieldState }) => (
							<Select
								data={agencyOptions}
								error={fieldState.error?.message}
								label="Operador"
								readOnly={!lineDetailContext.capabilities.editEnabled}
								required={!LineSchema.shape.agency_id.isOptional()}
								w="100%"
								{...field}
								value={field.value ?? null}
							/>
						)}
					/>

					<StandardFormController
						control={lineDetailContext.form.control}
						name="transport_type"
						render={({ field, fieldState }) => (
							<Select
								data={transportTypeOptions}
								error={fieldState.error?.message}
								label="Tipo de Veículo"
								readOnly={!lineDetailContext.capabilities.editEnabled}
								required={!LineSchema.shape.transport_type.isOptional()}
								w="100%"
								{...field}
								value={field.value ?? null}
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
