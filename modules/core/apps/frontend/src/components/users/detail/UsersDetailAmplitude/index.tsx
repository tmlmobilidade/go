'use client';

import { IconPlayerRecord, IconPlayerStop } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type UserSessionReplayAuthorization, type UserSessionReplayResponse } from '@tmlmobilidade/go-types-core';
import { AlertMessage, Button, Collapsible, fetchApiData, Grid, Section, Tag, useAnalyticsContext, useHandleAction, useMeContext } from '@tmlmobilidade/ui';
import { type TOptions } from 'i18next';
import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { useUsersDetailUserId } from '../use-users-detail-user-id';

/* * */

interface UsersDetailAmplitudeProps {
	authorization: null | undefined | UserSessionReplayAuthorization
	isLoading: boolean
	onChange: () => Promise<unknown>
}

/* * */

export function UsersDetailAmplitude({ authorization, isLoading, onChange }: UsersDetailAmplitudeProps) {
	const { i18n, t } = useTranslation();
	const { userId } = useUsersDetailUserId();
	const { data: { user }, mutate: { me: refreshMe } } = useMeContext();
	const { flags: { failedReplayActivationId } } = useAnalyticsContext();

	const isPending = authorization?.started_at === null;
	const expiresAt = isPending ? authorization.pending_expires_at : authorization?.expires_at;
	const deadline = authorization?.cancelled_at === null && expiresAt != null && expiresAt > Date.now() ? expiresAt : null;
	const activationId = deadline === null ? undefined : authorization?.activation_id;
	const state = activationId ? (isPending ? 'pending' : 'active') : 'inactive';
	const formattedDeadline = deadline === null ? '' : new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
		dateStyle: 'short',
		timeStyle: 'short',
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
	const refreshIfIdle = useEffectEvent(async (expired: boolean) => {
		if (!isLoading && (expired || document.visibilityState === 'visible')) await onChange();
	});

	useEffect(() => {
		if (deadline === null) return;

		let disposed = false;
		let timeout: ReturnType<typeof setTimeout>;

		const scheduleRefresh = () => {
			const untilExpiry = Math.max(0, deadline - Date.now()) + 1;
			timeout = setTimeout(refresh, isPending ? Math.min(2_000, untilExpiry) : untilExpiry);
		};
		const refresh = async () => {
			const expired = Date.now() >= deadline;
			try {
				await refreshIfIdle(expired);
			} finally {
				if (isPending && !expired && !disposed) scheduleRefresh();
			}
		};

		scheduleRefresh();
		return () => {
			disposed = true;
			clearTimeout(timeout);
		};
	}, [deadline, isPending, onChange]);

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
