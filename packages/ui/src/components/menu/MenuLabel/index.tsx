'use client';

import { Menu } from '@mantine/core';
import { type ReactNode } from 'react';

/* * */

interface MenuLabelProps {
	children: ReactNode
}

/* * */

export function MenuLabel({ children }: MenuLabelProps) {
	return <Menu.Label>{children}</Menu.Label>;
}
