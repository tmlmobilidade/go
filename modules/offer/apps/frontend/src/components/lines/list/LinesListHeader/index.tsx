'use client';

import { openCreateLineModal } from '@/components/lines/create/LineCreate.modal';
import { openGtfsExportModal } from '@/components/lines/export/GtfsExportModal';
import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { openVkmModal } from '@/components/lines/vkms/VkmModal';
import { IconDots, IconFileDownload, IconPlus, IconSearch } from '@tabler/icons-react';
import { ListHeader, Menu, MenuItem, MenuLabel, SearchField } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function LinesListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const linesListContext = useLinesListContext();

	//
	// B. Render components

	return (
		<ListHeader
			count={linesListContext.data.filtered.length}
			search={<SearchField onChange={linesListContext.filters.search.set} value={linesListContext.filters.search.value} />}
			title={t('lines:list.LinesListHeader.lines')}
			actions={(
				<Menu icon={IconDots} label={t('lines:list.LinesListHeader.more_options')}>
					<MenuLabel>{t('lines:list.LinesListHeader.actions')}</MenuLabel>
					<MenuItem
						disabled={!linesListContext.flags.canCreate}
						leftSection={<IconPlus size={20} />}
						onClick={openCreateLineModal}
						title={t('lines:list.LinesListHeader.new_line_action')}
					/>
					<MenuItem
						leftSection={<IconFileDownload size={20} />}
						onClick={openGtfsExportModal}
						title={t('lines:list.LinesListHeader.export_gtfs')}
					/>
					<MenuItem
						leftSection={<IconSearch size={20} />}
						onClick={openVkmModal}
						title={t('lines:list.LinesListHeader.vkm')}
					/>
				</Menu>
			)}
		/>
	);

	//
}
