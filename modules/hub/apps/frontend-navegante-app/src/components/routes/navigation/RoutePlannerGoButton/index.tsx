'use client';

import { IconArrowRight } from '@tabler/icons-react';
import { type MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	ariaLabel: string
	onClick: MouseEventHandler<HTMLButtonElement>
	size?: 'md' | 'sm'
}

/* * */

export function RoutePlannerGoButton({ ariaLabel, onClick, size = 'sm' }: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<button aria-label={ariaLabel} className={styles.button} data-size={size} onClick={onClick} type="button">
			{t('default:routes.RoutePlanner.results.start_route')}
			<IconArrowRight size={15} />
		</button>
	);

	//
}
