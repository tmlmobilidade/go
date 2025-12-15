/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { Combobox } from '@tmlmobilidade/ui';

/* * */

export function AgencySelect({
	label,
	readOnly,
	required,
	...props
}: {
	label: string
	readOnly?: boolean
	required?: boolean
}) {
	const agencyListContext = useAgenciesContext();

	const agencyOptions = agencyListContext.data.raw.map(agency => ({
		label: `${agency._id} - ${agency.name}`,
		value: agency._id,
	}));

	return (
		<Combobox
			data={agencyOptions}
			disabled={readOnly}
			label={label}
			fullWidth
			{...props}
		/>
	);
}
