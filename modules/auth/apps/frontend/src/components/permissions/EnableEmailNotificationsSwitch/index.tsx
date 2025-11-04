import { Switch } from '@tmlmobilidade/ui';

export function EnableEmailNotificationsSwitch({
	checked,
	description,
	disabled,
	label,
	onChange,
}: {
	checked: boolean
	description: string
	disabled?: boolean
	label: string
	onChange: (value: boolean) => void
}) {
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.checked);
		return;
	};

	return (
		<Switch
			checked={checked}
			description={description}
			disabled={disabled}
			label={label}
			onChange={handleChange}
		/>
	);
}
