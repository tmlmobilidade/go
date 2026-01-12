'use client';

/* * */

import { IconFileCheck } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { useTranslation } from 'react-i18next';

import styles from './page.module.css';

/* * */

export default function Page() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<IconFileCheck size={100} />
			<h2>{t('plans:validations.Page.title')}</h2>
			<ol>
				<li>
					<h3>{t('plans:validations.Page.step_1')}</h3>
					<span dangerouslySetInnerHTML={{ __html: t('plans:validations.Page.step_1_description') }} />
				</li>
				<li>
					<h3>{t('plans:validations.Page.step_2')}</h3>
					<span dangerouslySetInnerHTML={{ __html: t('plans:validations.Page.step_2_description') }} />
				</li>
				<li>
					<h3>{t('plans:validations.Page.step_3')}</h3>
					<span dangerouslySetInnerHTML={{ __html: t('plans:validations.Page.step_3_description', { link: String(PAGE_ROUTES.plans.APPROVED_LIST) }) }} />
				</li>
			</ol>
		</div>
	);

	//
}
