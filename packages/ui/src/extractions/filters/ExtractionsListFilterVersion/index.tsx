/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useExtractionsListFilterVersion } from './use-extractions-list-filter-version';

/* * */

export function ExtractionsListFilterVersion() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterVersion = useExtractionsListFilterVersion();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterVersion.isActive}
			label={t('shared:extractions.components.ExtractionsListFilterVersion.label')}
			onChange={filterVersion.set}
			options={filterVersion.options}
			isMultiple
			withToggleAll
		/>
	);
}
