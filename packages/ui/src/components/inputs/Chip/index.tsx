'use client';

import { Chip as MantineChip, type ChipGroupProps as MantineChipGroupProps, type ChipProps as MantineChipProps } from '@mantine/core';

/* * */

export type ChipProps = MantineChipProps;
export type ChipGroupProps = MantineChipGroupProps;

/* * */

export function Chip(props: ChipProps) {
	return <MantineChip {...props} />;
}

Chip.Group = function ChipGroup(props: MantineChipGroupProps) {
	return <MantineChip.Group {...props} />;
};
