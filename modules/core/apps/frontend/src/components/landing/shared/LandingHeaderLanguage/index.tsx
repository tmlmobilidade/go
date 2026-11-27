'use client';

import { IconCheck } from '@tabler/icons-react';
import { BottomSheet, enabledLocales, useLocaleContext } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LandingHeaderLanguageProps {
	onClose: () => void
	opened: boolean
}

/* * */

export function LandingHeaderLanguage({ onClose, opened }: LandingHeaderLanguageProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();
	const locale = useLocaleContext();

	//
	// B. Handle actions

	const handleSelect = (value: string) => {
		locale.actions.setLocale(value);
		onClose();
	};

	//
	// C. Render components

	return (
		<BottomSheet closeLabel={t('landing:shared.LandingHeaderLanguage.close')} onClose={onClose} opened={opened} title={t('landing:shared.LandingHeaderLanguage.title')}>
			<div className={styles.options}>
				{enabledLocales.map(item => (
					<button key={item._id} aria-pressed={locale.data.locale === item._id} className={styles.option} lang={item._id} onClick={() => handleSelect(item._id)} type="button">
						{item.name}
						{locale.data.locale === item._id && <IconCheck aria-hidden="true" size={20} />}
					</button>
				))}
			</div>
		</BottomSheet>
	);
}
