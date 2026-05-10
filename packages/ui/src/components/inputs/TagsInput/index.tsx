'use client';

import { TagsInput as MantineTagsInput, type TagsInputProps as MantineTagsInputProps } from '@mantine/core';

/* * */

type TagsInputProps = MantineTagsInputProps;

/**
 * Renders a TagsInput component with customized default props.
 */
export function TagsInput({ ...props }: TagsInputProps) {
	return <MantineTagsInput {...props} />;
}
