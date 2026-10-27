'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ErrorDisplay, HasPermission, PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import { ChangelogList } from '../list/ChangelogList';

/* * */

export function ChangelogLayout({ children }: PropsWithChildren) {
	//

	const { t } = useTranslation();

	return (
		<HasPermission action={PermissionCatalog.all.changelogs.actions.read} fallback={<ErrorDisplay message={t('default:dev.noAccess')} />} scope={PermissionCatalog.all.changelogs.scope}>
			<PanesManager
				id="dev-changelog"
				panes={[
					<ChangelogList key="list" />,
					<Fragment key="detail">{children}</Fragment>,
				]}
			/>
		</HasPermission>
	);
}
