/* * */

import { NoDataLabel } from '@/components/layout/NoDataLabel';
import { RegularListItem } from '@/components/layout/RegularListItem';
import { LineDisplay } from '@/components/lines/common/LineDisplay';
import { LineGroup } from '@/components/lines/common/LineGroup';
import { useLinesListContext } from '@/components/lines/list/LinesList.context';
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
				<LineGroup key={group.agency_id} agencyId={group.agency_id}>
					<ViewportList itemMargin={0} items={group.lines}>
						{line => (
							<RegularListItem key={line.id} href={`/lines/${line.id}`}>
								<LineDisplay lineData={line} />
							</RegularListItem>
						)}
					</ViewportList>
				</LineGroup>
			))}
		</Section>
	);

	//
}
