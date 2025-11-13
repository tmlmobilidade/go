/* * */

import { PasswordInput as MantinePasswordInput, type PasswordInputProps as MantinePasswordInputProps } from '@mantine/core';
import { IconEye, IconEyeClosed } from '@tabler/icons-react';

/* * */

export function PasswordInput(props: MantinePasswordInputProps) {
	return (
		<MantinePasswordInput
			visibilityToggleIcon={({ reveal }) => reveal ? <IconEye size={18} /> : <IconEyeClosed size={18} />}
			{...props}
		/>
	);
}
