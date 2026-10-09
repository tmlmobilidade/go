'use client';

import { useClipboard } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface CopyBadgeProps {
	label?: number | string
	size?: 'lg' | 'md'
	value: number | string
	withBorder?: boolean
}

/* * */

export function CopyBadge({ label, size = 'md', value, withBorder }: CopyBadgeProps) {
	//

	//
	// A. Setup variables

	const clipboard = useClipboard({ timeout: 600 });
	const { t } = useTranslation();

	//
	// B. Handle actions

	const handleCopy = () => {
		clipboard.copy(String(value));
	};

	//
	// C. Render components

	const visibleLabel = clipboard.copied ? t('default:common.CopyBadge.copied') : label ? label : value;

	return (
		<button
			className={styles.container}
			data-size={size}
			data-with-border={withBorder}
			onClick={handleCopy}
			type="button"
			aria-label={clipboard.copied
				? t('default:common.CopyBadge.copied')
				: t('default:common.CopyBadge.copy', '', { value: visibleLabel })}
		>
			{visibleLabel}
		</button>
	);
}
