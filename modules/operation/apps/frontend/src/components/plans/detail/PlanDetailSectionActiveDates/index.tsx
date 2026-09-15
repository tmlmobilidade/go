/* * */

import { usePlanDetailContext } from '@/components/plans/detail/PlanDetailForm.context';
import { hasPermissionResource } from '@tmlmobilidade/go-types-permissions';
import { Collapsible, DateInput, Grid, Section, useMeData } from '@tmlmobilidade/ui';

/* * */

export function PlanDetailSectionActiveDates() {
	//

	//
	// A. Setup variables

	const { data: meData } = useMeData();
	const planDetailContext = usePlanDetailContext();

	//
	// B. Transform data

	const canEdit = hasPermissionResource(meData?.permissions, {
		requiredPermission: { action: 'update_feed_info_dates', scope: 'plans' },
		requiredValue: planDetailContext.data.plan.agency_id ?? '',
		resourceKey: 'agency_ids',
	});

	//
	// C. Render components

	return (
		<Collapsible
			description="Datas de validade do plano"
			title="Datas de Validade"
		>
			<Section gap="sm">
				<Grid columns="ab" gap="sm">
					<DateInput
						key={planDetailContext.data.form.key('active_from')}
						readOnly={planDetailContext.flags.isReadOnly || !canEdit}
						{...planDetailContext.data.form.getInputProps('active_from')}
					/>
					<DateInput
						key={planDetailContext.data.form.key('active_until')}
						readOnly={planDetailContext.flags.isReadOnly || !canEdit}
						{...planDetailContext.data.form.getInputProps('active_until')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
