'use client';

/* * */

import { type ActionsOf, type Permission } from '@tmlmobilidade/types';
import { type PropsWithChildren, type ReactNode } from 'react';

import { useMeContext } from '../../../contexts/Me.context';
import { ErrorDisplay } from '../../display/ErrorDisplay';

/* * */

interface PermissionGuardProps<S extends Permission['scope']> extends PropsWithChildren {
	action: ActionsOf<S>
	fallback?: ReactNode
	message?: string
	scope: S
}

/* * */

export function PermissionGuard<S extends Permission['scope']>({ action, children, fallback, message = 'Não tem permissão para aceder a esta página.', scope }: PermissionGuardProps<S>) {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const hasPermission = meContext.actions.hasPermission(scope, action);

	//
	// B. Render components

	if (!hasPermission) {
		return fallback ?? <ErrorDisplay message={message} />;
	}

	return children;

	//
}
