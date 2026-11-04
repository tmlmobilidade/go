'use client';

/* * */

import { TypologiesList } from '@/components/typologies/list/TypologiesList';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ErrorDisplay, HasPermission, PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function TypologiesLayout({ children }: PropsWithChildren) {
	const { t } = useTranslation();

	return (
		<HasPermission action={PermissionCatalog.all.typologies.actions.nav} fallback={<ErrorDisplay message={t('default:typologies.noAccess')} />} scope={PermissionCatalog.all.typologies.scope}>
			<PanesManager
				id="typologies"
				panes={[
					<TypologiesList key="list" />,
					<Fragment key="detail">{children}</Fragment>,
				]}
			/>
		</HasPermission>
	);
}
