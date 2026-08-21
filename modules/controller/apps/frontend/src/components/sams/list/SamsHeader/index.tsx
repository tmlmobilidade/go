'use client';

import { openSamExportModal } from '@/components/sams/export/SamsExportModal';
import { useSamsListContext } from '@/contexts/SamList.context';
import { IconFileDownload } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { HasPermission, IconButton, Label, SearchField, Spacer, Toolbar } from '@tmlmobilidade/ui';
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
			<SearchField onChange={samsListContext.filters.search.set} value={samsListContext.filters.search.value} />
			<HasPermission action={PermissionCatalog.all.sams.actions.export} scope={PermissionCatalog.all.sams.scope}>
				<IconButton
					icon={<IconFileDownload />}
					tooltip={t('default:sams.export.SamsExportModal.title')}
					variant="secondary"
					onClick={() => openSamExportModal({
						favoritesEnabled: samsListContext.flags.favoritesEnabled,
						filters: samsListContext.filters,
						samIds: samsListContext.data.filtered.map(sam => sam._id),
					})}
				/>
			</HasPermission>
		</Toolbar>
	);
}
