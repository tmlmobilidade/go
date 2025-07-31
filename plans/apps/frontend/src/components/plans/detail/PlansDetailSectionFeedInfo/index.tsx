/* * */

import { FeedInfoDisplay } from '@/components/common/FeedInfoDisplay';
import { usePlansDetailContext } from '@/contexts/PlansDetail.context';
import { Collapsible, DatePicker, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function PlansDetailSectionFeedInfo() {
	//

	//
	// A. Setup variables

	const plansDetailContext = usePlansDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Resumo dos dados do arquivo extraídos do ficheiro feed_info.txt"
			title="Dados do Arquivo"
		>

			<Section gap="sm">
				<FeedInfoDisplay data={plansDetailContext.data.plan?.gtfs_feed_info} />
			</Section>

			<Section gap="sm">
				<Grid columns="ab" gap="sm">
					<DatePicker {...plansDetailContext.data.form.getInputProps('gtfs_feed_info.feed_start_date')} readOnly={plansDetailContext.flags.read_only} />
					<DatePicker {...plansDetailContext.data.form.getInputProps('gtfs_feed_info.feed_end_date')} readOnly={plansDetailContext.flags.read_only} />
				</Grid>
			</Section>

		</Collapsible>
	);

	//
}
