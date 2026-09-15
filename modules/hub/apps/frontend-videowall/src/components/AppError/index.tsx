'use client';

/* * */

import { IconTrafficCone } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function AppError() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [reloadInSeconds, setReloadInSeconds] = useState(60);

	//
	// B. Transform data

	useEffect(() => {
		const interval = setInterval(() => {
			if (reloadInSeconds === 1) window.location.reload();
			else setReloadInSeconds(prev => prev - 1);
		}, 1000);
		return () => clearInterval(interval);
	}, [reloadInSeconds]);

	//
	// C. Handle actions

	const handleGoToHomepage = () => {
		window.location.replace('/');
	};

	//
	// D. Render components

	return (
		<div className={styles.container}>
			<IconTrafficCone className={styles.icon} size={75} />
			<h1 className={styles.title}>{t('default:AppError.title')}</h1>
			<h2 className={styles.subtitle}>{t('default:AppError.subtitle')}</h2>
			<p className={styles.retryMessage}>{t('default:AppError.retry', '', { count: reloadInSeconds })}</p>
			<a onClick={handleGoToHomepage}>{t('default:AppError.goto_home')}</a>
		</div>
	);

	//
}
