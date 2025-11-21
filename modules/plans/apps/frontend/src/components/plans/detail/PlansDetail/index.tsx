'use client';

/* * */

import { PlansDetailHeader } from '@/components/plans/detail/PlansDetailHeader';
import { PlansDetailSectionAgency } from '@/components/plans/detail/PlansDetailSectionAgency';
import { PlansDetailSectionController } from '@/components/plans/detail/PlansDetailSectionController';
import { PlansDetailSectionFeedInfo } from '@/components/plans/detail/PlansDetailSectionFeedInfo';
import { PlansDetailSectionFiles } from '@/components/plans/detail/PlansDetailSectionFiles';
import { PlansDetailSectionPcgiLegacy } from '@/components/plans/detail/PlansDetailSectionPcgiLegacy';
import { usePlansDetailContext } from '@/contexts/PlansDetail.context';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { ErrorDisplay, HasPermission, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function PlansDetail() {
	//

	//
	// A. Setup variables

	const plansDetailContext = usePlansDetailContext();

	//
	// B. Render components

	if (plansDetailContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (plansDetailContext.flags.error) {
		return <ErrorDisplay message={plansDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<PlansDetailHeader />]}>

			<PlansDetailSectionAgency />
			<PlansDetailSectionFeedInfo />
			<PlansDetailSectionFiles />

			<HasPermission
				action={PermissionCatalog.all.plans.actions.update_pcgi_legacy}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.plans.scope}
				value={plansDetailContext.data.plan.gtfs_agency.agency_id}
			>
				<PlansDetailSectionPcgiLegacy />
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.plans.actions.update_controller}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.plans.scope}
				value={plansDetailContext.data.plan.gtfs_agency.agency_id}
			>
				<PlansDetailSectionController />
			</HasPermission>

		</Pane>
	);

	//
}
