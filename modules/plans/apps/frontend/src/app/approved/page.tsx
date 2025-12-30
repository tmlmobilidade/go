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

	const { t } = useTranslation('plans', { keyPrefix: 'approved.page' });

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<IconFileCertificate size={100} />
			<h2>{t('title')}</h2>
			<ol>
				<li>
					<h3>{t('step1')}</h3>
					<span dangerouslySetInnerHTML={{
						__html: t('step1Description', { link: PAGE_ROUTES.plans.VALIDATIONS_LIST }),
					}}
					/>
				</li>
				<li>
					<h3>{t('step2')}</h3>
					<span dangerouslySetInnerHTML={{ __html: t('step2Description') }} />
				</li>
				<li>
					<h3>{t('step3')}</h3>
					<span dangerouslySetInnerHTML={{ __html: t('step3Description') }} />
				</li>
			</ol>
		</div>
	);

	//
}
