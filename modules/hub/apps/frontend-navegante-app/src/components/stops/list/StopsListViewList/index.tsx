/* * */

import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { NoDataLabel } from '@/components/common/display/NoDataLabel';
import { RegularListItem } from '@/components/common/lists/RegularListItem';
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

	const { setActiveBottomSheet } = useBottomSheet();

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
					<RegularListItem key={item._id} onClick={() => setActiveBottomSheet({ entityId: String(item._id), view: 'stops-detail' })}>
						<StopDisplay searchQuery={stopsListContext.filters.search.value} stopData={item} />
					</RegularListItem>
				)}
			</ViewportList>
		</Section>
	);
}
