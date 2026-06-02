/* * */

import { NoDataLabel } from '@/components/layout/NoDataLabel';
import { RegularListItem } from '@/components/layout/RegularListItem';
import { LineDisplay } from '@/components/lines/common/LineDisplay';
import { LineGroup } from '@/components/lines/common/LineGroup';
import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';
import { ViewportList } from 'react-viewport-list';

/* * */

export function LinesListViewAll() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const linesListContext = useLinesListContext();

	const getLineId = (line: { _id?: string, id?: string }) => line.id || line._id || '';

	//
	// B. Render components

	if (!Object.keys(linesListContext.data.filtered).length) {
		return (
			<Section>
				<NoDataLabel text={t('default:lines.LinesListViewAll.no_data')} withMinHeight />
			</Section>
		);
	}

	return (
		<Section padding="none">
			{Object.keys(linesListContext.data.filtered).map((agencyId) => {
				return (
					<LineGroup key={agencyId} agencyId={agencyId}>
						<ViewportList itemMargin={0} items={linesListContext.data.filtered[agencyId]}>
							{(item) => {
								const lineId = getLineId(item);
								if (!lineId) return null;
								return (
									<RegularListItem key={lineId} href={`/lines/${lineId}`}>
										<LineDisplay lineData={item} />
									</RegularListItem>
								);
							}}
						</ViewportList>
					</LineGroup>
				);
			})}
		</Section>
	);

	//
}
