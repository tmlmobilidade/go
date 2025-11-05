/* * */

import { Label } from '@/components/display/Label';
import { Toolbar } from '@/components/layout/Toolbar';
import { type PropsWithChildren } from 'react';

/* * */

interface FiltersBarProps {
	label?: string
}

/* * */

export function FiltersBar({ children, label = 'Filtrar por' }: PropsWithChildren<FiltersBarProps>) {
	return (
		<Toolbar>
			<Label size="sm" caps singleLine>{label}</Label>
			{children}
		</Toolbar>
	);
}
