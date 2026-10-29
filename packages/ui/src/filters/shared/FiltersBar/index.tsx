'use client';

/* * */

import { type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import { Label } from '../../../components';
import { Toolbar } from '../../../layout';

/* * */

interface FiltersBarProps {
	label?: string
}

/* * */

export function FiltersBar({ children, label }: PropsWithChildren<FiltersBarProps>) {
	const { t } = useTranslation();

	return (
		<Toolbar>
			<Label size="sm" caps singleLine>{label ?? t('shared:filters.FiltersBar.label')}</Label>
			{children}
		</Toolbar>
	);
}
