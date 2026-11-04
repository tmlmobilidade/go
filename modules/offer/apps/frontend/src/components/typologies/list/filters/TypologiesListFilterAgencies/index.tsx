/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useTypologiesListFilterAgencies } from '../TypologiesListFilterAgencies/use-typologies-list-filter-agencies';

/* * */

export function TypologiesListFilterAgencies() {
	//

	//
	// A. Setup variables

	const filter = useTypologiesListFilterAgencies();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListFilter
			active={filter.isActive}
			label={t('default:typologies.fields.agency_ids.label')}
			onChange={filter.set}
			options={filter.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
