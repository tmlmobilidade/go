'use client';

import { IconFileCheck } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function ValidationsListPlaceholder() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<IconFileCheck size={100} />
			<h2>{t('default:validations.list.Placeholder.title')}</h2>
			<ol>
				<li>
					<h3>{t('default:validations.list.Placeholder.steps.validate.title')}</h3>
					{t('default:validations.list.Placeholder.steps.validate.description_before')}
					<strong>{t('default:validations.list.Placeholder.steps.validate.button')}</strong>
					{t('default:validations.list.Placeholder.steps.validate.description_after')}
				</li>
				<li>
					<h3>{t('default:validations.list.Placeholder.steps.wait.title')}</h3>
					{t('default:validations.list.Placeholder.steps.wait.description_before')}
					<strong>{t('default:validations.list.Placeholder.steps.wait.valid')}</strong>
					{t('default:validations.list.Placeholder.steps.wait.description_middle')}
					<strong>{t('default:validations.list.Placeholder.steps.wait.errors')}</strong>
					{t('default:validations.list.Placeholder.steps.wait.description_after')}
				</li>
				<li>
					<h3>{t('default:validations.list.Placeholder.steps.convert.title')}</h3>
					{t('default:validations.list.Placeholder.steps.convert.description_before')}
					<strong>{t('default:validations.list.Placeholder.steps.convert.success')}</strong>
					{t('default:validations.list.Placeholder.steps.convert.description_middle')}
					<a href={PAGE_ROUTES.operation.PLANS_LIST}>{t('default:validations.list.Placeholder.steps.convert.link')}</a>
					{t('default:validations.list.Placeholder.steps.convert.description_after')}
				</li>
			</ol>
		</div>
	);
}
