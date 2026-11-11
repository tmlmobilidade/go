'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ErrorDisplay, HasPermission, PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import { BannersList } from '../list/BannersList';

/* * */

export function BannersLayout({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<HasPermission action={PermissionCatalog.all.banners.actions.read} fallback={<ErrorDisplay message={t('default:dev.noAccess')} />} scope={PermissionCatalog.all.banners.scope}>
			<PanesManager
				id="dev-banners"
				panes={[
					<BannersList key="list" />,
					<Fragment key="detail">{children}</Fragment>,
				]}
			/>
		</HasPermission>
	);
}
