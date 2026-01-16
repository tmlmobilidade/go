/* * */

import { useRouteDetailContext } from '@/components/routes/detail/RouteDetail.context';
import { pathTypeOptions, RouteSchema } from '@tmlmobilidade/types';
import { Collapsible, Section, Select, TextInput } from '@tmlmobilidade/ui';

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
				<TextInput
					key={routeDetailContext.data.form.key('code')}
					disabled={routeDetailContext.flags.isReadOnly}
					label="Código"
					placeholder="Ex: 1234_0"
					required={!RouteSchema.shape.code.isOptional()}
					w="100%"
					{...routeDetailContext.data.form.getInputProps('code')}
				/>

				<TextInput
					key={routeDetailContext.data.form.key('name')}
					disabled={routeDetailContext.flags.isReadOnly}
					label="Nome"
					placeholder="Ex: Alfragide (Estr Seminario) - Reboleira (Estação)"
					required={!RouteSchema.shape.name.isOptional()}
					w="100%"
					{...routeDetailContext.data.form.getInputProps('name')}
				/>

				<Select
					key={routeDetailContext.data.form.key('path_type')}
					data={pathTypeOptions}
					disabled={routeDetailContext.flags.isReadOnly}
					label="Tipo de Trajeto"
					required={!RouteSchema.shape.path_type.isOptional()}
					w="100%"
					{...routeDetailContext.data.form.getInputProps('path_type')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
