/* * */

import { type PropsWithChildren } from 'react';

import { Label } from '../../display';
import { Toolbar } from '../../layout/Toolbar';

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
