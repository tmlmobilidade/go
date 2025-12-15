/* * */

import { FeedInfoDisplay } from '@/components/common/FeedInfoDisplay';
import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { Collapsible, DatePicker, Grid, Section } from '@tmlmobilidade/ui';

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
					<DatePicker
						key={planDetailContext.data.form.key('gtfs_feed_info.feed_start_date')}
						{...planDetailContext.data.form.getInputProps('gtfs_feed_info.feed_start_date')}
						readOnly={planDetailContext.flags.isReadOnly}
					/>
					<DatePicker
						key={planDetailContext.data.form.key('gtfs_feed_info.feed_end_date')}
						{...planDetailContext.data.form.getInputProps('gtfs_feed_info.feed_end_date')}
						readOnly={planDetailContext.flags.isReadOnly}
					/>
				</Grid>
			</Section>

		</Collapsible>
	);

	//
}
