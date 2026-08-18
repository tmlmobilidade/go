/* * */

export interface OperatorSelectItem {
	code?: string
	id: string
	name?: string
	public_name?: string
	short_name?: string
}

/* * */

export interface OperatorSelectGroup {
	codes?: readonly string[]
	id: string
	ids?: readonly string[]
	label: string
	public_names?: readonly string[]
	short_names?: readonly string[]
}

/* * */

export interface OperatorSelectTreeGroup {
	id: string
	label: string
	members: OperatorSelectItem[]
}

/* * */

export interface OperatorSelectTree {
	groups: OperatorSelectTreeGroup[]
	ungrouped: OperatorSelectItem[]
}
