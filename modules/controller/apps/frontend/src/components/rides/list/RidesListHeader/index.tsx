'use client';

/* * */

import { openRideExportModal } from '@/components/rides/export/RidesExportModal';
import { RidesListUpdatedAt } from '@/components/rides/list/RidesListUpdatedAt';
import { useRidesListContext } from '@/contexts/RidesList.context';
import { IconFileDownload } from '@tabler/icons-react';
import { IconButton, Label, Loader, SearchInput, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesListHeader() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps>{t('controller:rides.list.RidesListHeader.title')}</Label>
			{ridesListContext.flags.loading && <Loader size="sm" />}
			<Spacer shrink />
			<RidesListUpdatedAt />
			<Tag label={`Total ${ridesListContext.data.filtered.length}`} variant="muted" />
			<SearchInput onChange={ridesListContext.actions.setFilterSearch} value={ridesListContext.filters.search} />
			<IconButton icon={<IconFileDownload />} onClick={() => openRideExportModal(ridesListContext.filters)} tooltip={t('controller:rides.list.RidesListHeader.ExportButton.tooltip')} variant="secondary" />
		</Toolbar>
	);

	//
}
