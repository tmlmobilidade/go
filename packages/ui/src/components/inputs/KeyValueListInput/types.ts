/* * */

export interface KeyValuePair {
	key?: null | string
	value?: null | string
}

export interface KeyValueListInputProps {
	ariaLabel?: string
	onChange: (value: KeyValuePair[]) => void
	readOnly?: boolean
	value: KeyValuePair[]
	valueLabel?: string
}

export interface KeyValueListInputRowProps {
	ariaLabel?: string
	index: number
	onChange: (value: KeyValuePair) => void
	onRemove: () => void
	readOnly: boolean
	value: KeyValuePair
	valueLabel: string
}
