'use client';

import { LoadingSection } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface BusyStatusProps {
	fullHeight?: boolean
}

/* * */

export function BusyStatus({ fullHeight = false }: BusyStatusProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<div
			aria-busy="true"
			aria-label={t('default:common.Loading.label')}
			className={fullHeight ? styles.fullHeight : undefined}
			role="status"
		>
			<LoadingSection fullHeight={fullHeight} />
		</div>
	);

	//
}
