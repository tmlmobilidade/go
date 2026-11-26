'use client';

import { IconPlayerRecord, IconPlayerStop } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type UserSessionReplayAuthorization, type UserSessionReplayResponse } from '@tmlmobilidade/go-types-core';
import { AlertMessage, Button, Collapsible, fetchApiData, Grid, Section, Tag, useAnalyticsContext, useHandleAction, useMeContext } from '@tmlmobilidade/ui';
import { type TOptions } from 'i18next';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useUsersDetailUserId } from '../use-users-detail-user-id';

/* * */

interface UsersDetailAmplitudeProps {
	authorization: null | undefined | UserSessionReplayAuthorization
	isLoading: boolean
	onChange: () => void
}

/* * */

export function UsersDetailAmplitude({ authorization, isLoading, onChange }: UsersDetailAmplitudeProps) {
	//

	//
	// A. Setuo

	const { i18n, t } = useTranslation();
	const { userId } = useUsersDetailUserId();
	const { data: { user }, mutate: { user: refreshMe } } = useMeContext();
	const { flags: { failedReplayActivationId } } = useAnalyticsContext();

	const expiresAt = authorization?.started_at === null ? authorization.pending_expires_at : authorization?.expires_at;
	const deadline = authorization?.cancelled_at === null && expiresAt != null && expiresAt > Date.now() ? expiresAt : null;
	const activationId = deadline === null ? undefined : authorization?.activation_id;
	const state = activationId ? 'active' : 'inactive';
	const formattedDeadline = deadline === null ? '' : new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
		dateStyle: 'short',
		timeStyle: 'short',©
		timeZone: 'Europe/Lisbon',
	}).format(deadline);
	const tooltipOptions: TOptions = { deadline: formattedDeadline };

	const labels = {
		error_title: t('default:users.detail.SessionReplay.error.title'),
		success_title: t('default:users.detail.SessionReplay.success.title'),
	};

	const { action: authorize, isLoading: isAuthorizing } = useHandleAction({
		fetchFn: () => fetchApiData<UserSessionReplayResponse>({ method: 'POST', url: API_ROUTES.core.USERS_DETAIL_SESSION_REPLAY(userId) }),
		labels: { ...labels, success_message: t('default:users.detail.SessionReplay.authorize.success') },
		onError: () => onChange(),
		onSuccess: () => onChange(),
	});

	const { action: cancel, isLoading: isCancelling } = useHandleAction({
		fetchFn: (id: string) => fetchApiData<UserSessionReplayResponse>({ method: 'DELETE', url: API_ROUTES.core.USERS_DETAIL_SESSION_REPLAY_VAR(userId, id) }),
		labels: { ...labels, success_message: t('default:users.detail.SessionReplay.cancel.success') },
		onError: () => onChange(),
		onSuccess: () => {
			if (user?._id === userId) refreshMe();
			onChange();
		},
	});

	const isPendingAction = isAuthorizing || isCancelling;

	useEffect(() => {
		if (deadline === null) return;
		const timeout = setTimeout(onChange, Math.max(0, deadline - Date.now()) + 1);
		return () => clearTimeout(timeout);
	}, [deadline, onChange]);

	return (
		<Collapsible description={t('default:users.detail.Amplitude.description')} title={t('default:users.detail.Amplitude.title')}>
			<Section>
				<Grid columns="ab" gap="md">
					<Tag
						label={t(`default:users.detail.SessionReplay.states.${state}.label`)}
						tooltip={t(`default:users.detail.SessionReplay.states.${state}.description` as const, tooltipOptions)}
						variant={activationId ? 'primary' : 'muted'}
					/>
					<Button
						disabled={isLoading || isPendingAction}
						icon={activationId ? <IconPlayerStop /> : <IconPlayerRecord />}
						label={t(activationId ? 'default:users.detail.SessionReplay.cancel.label' : 'default:users.detail.SessionReplay.authorize.label')}
						loading={isPendingAction}
						onClick={() => activationId ? cancel(activationId) : authorize()}
						variant="secondary"
					/>
				</Grid>
				{activationId && activationId === failedReplayActivationId && user?._id === userId && (
					<AlertMessage title={t('default:users.detail.SessionReplay.error.capture')} variant="danger" />
				)}
			</Section>
		</Collapsible>
	);
}
