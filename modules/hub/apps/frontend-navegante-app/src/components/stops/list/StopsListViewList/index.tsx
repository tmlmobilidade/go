/* * */

import { NoDataLabel } from '@/components/layout/NoDataLabel';
import { RegularListItem } from '@/components/layout/RegularListItem';
import { StopDisplay } from '@/components/stops/common/StopDisplay';
import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';
import { ViewportList } from 'react-viewport-list';

/* * */

export function StopsListViewList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const stopsListContext = useStopsListContext();

	//
	// B. Render components

	if (!stopsListContext.data.filtered.length) {
		return (
			<Section>
				<NoDataLabel text={t('default:stops.StopsListViewList.no_data')} withMinHeight />
			</Section>
		);
	}

	return (
		<Section padding="none">
			<ViewportList itemMargin={0} items={stopsListContext.data.filtered}>
				{item => (
					<RegularListItem key={item._id} href={`/stops/${item._id}`}>
						<StopDisplay stopData={item} />
					</RegularListItem>
				)}
			</ViewportList>
		</Section>
	);
}
