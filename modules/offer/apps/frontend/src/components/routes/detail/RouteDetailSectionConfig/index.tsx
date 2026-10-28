/* * */

import { useRouteDetailContext } from '@/components/routes/detail/RouteDetail.context';
import { pathTypeOptions, RouteSchema } from '@tmlmobilidade/go-types-offer';
import { Collapsible, Section, Select, StandardFormController, TextInput } from '@tmlmobilidade/ui';

/* * */

export function RouteDetailSectionConfig() {
	//

	//
	// A. Setup variables

	const routeDetailContext = useRouteDetailContext();

	//
	// B. Render components

	return (
		<Collapsible title="Configuração da Rota" defaultOpen>
			<Section gap="sm">
				<StandardFormController
					control={routeDetailContext.form.control}
					name="code"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label="Código"
							placeholder="Ex: 1234_0"
							readOnly={!routeDetailContext.capabilities.editEnabled}
							required={!RouteSchema.shape.code.isOptional()}
							w="100%"
							{...field}
							value={field.value ?? ''}
						/>
					)}
				/>

				<StandardFormController
					control={routeDetailContext.form.control}
					name="name"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label="Nome"
							placeholder="Ex: Alfragide (Estr Seminario) - Reboleira (Estação)"
							readOnly={!routeDetailContext.capabilities.editEnabled}
							required={!RouteSchema.shape.name.isOptional()}
							w="100%"
							{...field}
							value={field.value ?? ''}
						/>
					)}
				/>

				<StandardFormController
					control={routeDetailContext.form.control}
					name="path_type"
					render={({ field, fieldState }) => (
						<Select
							data={pathTypeOptions}
							error={fieldState.error?.message}
							label="Tipo de Trajeto"
							readOnly={!routeDetailContext.capabilities.editEnabled}
							required={!RouteSchema.shape.path_type.isOptional()}
							w="100%"
							{...field}
							value={field.value ?? null}
						/>
					)}
				/>
			</Section>
		</Collapsible>
	);

	//
}
