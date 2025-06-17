import { useAgencyListContext } from '@/contexts/AgencyList.context';
import { MultiSelect } from '@tmlmobilidade/ui';

export function AgencyPermissionMultiselect({
	description,
	disabled,
	label,
	onChange,
	selected,
}: {
	description: string
	disabled?: boolean
	label: string
	onChange: (value: string[]) => void
	selected: string[]
}) {
	const agencyListContext = useAgencyListContext();

	const agencyOptions = agencyListContext.data.filtered.map(agency => ({
		label: `${agency._id} - ${agency.name}`,
		value: agency._id,
	}));

	return (
		<MultiSelect
			data={agencyOptions}
			description={description}
			disabled={disabled}
			label={label}
			onChange={onChange}
			selected={selected}
		/>
	);
}
