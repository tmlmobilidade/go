'use client';

import { Tooltip as MantineTooltip, TooltipProps as MantineTooltipProps } from '@mantine/core';

/* * */

export type TooltipProps = MantineTooltipProps;

/**
 * Renders a Tooltip component.
 */
export function Tooltip(props: TooltipProps) {
	return <MantineTooltip {...props} />;
};
