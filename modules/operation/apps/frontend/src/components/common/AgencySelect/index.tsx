/* * */

import { Select, useAgenciesContext } from '@tmlmobilidade/ui';

/* * */

export function AgencySelect({ description, label, onChange, readOnly, selected }: { description?: string, label: string, onChange: (value: string) => void, readOnly?: boolean, selected: string }) {
	const agencyListContext = useAgenciesContext();

	const agencyOptions = agencyListContext.data.as_options;

	return (
		<Select
			data={agencyOptions}
			description={description}
			disabled={readOnly}
			label={label}
			onChange={onChange}
			value={selected}
			w="100%"
		/>
	);
}
