/* * */

import { PasswordInput as MantinePasswordInput, type PasswordInputProps as MantinePasswordInputProps } from '@mantine/core';
import { IconEye, IconEyeClosed } from '@tabler/icons-react';

/* * */

interface PasswordInputProps extends MantinePasswordInputProps {
	/**
	 * The `key` prop is required to ensure correct re-mounting behavior.
	 * Use the `form.key('fieldName')` method to generate a unique key based on the form state.
	 */
	key?: string
};

/**
 * Renders a password input field with visibility toggle icons.
 */
export function PasswordInput(props: PasswordInputProps) {
	return (
		<MantinePasswordInput
			visibilityToggleIcon={({ reveal }) => reveal ? <IconEye size={18} /> : <IconEyeClosed size={18} />}
			{...props}
		/>
	);
}
