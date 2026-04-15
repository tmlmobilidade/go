'use client';

/* * */

import { useSamsDetailContext } from '@/contexts/SamDetail.context';
import { useSamsFavoritesContext } from '@/contexts/SamFavorites.context';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CloseButton, IconButton, IdTag, keepUrlParams, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function SamsDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();

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

	//
	// C. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleGoBack} type="close" />
			<IdTag id={samDetailContext.data.sam?._id} copyOnClick />
			<Spacer />
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
