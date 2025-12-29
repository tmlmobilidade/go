/* * */

/**
 * Use this interface to type the state of detail contexts.
 * It provides an actions section, with a save, lock and delete method
 * and a flags section, with error, isSaving and loading flags.
 */
export interface DetailContextStateTemplate {
	actions: {
		delete?: () => void
		lock?: () => void
		save: () => void
	}
	flags: {
		canDelete?: boolean
		canLock?: boolean
		canSave?: boolean
		error: Error | undefined
		isDeleting?: boolean
		isLoading: boolean
		isLocking?: boolean
		isReadOnly?: boolean
		isSaving?: boolean
	}
}
