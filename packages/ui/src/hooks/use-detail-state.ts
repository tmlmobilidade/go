'use client';

import { useMemo } from 'react';

/* * */

interface UseDetailStateProps {
	hasError: boolean | null
	isDeleted: boolean | null
	isDeleting: boolean | null
	isDirty: boolean
	isLoading: boolean | null
	isLocked: boolean | null
	isLocking: boolean | null
	isSaving: boolean | null
	isValid: boolean
	permissions: {
		delete: boolean
		lock: boolean
		read: boolean
		update: boolean
	}
}

interface UseDetailStateReturnType {
	canDelete: boolean
	canLock: boolean
	canSave: boolean
	canView: boolean
	isOperating: boolean
	isReadOnly: boolean
}

export function useDetailState(props: UseDetailStateProps): UseDetailStateReturnType {
	//

	//
	// A. Setup variables

	const isEntityDeleted = useMemo(() => props.isDeleted ?? false, [props.isDeleted]);
	const isEntityLocked = useMemo(() => props.isLocked ?? false, [props.isLocked]);
	const isOperating = useMemo(() => {
		return props.isLoading || props.isSaving || props.isLocking || props.isDeleting;
	}, [props.isLoading, props.isSaving, props.isLocking, props.isDeleting]);

	//
	// B. Compute capabilities

	const canView = useMemo(() => {
		// Can view if we have read permission
		return props.permissions.read;
	}, [props.permissions.read]);

	const canSave = useMemo(() => {
		// Can save if: has update permission, not deleted, not operating, not locked, form is dirty and valid
		return props.permissions.update && !isEntityDeleted && !isOperating && !isEntityLocked && props.isDirty && props.isValid;
	}, [props]);

	const canLock = useMemo(() => {
		// Can lock if: has lock permission, not deleted, not operating, form is valid (or not dirty)
		return props.permissions.lock && !isEntityDeleted && !isOperating && (!props.isDirty || props.isValid);
	}, [props, isEntityDeleted, isOperating]);

	const canDelete = useMemo(() => {
		// Can delete if: has delete permission, not deleted, not operating, not locked, form is valid (or not dirty)
		return props.permissions.delete && !isEntityDeleted && !isOperating && !isEntityLocked && (!props.isDirty || props.isValid);
	}, [props, isEntityDeleted, isEntityLocked, isOperating]);

	//
	// C. Compute read-only status

	const isReadOnly = useMemo(() => {
		// Read-only if no update permission OR deleted OR any operation in progress OR locked
		return !props.permissions.update || isEntityDeleted || isOperating || isEntityLocked;
	}, [props.permissions.update, isEntityDeleted, isEntityLocked, isOperating]);

	//
	// D. Return state

	return {
		canDelete: canDelete,
		canLock: canLock,
		canSave: canSave,
		canView: canView,
		isOperating: isOperating,
		isReadOnly: isReadOnly,
	};

	//
}
