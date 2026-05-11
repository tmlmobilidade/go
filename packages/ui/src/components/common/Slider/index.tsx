'use client';

import { Slider as MantineSlider, type SliderProps as MantineSliderProps } from '@mantine/core';

/* * */

type SliderProps = MantineSliderProps;

/* * */

export function Slider({ ...props }: SliderProps) {
	return <MantineSlider {...props} />;
}
