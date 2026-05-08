'use client';

import { openRideExportModal } from '@/components/rides/export/RidesExportModal';
import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { RidesListLastUpdatedAt } from '@/components/rides/list/RidesListLastUpdatedAt';
import { IconFileDownload } from '@tabler/icons-react';
import { IconButton, Label, SearchInput, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const ridesListContext = useRidesListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps>{t('default:list.RidesListHeader.title')}</Label>
			<RidesListLastUpdatedAt />
			<Spacer shrink />
			<Tag label={`Total ${ridesListContext.data.filtered.length}`} variant="muted" />
			<SearchInput onChange={ridesListContext.filters.search.set} value={ridesListContext.filters.search.value} />
			<IconButton icon={<IconFileDownload />} onClick={() => openRideExportModal(ridesListContext.filters)} tooltip={t('default:list.RidesListHeader.export')} variant="secondary" />
		</Toolbar>
	);

	//
}
