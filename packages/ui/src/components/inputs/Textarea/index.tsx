/* * */

import { Textarea as MantineTextarea, type TextareaProps as MantineTextareaProps } from '@mantine/core';

/* * */

interface TextareaProps extends MantineTextareaProps {
	/**
	 * The `key` prop is required to ensure correct re-mounting behavior.
	 * Use the `form.key('fieldName')` method to generate a unique key based on the form state.
	 */
	key?: string
};

/* * */

export function Textarea(props: TextareaProps) {
	return <MantineTextarea {...props} />;
}
