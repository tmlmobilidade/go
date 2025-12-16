/* * */

import { FeedInfoDisplay } from '@/components/common/FeedInfoDisplay';
import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { Collapsible, DateInput, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function PlanDetailSectionFeedInfo() {
	//

	//
	// A. Setup variables

	const planDetailContext = usePlanDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Resumo dos dados do arquivo extraídos do ficheiro feed_info.txt"
			title="Dados do Arquivo"
		>

			<Section gap="sm">
				<FeedInfoDisplay data={planDetailContext.data.plan?.gtfs_feed_info} />
			</Section>

			<Section gap="sm">
				<Grid columns="ab" gap="sm">
					<DateInput
						key={planDetailContext.data.form.key('gtfs_feed_info.feed_start_date')}
						readOnly={planDetailContext.flags.isReadOnly}
						{...planDetailContext.data.form.getInputProps('gtfs_feed_info.feed_start_date')}
					/>
					<DateInput
						key={planDetailContext.data.form.key('gtfs_feed_info.feed_end_date')}
						readOnly={planDetailContext.flags.isReadOnly}
						{...planDetailContext.data.form.getInputProps('gtfs_feed_info.feed_end_date')}
					/>
				</Grid>
			</Section>

		</Collapsible>
	);

	//
}
