/* * */

import { FeedInfoDisplay } from '@/components/common/FeedInfoDisplay';
import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Collapsible, DateInput, Grid, Section, useMeContext } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PlanDetailSectionFeedInfo() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const planDetailContext = usePlanDetailContext();
	const { t } = useTranslation();

	//
	// B. Transform data

	const canEdit = meContext.actions.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.update_feed_info_dates,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: planDetailContext.data.plan.gtfs_agency.agency_id ?? '',
	});

	//
	// C. Render components

	return (
		<Collapsible
			description={t('plans:plans.detail.PlanDetailSectionFeedInfo.description')}
			title={t('plans:plans.detail.PlanDetailSectionFeedInfo.title')}
		>

			<Section gap="sm">
				<FeedInfoDisplay data={planDetailContext.data.plan?.gtfs_feed_info} />
			</Section>

			<Section gap="sm">
				<Grid columns="ab" gap="sm">
					<DateInput
						key={planDetailContext.data.form.key('gtfs_feed_info.feed_start_date')}
						readOnly={planDetailContext.flags.isReadOnly || !canEdit}
						{...planDetailContext.data.form.getInputProps('gtfs_feed_info.feed_start_date')}
					/>
					<DateInput
						key={planDetailContext.data.form.key('gtfs_feed_info.feed_end_date')}
						readOnly={planDetailContext.flags.isReadOnly || !canEdit}
						{...planDetailContext.data.form.getInputProps('gtfs_feed_info.feed_end_date')}
					/>
				</Grid>
			</Section>

		</Collapsible>
	);

	//
}
