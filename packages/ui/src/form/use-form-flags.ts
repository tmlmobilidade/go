'use client';

import { useMemo } from 'react';

/* * */

interface UseFormFlagsProps {

	/**
	 * Indicates if the user has permission to delete the item.
	 * @default false
	 */
	deletePermission?: boolean

	/**
	 * Indicates if the user has permission to duplicate the item.
	 * @default false
	 */
	duplicatePermission?: boolean

	/**
	 * Indicates if the item is deleted.
	 * @default false
	 */
	isDeleted?: boolean

	/**
	 * Indicates if the form has unupdated changes.
	 * @required This is a mandatory field.
	 */
	isDirty: boolean

	/**
	 * Indicates if the item is loading.
	 * @default false
	 */
	isLoading?: boolean

	/**
	 * Indicates if the item is locked.
	 * @default false
	 */
	isLocked?: boolean

	/**
	 * Indicates if the form is valid.
	 * @required This is a mandatory field.
	 */
	isValid: boolean

	/**
	 * Indicates if the user has permission to lock the item.
	 * @default false
	 */
	lockPermission?: boolean

	/**
	 * Indicates if the user has permission to update the item.
	 * @default false
	 */
	updatePermission?: boolean

}

export interface UseFormFlagsReturnType {

	/**
	 * Indicates if the item can be deleted.
	 */
	deleteEnabled: boolean

	/**
	 * Indicates if the item can be duplicated.
	 */
	duplicateEnabled: boolean

	/**
	 * Indicates if the item can be edited.
	 */
	editEnabled: boolean

	/**
	 * Indicates if the item can be locked.
	 */
	lockEnabled: boolean

	/**
	 * Indicates if the item can be updated.
	 */
	updateEnabled: boolean

}

/**
 * Hook to determine if an item should be in read-only mode
 * based on user permissions and item state.
 * @param props The properties to determine read-only status.
 * @returns An object containing the form flags.
 */
export function useFormFlags(props: UseFormFlagsProps): UseFormFlagsReturnType {
	//

	const deleteEnabled = useMemo(() => {
		if (!props.deletePermission) return false;
		if (props.isLoading) return false;
		if (props.isLocked) return false;
		if (props.isDirty) return false;
		if (!props.isValid) return false;
		return true;
	}, [props]);

	const updateEnabled = useMemo(() => {
		if (!props.updatePermission) return false;
		if (props.isLoading) return false;
		if (props.isLocked) return false;
		if (!props.isDirty) return false;
		if (!props.isValid) return false;
		return true;
	}, [props]);

	const duplicateEnabled = useMemo(() => {
		if (!props.duplicatePermission) return false;
		if (props.isLoading) return false;
		if (props.isLocked) return false;
		if (props.isDirty) return false;
		if (!props.isValid) return false;
		return true;
	}, [props]);

	const lockEnabled = useMemo(() => {
		if (!props.lockPermission) return false;
		if (props.isLoading) return false;
		if (props.isLocked) return false;
		if (props.isDirty) return false;
		if (!props.isValid) return false;
		return true;
	}, [props]);

	const editEnabled = useMemo(() => {
		if (!props.updatePermission) return true;
		if (props.isDeleted) return false;
		if (props.isLoading) return true;
		if (props.isLocked) return true;
		if (props.isDirty) return true;
		if (!props.isValid) return true;
		return false;
	}, [props]);

	return useMemo(() => ({
		deleteEnabled,
		duplicateEnabled,
		editEnabled,
		lockEnabled,
		updateEnabled,
	}), [deleteEnabled, duplicateEnabled, editEnabled, lockEnabled, updateEnabled]);
};
