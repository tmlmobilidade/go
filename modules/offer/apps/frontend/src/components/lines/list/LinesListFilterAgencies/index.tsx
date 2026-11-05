/* * */

import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function LinesListFilterAgencies() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const linesListContext = useLinesListContext();

	//
	// B. Render components

	return (
		<ListFilter
			active={linesListContext.filters.agencies.isActive}
			label={t('lines:list.LinesListFilterAgencies.agencies')}
			onChange={linesListContext.filters.agencies.set}
			options={linesListContext.filters.agencies.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
