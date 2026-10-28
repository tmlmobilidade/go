'use client';

import { IconPlayerRecord, IconPlayerStop } from '@tabler/icons-react';
import { Button, Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useUsersDetailFormContext } from '../UsersDetailForm.context';

/* * */

export function UsersDetailSessionReplay() {
	// A. Setup variables

	const { i18n, t } = useTranslation('default');
	const { sessionReplay: { actions, capabilities, data, status } } = useUsersDetailFormContext();
	const deadline = data.deadline === null ? '' : new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
		dateStyle: 'short',
		timeStyle: 'short',
		timeZone: 'Europe/Lisbon',
	}).format(data.deadline);

	// B. Render components

	return (
		<>
			<Tag
				label={t(`users.detail.SessionReplay.states.${data.state}.label`)}
				tooltip={t(`users.detail.SessionReplay.states.${data.state}.description` as const, { deadline })}
				variant={data.isAuthorized ? 'primary' : 'muted'}
			/>
			<Button
				disabled={data.isAuthorized ? !capabilities.cancelEnabled : !capabilities.authorizeEnabled}
				icon={data.isAuthorized ? <IconPlayerStop /> : <IconPlayerRecord />}
				label={t(data.isAuthorized ? 'users.detail.SessionReplay.cancel.label' : 'users.detail.SessionReplay.authorize.label')}
				loading={status.isAuthorizing || status.isCancelling}
				onClick={data.isAuthorized ? actions.cancel : actions.authorize}
				variant="secondary"
			/>
		</>
	);
}
