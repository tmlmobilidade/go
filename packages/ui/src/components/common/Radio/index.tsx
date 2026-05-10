'use client';

import { Radio as MantineRadio, type RadioGroupProps as MantineRadioGroupProps, type RadioProps as MantineRadioProps } from '@mantine/core';

/* * */

export type RadioProps = MantineRadioProps;
export type RadioGroupProps = MantineRadioGroupProps;

/* * */

export function Radio(props: RadioProps) {
	return <MantineRadio {...props} />;
}

Radio.Group = function RadioGroup(props: MantineRadioGroupProps) {
	return <MantineRadio.Group {...props} />;
};
