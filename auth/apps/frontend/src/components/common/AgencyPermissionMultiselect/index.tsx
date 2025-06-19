import { useAgencyListContext } from '@/contexts/AgencyList.context';
import { ALLOW_ALL_FLAG } from '@tmlmobilidade/lib';
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

	agencyOptions.unshift({
		label: 'Todas as agências',
		value: ALLOW_ALL_FLAG,
	});

	const handleChange = (value: string[]) => {
		if (selected.includes(ALLOW_ALL_FLAG)) {
			const filteredValue = value.filter(v => v !== ALLOW_ALL_FLAG);
			onChange(filteredValue);
			return;
		}

		if (value.includes(ALLOW_ALL_FLAG)) {
			onChange([ALLOW_ALL_FLAG]);
			return;
		}

		onChange(value);
	};

	return (
		<MultiSelect
			data={agencyOptions}
			description={description}
			disabled={disabled}
			label={label}
			onChange={handleChange}
			selected={selected}
		/>
	);
}
