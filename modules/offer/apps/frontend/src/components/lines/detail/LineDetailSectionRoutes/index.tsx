/* * */

import { useLineDetailContext } from '@/components/lines/detail/LineDetail.context';
import LineDetailRoute from '@/components/lines/detail/LineDetailRoute';
import { openCreateRouteModal } from '@/components/routes/create/RouteCreate.modal';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, Collapsible, HasPermission, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function LineDetailSectionRoutes() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const lineDetailContext = useLineDetailContext();

	const handleAddRoute = () => {
		if (lineDetailContext.status.isLocked) return;
		openCreateRouteModal(lineDetailContext.data.id);
	};

	//
	// B. Render components

	return (
		<Collapsible description={t('lines:detail.LineDetailSectionRoutes.routes_description')} title={t('lines:detail.LineDetailSectionRoutes.routes')} defaultOpen>
			<Section gap="sm">
				<Section padding="none">
					{(lineDetailContext.data.line?.routes?.toSorted((a, b) => a.code.localeCompare(b.code)) ?? []).map((route, index) => (
						<LineDetailRoute key={route._id ?? index} lineId={lineDetailContext.data.line?._id} routeData={route} />
					))}
				</Section>

				<HasPermission
					action={PermissionCatalog.all.lines.actions.create}
					resourceKey="agency_ids"
					scope={PermissionCatalog.all.lines.scope}
					value={lineDetailContext.data.line.agency_id}
				>
					<Button disabled={!!lineDetailContext.data.line?.is_locked} label={t('lines:detail.LineDetailSectionRoutes.add_route')} onClick={handleAddRoute} fullWidth />
				</HasPermission>
			</Section>
		</Collapsible>
	);

	//
}
