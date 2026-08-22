'use client';

import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { useFormFlags, type UseFormFlagsReturnType, useMeData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useRolesCreateFormContext } from '../create/RolesCreateForm.context';

/* * */

type UseRolesDetailFlagsReturnType = Pick<UseFormFlagsReturnType,
  | 'deleteEnabled'
  | 'editEnabled'
  | 'updateEnabled'
>;

/* * */

export function useRolesDetailFlags(): UseRolesDetailFlagsReturnType {
	//

	const { data: meData } = useMeData();

	const { form } = useRolesCreateFormContext();

	//
	// Check permissions

	const hasDeletePermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: 'delete',
			scope: 'roles',
		});
	}, [meData?.permissions]);

	const hasUpdatePermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: 'update',
			scope: 'roles',
		});
	}, [meData?.permissions]);

	//
	// Build flags

	const { deleteEnabled, editEnabled, updateEnabled } = useFormFlags({
		deletePermission: hasDeletePermission,
		isDirty: form.formState.isDirty,
		isLoading: false,
		isValid: form.formState.isValid,
		updatePermission: hasUpdatePermission,
	});

	//
	// Return data

	return useMemo(() => ({
		deleteEnabled,
		editEnabled,
		updateEnabled,
	}), [hasDeletePermission]);
};
