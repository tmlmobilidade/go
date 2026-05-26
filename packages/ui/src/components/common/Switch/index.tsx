'use client';

import { Switch as MantineSwitch, type SwitchProps as MantineSwitchProps } from '@mantine/core';

/* * */

type SwitchProps = MantineSwitchProps;

/* * */

export function Switch({ ...props }: SwitchProps) {
	return <MantineSwitch {...props} />;
}
