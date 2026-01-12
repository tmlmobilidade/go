'use client';

import { IconFileCertificate } from '@tabler/icons-react';
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
			<IconFileCertificate size={100} />
			<h2>{t('plans:approved.Page.title')}</h2>
			<ol>
				<li>
					<h3>{t('plans:approved.Page.step_1')}</h3>
					<span dangerouslySetInnerHTML={{ __html: t('plans:approved.Page.step_1_description', { link: PAGE_ROUTES.plans.VALIDATIONS_LIST }) }} />
				</li>
				<li>
					<h3>{t('plans:approved.Page.step_2')}</h3>
					<span dangerouslySetInnerHTML={{ __html: t('plans:approved.Page.step_2_description') }} />
				</li>
				<li>
					<h3>{t('plans:approved.Page.step_3')}</h3>
					<span dangerouslySetInnerHTML={{ __html: t('plans:approved.Page.step_3_description') }} />
				</li>
			</ol>
		</div>
	);

	//
}
