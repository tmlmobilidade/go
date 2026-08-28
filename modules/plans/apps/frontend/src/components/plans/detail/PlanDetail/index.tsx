'use client';

import { PlanDetailFootnote } from '@/components/plans/detail/PlanDetailFootnote';
import { usePlanDetailContext } from '@/components/plans/detail/PlanDetailForm.context';
import { PlanDetailHeader } from '@/components/plans/detail/PlanDetailHeader';
import { PlanDetailSectionAgency } from '@/components/plans/detail/PlanDetailSectionAgency';
import { PlanDetailSectionController } from '@/components/plans/detail/PlanDetailSectionController';
import { PlanDetailSectionFeedInfo } from '@/components/plans/detail/PlanDetailSectionFeedInfo';
import { PlanDetailSectionPcgiLegacy } from '@/components/plans/detail/PlanDetailSectionPcgiLegacy';
import { PlanDetailSectionApexFile } from '@/components/plans/detail/PlansDetailSectionApexFile';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ErrorDisplay, HasPermission, Pane } from '@tmlmobilidade/ui';

import { usePlansDetailData } from '../use-plans-detail-data';

/* * */

export function PlanDetail() {
	//

	//
	// A. Setup variables

	const { isLoading } = usePlansDetailData();

	const planDetailContext = usePlanDetailContext();

	//
	// B. Render components

	return (
		<Pane header={[<PlanDetailHeader key="header" />]} isLoading={isLoading}>

			{planDetailContext.flags.error && <ErrorDisplay message={planDetailContext.flags.error.message} />}

			<PlanDetailSectionAgency />
			<PlanDetailSectionFeedInfo />

			<HasPermission
				action={PermissionCatalog.all.plans.actions.read_apex_file}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.plans.scope}
				value={planDetailContext.data.plan.agency_id}
			>
				<PlanDetailSectionApexFile />
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
