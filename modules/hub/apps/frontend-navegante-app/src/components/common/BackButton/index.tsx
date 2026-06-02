'use client';

/* * */

import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	href?: string
	keepEnvironment?: boolean
}

/* * */

export function BackButton({ href }: Props) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { t } = useTranslation();

	//
	// C. Handle actions

	const handleBackButtonClick = () => {
		router.back();
	};

	//
	// D. Render components

	if (href) {
		return (
			<Link className={styles.container} href={href}>
				<IconArrowLeft size={14} />
				<span className={styles.label}>{t('default:common.BackButton.label')}</span>
			</Link>
		);
	}

	return (
		<div className={styles.container} onClick={handleBackButtonClick}>
			<IconArrowLeft size={14} />
			<span className={styles.label}>{t('default:common.BackButton.label')}</span>
		</div>
	);

	//
}
