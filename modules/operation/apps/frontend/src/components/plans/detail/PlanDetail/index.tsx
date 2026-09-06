'use client';

import { PlanDetailFootnote } from '@/components/plans/detail/PlanDetailFootnote';
import { usePlanDetailContext } from '@/components/plans/detail/PlanDetailForm.context';
import { PlanDetailHeader } from '@/components/plans/detail/PlanDetailHeader';
import { PlanDetailSectionActiveDates } from '@/components/plans/detail/PlanDetailSectionActiveDates';
import { PlanDetailSectionController } from '@/components/plans/detail/PlanDetailSectionController';
import { PlanDetailSectionApexFile } from '@/components/plans/detail/PlansDetailSectionApexFile';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ErrorDisplay, HasPermission, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

import { PlansDetailSectionOperationGtfs } from '../PlansDetailSectionOperationGtfs';
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

	if (!planDetailContext.data.plan) {
		return <LoadingOverlay />;
	}

	return (
		<Pane header={[<PlanDetailHeader key="header" />]} isLoading={isLoading}>

			{planDetailContext.flags.error && <ErrorDisplay message={planDetailContext.flags.error.message} />}

			<PlanDetailSectionActiveDates />
			<PlansDetailSectionOperationGtfs />

			<HasPermission
				action={PermissionCatalog.all.plans.actions.read_apex_file}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.plans.scope}
				value={planDetailContext.data.plan.agency_id}
			>
				<PlanDetailSectionApexFile />
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
