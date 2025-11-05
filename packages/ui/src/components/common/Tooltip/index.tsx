'use client';

/* * */

import { Tooltip as MantineTooltip, TooltipProps as MantineTooltipProps } from '@mantine/core';

import styles from './styles.module.css';

export type TooltipProps = MantineTooltipProps;

export default function Tooltip({ children, ...props }: TooltipProps) {
	return <MantineTooltip classNames={{ ...styles, ...props.classNames }} {...props}>{children}</MantineTooltip>;
};
