/* * */

import { openCreatePatternModal } from '@/components/patterns/create/PatternCreate.modal';
import { useRouteDetailContext } from '@/components/routes/detail/RouteDetail.context';
import RouteDetailPattern from '@/components/routes/detail/RouteDetailPattern';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, Collapsible, HasPermission, Section } from '@tmlmobilidade/ui';

/* * */

export function RouteDetailSectionPatterns() {
	//

	//
	// A. Setup variables

	const routeDetailContext = useRouteDetailContext();

	const handleAddPattern = () => {
		openCreatePatternModal(routeDetailContext.data.line._id, routeDetailContext.data.route._id);
	};

	//
	// B. Render components

	if (!routeDetailContext.data.line) {
		return null;
	}

	return (
		<Collapsible description="Todos os percursos desta rota. No máximo, uma rota pode ter dois percursos: o de ida e o de volta." title="Patterns" defaultOpen>
			<Section gap="sm">
				<Section padding="none">
					{routeDetailContext.data.route.patterns.sort((a, b) => a.code.localeCompare(b.code)).map((pattern, index) => (
						<RouteDetailPattern key={pattern._id ?? index} patternData={pattern} />
					))}
				</Section>

				<HasPermission
					action={PermissionCatalog.all.lines.actions.create}
					resourceKey="agency_ids"
					scope={PermissionCatalog.all.lines.scope}
					value={routeDetailContext.data.line.agency_id}
				>
					<Button label="Adicionar Pattern" onClick={handleAddPattern} fullWidth />
				</HasPermission>
			</Section>
		</Collapsible>
	);

	//
}
