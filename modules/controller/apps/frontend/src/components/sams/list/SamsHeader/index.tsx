'use client';

import { useSamsListContext } from '@/contexts/SamsList.context';
import { Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsListHeader() {
	//

	//
	// A. Setup variables

	const samsListContext = useSamsListContext();
	const { t } = useTranslation();
	//
	// B. Render components
	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('default:sams.list.SamsListHeader.title')}</Label>
			<Spacer />
			<SearchInput onChange={samsListContext.filters.search.set} value={samsListContext.filters.search.value} />
		</Toolbar>
	);
}
