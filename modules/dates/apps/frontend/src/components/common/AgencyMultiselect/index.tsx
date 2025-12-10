/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { MultiSelect } from '@tmlmobilidade/ui';

/* * */

export function AgencyMultiselect({
	description,
	label,
	onChange,
	readOnly,
	selected,
}: {
	description?: string
	label: string
	onChange: (value: string[]) => void
	readOnly?: boolean
	selected: string[]
}) {
	const agencyListContext = useAgenciesContext();

	const agencyOptions = agencyListContext.data.raw.map(agency => ({
		label: `${agency._id} - ${agency.name}`,
		value: agency._id,
	}));

	return (
		<MultiSelect
			data={agencyOptions}
			description={description}
			disabled={readOnly}
			label={label}
			onChange={onChange}
			selected={selected}
		/>
	);
}
