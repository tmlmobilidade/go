'use client';

import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { PlanDetailFootnote } from '@/components/plans/detail/PlanDetailFootnote';
import { PlanDetailHeader } from '@/components/plans/detail/PlanDetailHeader';
import { PlanDetailSectionAgency } from '@/components/plans/detail/PlanDetailSectionAgency';
import { PlanDetailSectionController } from '@/components/plans/detail/PlanDetailSectionController';
import { PlanDetailSectionFeedInfo } from '@/components/plans/detail/PlanDetailSectionFeedInfo';
import { PlanDetailSectionPcgiLegacy } from '@/components/plans/detail/PlanDetailSectionPcgiLegacy';
import { PlanDetailSectionApexFile } from '@/components/plans/detail/PlansDetailSectionApexFile';
import { PlanDetailSectionOperationFile } from '@/components/plans/detail/PlansDetailSectionOperationFile';
import { PlanDetailSectionPosters } from '@/components/plans/detail/PlansDetailSectionPosters';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { ErrorDisplay, HasPermission, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function PlanDetail() {
	//

	//
	// A. Setup variables

	const planDetailContext = usePlanDetailContext();

	//
	// B. Render components

	if (planDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (planDetailContext.flags.error) {
		return <ErrorDisplay message={planDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<PlanDetailHeader key="header" />]}>

			<PlanDetailSectionAgency />
			<PlanDetailSectionFeedInfo />
			<PlanDetailSectionOperationFile />

			<HasPermission
				action={PermissionCatalog.all.plans.actions.read_apex_file}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.plans.scope}
				value={planDetailContext.data.plan.agency_id}
			>
				<PlanDetailSectionApexFile />
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.plans.actions.generate_pdf_posters}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.plans.scope}
				value={planDetailContext.data.plan.gtfs_agency.agency_id}
			>
				<PlanDetailSectionPosters />
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.plans.actions.read_pcgi_legacy}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.plans.scope}
				value={planDetailContext.data.plan.agency_id}
			>
				<PlanDetailSectionPcgiLegacy />
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.plans.actions.read_controller}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.plans.scope}
				value={planDetailContext.data.plan.agency_id}
			>
				<PlanDetailSectionController />
			</HasPermission>
			<PlanDetailFootnote />
		</Pane>
	);

	//
}
