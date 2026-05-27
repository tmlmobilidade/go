/* * */

import { NoDataLabel } from '@/components/layout/NoDataLabel';
import { RegularListItem } from '@/components/layout/RegularListItem';
import { Section } from '@/components/layout/Section';
import { Surface } from '@/components/layout/Surface';
import { LineDisplay } from '@/components/lines/common/LineDisplay';
import { useLinesListContext } from '@/components/lines/list/LinesList.context';
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

	if (!linesListContext.data.filtered.length) {
		return (
			<Surface variant="persistent" forceOverflow>
				<Section>
					<NoDataLabel text={t('default:lines.LinesListViewAll.no_data')} withMinHeight />
				</Section>
			</Surface>
		);
	}

	return (
		<Surface variant="persistent" forceOverflow>
			<Section>
				<ViewportList itemMargin={0} items={linesListContext.data.filtered}>
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
			</Section>
		</Surface>
	);

	//
}
