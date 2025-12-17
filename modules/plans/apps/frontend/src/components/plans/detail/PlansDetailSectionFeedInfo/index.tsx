/* * */

import { FeedInfoDisplay } from '@/components/common/FeedInfoDisplay';
import { usePlansDetailContext } from '@/contexts/PlansDetail.context';
import { Collapsible, DatePicker, Grid, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PlansDetailSectionFeedInfo() {
	//

	//
	// A. Setup variables

	const plansDetailContext = usePlansDetailContext();
	const { t } = useTranslation('plans', { keyPrefix: 'plans.detail.section_feed_info' });

	//
	// B. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>

			<Section gap="sm">
				<FeedInfoDisplay data={plansDetailContext.data.plan?.gtfs_feed_info} />
			</Section>

			<Section gap="sm">
				<Grid columns="ab" gap="sm">
					<DatePicker
						{...plansDetailContext.data.form.getInputProps('gtfs_feed_info.feed_start_date')}
						readOnly={plansDetailContext.flags.read_only}
					/>
					<DatePicker
						{...plansDetailContext.data.form.getInputProps('gtfs_feed_info.feed_end_date')}
						readOnly={plansDetailContext.flags.read_only}
					/>
				</Grid>
			</Section>

		</Collapsible>
	);

	//
}
