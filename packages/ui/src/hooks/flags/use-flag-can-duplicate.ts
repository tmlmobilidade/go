'use client';

/* * */

import { useMemo } from 'react';

/* * */

interface UseFlagCanDuplicateProps {

	/**
	 * Indicates if the user has permission to duplicate the item.
	 * If multiple permissions are required, this should be the combined result.
	 * This is a mandatory field.
	 */
	hasPermission: boolean

	/**
	 * Indicates if the item is deleted.
	 * If undefined, the item is considered not deleted.
	 */
	isDeleted?: boolean

	/**
	 * Indicates if the item is being deleted.
	 * If undefined, the item is considered not currently deleting.
	 */
	isDeleting?: boolean

	/**
	 * Indicates if the form has unsaved changes.
	 * This is a mandatory field.
	 */
	isDirty: boolean

	/**
	 * Indicates if the item is loading.
	 * If undefined, the item is considered not loading.
	 */
	isLoading?: boolean

	/**
	 * Indicates if the item is locked.
	 * If undefined, the item is considered not locked.
	 */
	isLocked?: boolean

	/**
	 * Indicates if the item is being locked.
	 * If undefined, the item is considered not currently locking.
	 */
	isLocking?: boolean

	/**
	 * Indicates if the form is valid.
	 * This is a mandatory field.
	 */
	isValid: boolean

}

interface UseFlagCanDuplicateReturnType {

	/**
	 * Indicates if the item can be duplicated.
	 */
	canDuplicate: boolean

}

/**
 * Hook to determine if an item can be duplicated
 * based on user permissions and item state.
 * @param props The properties to determine duplication status.
 * @returns An object containing the canDuplicate flag.
 */
export function useFlagCanDuplicate(props: UseFlagCanDuplicateProps): UseFlagCanDuplicateReturnType {
	//

	//
	// A. Handle actions

	const canDuplicateValue = useMemo(() => {
		// If the user does not have a duplicate permission,
		// then the item cannot be duplicated, regardless of other conditions.
		if (!props.hasPermission) return false;
		// If isDeleted is undefined, we consider it as not deleted.
		// Some document types do not have the isDeleted property.
		if (props.isDeleted !== undefined && props.isDeleted) return false;
		// If isDeleting is undefined, we consider it as not deleting.
		// Some document types do not have the isDeleting property.
		if (props.isDeleting !== undefined && props.isDeleting) return false;
		// If isLoading is undefined, we consider it as not loading.
		// Some document types do not have the isLoading property.
		if (props.isLoading !== undefined && props.isLoading) return false;
		// If isLocked is undefined, we consider it as not locked.
		// Some document types may not have the isLocked property.
		if (props.isLocked !== undefined && props.isLocked) return false;
		// If isLocking is undefined, we consider it as not locking.
		// Some document types do not have the isLocking property.
		if (props.isLocking !== undefined && props.isLocking) return false;
		// If the form is dirty, we cannot duplicate.
		if (!props.isDirty) return false;
		// If the form is valid, we can duplicate.
		if (!props.isValid) return false;
		// Otherwise, duplication is allowed.
		return true;
	}, [props]);

	//
	// B. Return value

	return { canDuplicate: canDuplicateValue };

	//
};
