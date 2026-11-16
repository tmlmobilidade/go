'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type UserSessionReplayAuthorization, type UserSessionReplayResponse } from '@tmlmobilidade/go-types-core';
import { hasPermission, type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, useHandleAction, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getUsersDetailSessionReplayState, type UsersDetailSessionReplayState } from './utils/get-users-detail-session-replay-state';

/* * */

interface UseUsersDetailSessionReplayProps {
	authorization: null | undefined | UserSessionReplayAuthorization
	isLoading: boolean
	onChange: () => void
	permissions: Permission[] | undefined
	userId: string
}

export interface UseUsersDetailSessionReplayReturnType {
	actions: {
		authorize: () => Promise<void>
		cancel: () => Promise<void>
	}
	capabilities: {
		authorizeEnabled: boolean
		cancelEnabled: boolean
	}
	data: UsersDetailSessionReplayState
	status: {
		isAuthorizing: boolean
		isCancelling: boolean
	}
}

/* * */

export function useUsersDetailSessionReplay({ authorization, isLoading, onChange, permissions, userId }: UseUsersDetailSessionReplayProps): UseUsersDetailSessionReplayReturnType {
	//

	//
	// Setup variables

	const { t } = useTranslation();
	const data = getUsersDetailSessionReplayState(authorization, Date.now());
	const hasManagePermission = hasPermission(permissions, {
		action: PermissionCatalog.all.users.actions.manage_session_replay,
		scope: PermissionCatalog.all.users.scope,
	});

	//
	// Handle actions

	const { action: handleAuthorize, isLoading: isAuthorizing } = useHandleAction<UserSessionReplayResponse>({
		fetchFn: async () => await fetchApiData<UserSessionReplayResponse>({ method: 'POST', url: API_ROUTES.core.USERS_DETAIL_SESSION_REPLAY(userId) }),
		labels: {
			error_title: t('default:users.detail.SessionReplay.error.title'),
			success_message: t('default:users.detail.SessionReplay.authorize.success'),
			success_title: t('default:users.detail.SessionReplay.success.title'),
		},
		onError: () => onChange(),
		onSuccess: () => onChange(),
	});

	const { action: handleCancel, isLoading: isCancelling } = useHandleAction<UserSessionReplayResponse, string>({
		fetchFn: async activationId => await fetchApiData<UserSessionReplayResponse>({ method: 'DELETE', url: API_ROUTES.core.USERS_DETAIL_SESSION_REPLAY_VAR(activationId, userId) }),
		labels: {
			error_title: t('default:users.detail.SessionReplay.error.title'),
			success_message: t('default:users.detail.SessionReplay.cancel.success'),
			success_title: t('default:users.detail.SessionReplay.success.title'),
		},
		onError: () => onChange(),
		onSuccess: () => onChange(),
	});

	//
	// Setup capabilities

	const { createEnabled: authorizeEnabled, deleteEnabled: cancelEnabled } = useStandardFormCapabilities({
		create: { hasPermission: hasManagePermission },
		delete: { hasPermission: hasManagePermission },
		// Replay controls do not depend on unsaved user form values.
		form: { isDirty: false, isValid: true },
		loading: { isLoading: isLoading || isAuthorizing || isCancelling },
	});

	const authorize = useCallback(async () => {
		if (!authorizeEnabled || data.isAuthorized) return;
		await handleAuthorize();
	}, [authorizeEnabled, data.isAuthorized, handleAuthorize]);

	const cancel = useCallback(async () => {
		if (!cancelEnabled || !data.isAuthorized || !authorization) return;
		await handleCancel(authorization.activation_id);
	}, [authorization, cancelEnabled, data.isAuthorized, handleCancel]);

	//
	// Setup effects

	// Refresh at the deadline even if polling returns the same user document.
	useEffect(() => {
		if (!hasManagePermission || data.deadline === null) return;

		const timeout = setTimeout(onChange, Math.max(0, data.deadline - Date.now()) + 1);

		return () => clearTimeout(timeout);
	}, [data.deadline, hasManagePermission, onChange]);

	//
	// Return state

	return useMemo(() => ({
		actions: { authorize, cancel },
		capabilities: { authorizeEnabled, cancelEnabled },
		data,
		status: { isAuthorizing, isCancelling },
	}), [authorize, authorizeEnabled, cancel, cancelEnabled, data, isAuthorizing, isCancelling]);
}
