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
	resource_key: string
	value: string
}

interface NoResourceKeyOrValue {
	resource_key?: never
	value?: never
}

type HasPermissionFinalProps = HasPermissionProps & (NoResourceKeyOrValue | ResourceKeyAndValue);

/* * */

export function HasPermission({ action, children, fallback, resource_key, scope, value }: HasPermissionFinalProps) {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	//
	// B. Render components

	if (!resource_key && !value && meContext.actions.hasPermission(scope, action)) {
		return <>{children}</>;
	}

	if (meContext.actions.hasPermissionResource({ action, resource_key: resource_key, scope, value: value ?? '' })) {
		return <>{children}</>;
	}

	return fallback ?? null;

	//
}
