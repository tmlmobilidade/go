/* * */

import { useLineDetailContext } from '@/components/lines/detail/LineDetail.context';
import LineDetailRoute from '@/components/lines/detail/LineDetailRoute';
import { openCreateRouteModal } from '@/components/routes/create/RouteCreate.modal';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, Collapsible, HasPermission, Section } from '@tmlmobilidade/ui';

/* * */

export function LineDetailSectionRoutes() {
	//

	//
	// A. Setup variables

	const lineDetailContext = useLineDetailContext();

	const handleAddRoute = () => {
		openCreateRouteModal(lineDetailContext.data.id);
	};

	//
	// B. Render components

	if (!lineDetailContext.data.form.values.routes) {
		return null;
	}

	return (
		<Collapsible description="Todas as variantes desta linha, incluindo a base." title="Rotas">
			<Section gap="sm">
				<Section padding="none">
					{lineDetailContext.data.form.values.routes.map((route, index) => {
						const lineRoutes = lineDetailContext.data.form.values.routes;
						const routeData = lineRoutes.find(r => r._id === route._id);
						return (<LineDetailRoute key={index} lineId={lineDetailContext.data.line._id} routeData={routeData} />);
					})}
				</Section>

				<HasPermission
					action={PermissionCatalog.all.lines.actions.create}
					resourceKey="agency_ids"
					scope={PermissionCatalog.all.lines.scope}
					value={lineDetailContext.data.line.agency_id}
				>
					<Button label="Adicionar Rota" onClick={handleAddRoute} fullWidth />
				</HasPermission>
			</Section>
		</Collapsible>
	);

	//
}
