'use client';

/* * */

import { PillsInput as MantinePillsInput, type PillsInputProps as MantinePillsInputProps } from '@mantine/core';

/* * */

type PillsInputProps = MantinePillsInputProps;

/**
 * Renders a PillsInput component with customized default props.
 */
export function PillsInput({ ...props }: PillsInputProps) {
	return <MantinePillsInput {...props} />;
}
