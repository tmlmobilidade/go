'use client';

/* * */

import { useEnvironmentContext } from '@/contexts/Environment.context';
import { IconArrowLeft } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

interface Props {
	href?: string
	keepEnvironment?: boolean
}

/* * */

export function BackButton({ href, keepEnvironment = true }: Props) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const t = useTranslations('common.BackButton');
	const environmentContext = useEnvironmentContext();

	//
	// B. Transform data

	const normalizedHrefValue = useMemo(() => {
		// Return early if undefined
		if (!href) return;
		// Return only href if keepEnvironment is false
		if (!keepEnvironment) return href;
		// Request a normalized href that includes the current environment
		return environmentContext.actions.getNormalizedHref(href);
		//
	}, [href, keepEnvironment]);

	//
	// C. Handle actions

	const handleBackButtonClick = () => {
		router.back();
	};

	//
	// D. Render components

	if (normalizedHrefValue) {
		return (
			<Link className={styles.container} href={normalizedHrefValue}>
				<IconArrowLeft size={14} />
				<span className={styles.label}>{t('label')}</span>
			</Link>
		);
	}

	return (
		<div className={styles.container} onClick={handleBackButtonClick}>
			<IconArrowLeft size={14} />
			<span className={styles.label}>{t('label')}</span>
		</div>
	);

	//
}
