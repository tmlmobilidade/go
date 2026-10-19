'use client';

import { NoDataLabel } from '@/components/common/display/NoDataLabel';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface DetailUnavailableProps {
	reason: 'error' | 'not-found'
}

/* * */

export function DetailUnavailable({ reason }: DetailUnavailableProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const alertRef = useRef<HTMLDivElement>(null);
	const isError = reason === 'error';

	//
	// B. Setup effects

	useEffect(() => {
		if (!isError) return;
		alertRef.current?.focus();
	}, [isError]);

	//
	// C. Render components

	return (
		<div
			ref={alertRef}
			className={isError ? styles.alert : undefined}
			role={isError ? 'alert' : 'status'}
			tabIndex={isError ? -1 : undefined}
		>
			<NoDataLabel
				text={t(`default:common.DetailUnavailable.${isError ? 'error' : 'not_found'}`)}
				withMinHeight
			/>
		</div>
	);

	//
}
