/* * */

import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { NoDataLabel } from '@/components/common/display/NoDataLabel';
import { RegularListItem } from '@/components/common/lists/RegularListItem';
import { LineDisplay } from '@/components/lines/common/LineDisplay';
import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { LinesListGroup } from '@/components/lines/list/LinesListGroup';
import { Space } from '@mantine/core';
import { LoadingSection, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';
import { ViewportList } from 'react-viewport-list';

/* * */

export function LinesListViewAll() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const linesListContext = useLinesListContext();

	const { setActiveBottomSheet } = useBottomSheet();

	//
	// B. Render components

	if (linesListContext.flags.isLoading) {
		return <LoadingSection fullHeight />;
	}

	if (!linesListContext.data.filtered.length) {
		return (
			<Section>
				<NoDataLabel text={t('default:lines.LinesListViewAll.no_data')} withMinHeight />
			</Section>
		);
	}

	return (
		<Section padding="none">
			{linesListContext.data.filtered.map(group => (
				<LinesListGroup
					key={group.agency_id}
					agencyId={group.agency_id}
					onShowMoreLines={() => linesListContext.actions.increaseQtyPerAgency(group.agency_id)}
					withShowMoreButton={group.lines.length < group.qty}
				>
					{group.lines.map((line, index) => (
						<RegularListItem
							key={line._id}
							onClick={() => setActiveBottomSheet({ entityId: line._id, view: 'lines-detail' })}
							ariaLabel={t(`default:lines.LinesListViewAll.items.aria_label`, '', {
								index: index + 1,
								tts_name: line.long_name,
							})}
						>
							<LineDisplay lineData={line} searchQuery={linesListContext.filters.search.value} />
						</RegularListItem>
					))}
				</LinesListGroup>
			))}
			<Space h="90px" />
		</Section>
	);

	//
}
