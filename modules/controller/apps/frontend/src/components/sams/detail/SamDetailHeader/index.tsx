'use client';

/* * */

import { openSamExportModal } from '@/components/sams/export/SamsExportModal';
import { useSamsDetailContext } from '@/contexts/SamDetail.context';
import { useSamsFavoritesContext } from '@/contexts/SamFavorites.context';
import { IconFileDownload, IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { CloseButton, HasPermission, IconButton, IdTag, keepUrlParams, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { t } = useTranslation();

	const samDetailContext = useSamsDetailContext();
	const samsFavoritesContext = useSamsFavoritesContext();

	const samId = samDetailContext.data.sam?._id;
	const isFavorite = samId ? samsFavoritesContext.data.favorites.includes(samId.toString()) : false;

	//
	// B. Handle actions

	const handleGoBack = () => {
		router.push(keepUrlParams(PAGE_ROUTES.controller.SAMS_LIST));
	};

	const handleToggleFavorite = () => {
		if (!samId || samsFavoritesContext.flags.loading) return;
		void samsFavoritesContext.actions.toggleFavorite(samId.toString());
	};

	const handleExportSam = () => {
		if (!samId) return;
		openSamExportModal({
			analysisApexVersions: samDetailContext.ui.analysisApexVersionFilter,
			analysisFilterEndTime: samDetailContext.ui.analysisFilterEndTime,
			analysisFilterStartTime: samDetailContext.ui.analysisFilterStartTime,
			samId,
			source: 'detail',
		});
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleGoBack} type="close" />
			<IdTag id={samDetailContext.data.sam?._id} copyOnClick />
			<Spacer />
			<HasPermission action={PermissionCatalog.all.sams.actions.export} scope={PermissionCatalog.all.sams.scope}>
				<IconButton
					disabled={!samId}
					icon={<IconFileDownload />}
					onClick={handleExportSam}
					tooltip={t('default:sams.export.SamsExportModal.title')}
					variant="secondary"
				/>
			</HasPermission>
			<IconButton
				disabled={!samId || samsFavoritesContext.flags.loading}
				icon={isFavorite ? <IconHeartFilled /> : <IconHeart />}
				onClick={handleToggleFavorite}
				tooltip={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
				variant="primary"
			/>
		</Toolbar>
	);
}
