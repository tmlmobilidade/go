'use client';

import { useSamsListContext } from '@/contexts/SamList.context';
import { Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const samsListContext = useSamsListContext();

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
