'use client';

import { IconChevronDown } from '@tabler/icons-react';
import { type RideAcceptance } from '@tmlmobilidade/go-types-operation';
import { Tag, Text } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../RideAcceptanceChecks/styles.module.css';

/* * */

interface RideAcceptanceCheckProps {
	check: RideAcceptance['analysis_summary'][string]
	open?: boolean
	title: string
}

const gradeVariants = { error: 'danger', fail: 'danger', pass: 'success', skip: 'muted' } as const;

/* * */

export function RideAcceptanceCheck({ check, children, open, title }: PropsWithChildren<RideAcceptanceCheckProps>) {
	const { t } = useTranslation();

	return (
		<details className={styles.check} open={open}>
			<summary className={`${styles.row} ${styles.summary}`}>
				<span className={styles.checkName}>
					<IconChevronDown className={styles.chevron} size={18} aria-hidden />
					{title}
				</span>
				<Tag label={t('default:rides.acceptance.RideAcceptanceCheck.required')} variant="primary" />
				<Tag label={t(`default:rides.acceptance.RideAcceptanceCheck.grades.${check.grade}`)} variant={gradeVariants[check.grade]} />
			</summary>
			<div className={styles.details}>
				{children}
				{check.reason && <code className={styles.reason}>{check.reason}</code>}
				{!children && !check.reason && <Text size="sm">{t('default:rides.acceptance.RideAcceptanceCheck.no_details')}</Text>}
			</div>
		</details>
	);
}
