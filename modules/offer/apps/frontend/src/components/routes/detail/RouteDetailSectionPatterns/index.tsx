/* * */

import { openCreatePatternModal } from '@/components/patterns/create/PatternCreate.modal';
import { useRouteDetailContext } from '@/components/routes/detail/RouteDetail.context';
import RouteDetailPattern from '@/components/routes/detail/RouteDetailPattern';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, Collapsible, HasPermission, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RouteDetailSectionPatterns() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const routeDetailContext = useRouteDetailContext();

	const handleAddPattern = () => {
		if (routeDetailContext.status.isLocked) return;
		openCreatePatternModal(routeDetailContext.data.line._id, routeDetailContext.data.route._id);
	};

	//
	// B. Render components

	if (!routeDetailContext.data.line) {
		return null;
	}

	return (
		<Collapsible description={t('routes:detail.RouteDetailSectionPatterns.patterns_hint')} title={t('routes:detail.RouteDetailSectionPatterns.patterns')} defaultOpen>
			<Section gap="sm">
				<Section padding="none">
					{routeDetailContext.data.route.patterns.toSorted((a, b) => a.code.localeCompare(b.code)).map((pattern, index) => (
						<RouteDetailPattern key={pattern._id ?? index} patternData={pattern} />
					))}
				</Section>

				<HasPermission
					action={PermissionCatalog.all.lines.actions.create}
					resourceKey="agency_ids"
					scope={PermissionCatalog.all.lines.scope}
					value={routeDetailContext.data.line.agency_id}
				>
					<Button disabled={routeDetailContext.status.isLocked} label={t('routes:detail.RouteDetailSectionPatterns.add_pattern')} onClick={handleAddPattern} fullWidth />
				</HasPermission>
			</Section>
		</Collapsible>
	);

	//
}
