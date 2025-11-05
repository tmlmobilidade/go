/* * */

import { Textarea as MantineTextarea, type TextareaProps as MantineTextareaProps } from '@mantine/core';

/* * */

export type TextareaProps = MantineTextareaProps;

/* * */

export function Textarea(props: TextareaProps) {
	return <MantineTextarea {...props} />;
}
