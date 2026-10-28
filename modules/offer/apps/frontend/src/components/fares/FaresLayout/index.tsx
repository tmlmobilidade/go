'use client';

/* * */

import { FaresList } from '@/components/fares/list/FaresList';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ErrorDisplay, HasPermission, PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function FaresLayout({ children }: PropsWithChildren) {
	const { t } = useTranslation();

	return (
		<HasPermission action={PermissionCatalog.all.fares.actions.nav} fallback={<ErrorDisplay message={t('default:fares.noAccess')} />} scope={PermissionCatalog.all.fares.scope}>
			<PanesManager
				id="fares"
				panes={[
					<FaresList key="list" />,
					<Fragment key="detail">{children}</Fragment>,
				]}
			/>
		</HasPermission>
	);
}
