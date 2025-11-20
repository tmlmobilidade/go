'use client';

/* * */

import { useMeContext } from '../../../contexts';

/* * */

interface HasPermissionProps {
	action: string
	children: React.ReactNode
	fallback?: React.ReactNode
	scope: string
}

interface ResourceKeyAndValue {
	resourceKey: string
	value: string
}

interface NoResourceKeyOrValue {
	resourceKey?: never
	value?: never
}

type HasPermissionFinalProps = HasPermissionProps & (NoResourceKeyOrValue | ResourceKeyAndValue);

/* * */

export function HasPermission({ action, children, fallback, resourceKey, scope, value }: HasPermissionFinalProps) {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	//
	// B. Render components

	if (!resourceKey && !value && meContext.actions.hasPermission(scope, action)) {
		return <>{children}</>;
	}

	if (meContext.actions.hasPermissionResource({ action, resource_key: resourceKey, scope, value: value ?? '' })) {
		return <>{children}</>;
	}

	return fallback ?? null;

	//
}
