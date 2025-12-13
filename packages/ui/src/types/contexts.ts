/* * */

/**
 * Use this interface to type the state of detail contexts.
 * It provides an actions section, with a save, lock and delete method
 * and a flags section, with error, isSaving and loading flags.
 */
export interface DetailContextStateTemplate {
	actions: {
		delete: () => void
		lock: () => void
		save: () => void
	}
	flags: {
		error: Error | undefined
		loading: boolean
		locking: boolean
		read_only: boolean
		saving: boolean
	}
}
