/* * */

import { IconBuilding, IconRoute } from '@tabler/icons-react';
import { type PerformanceNetworkLineDetail } from '@tmlmobilidade/go-types-performance';
import { Tag } from '@tmlmobilidade/ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LineDetailHeaderProps {
	line: PerformanceNetworkLineDetail
}

/* * */

export function LineDetailHeader({ line }: LineDetailHeaderProps) {
	const { t } = useTranslation('default');

	return (
		<>
			<nav aria-label={t('lineDetail.breadcrumb.ariaLabel')} className={styles.breadcrumb}>
				<Link href="/network">{t('navigation.network.label')}</Link>
				<span>/</span>
				<Link href="/network/lines">{t('navigation.network.lines.title')}</Link>
				<span>/</span>
				<strong>{line.code}</strong>
			</nav>

			<header className={styles.header}>
				<div className={styles.identity}>
					<Tag label={line.code} variant="secondary" />
					<div>
						<h1>{line.name}</h1>
						<p>{line.agency_name}</p>
					</div>
				</div>

				<div className={styles.metadata}>
					<span><IconBuilding aria-hidden="true" size={18} />{line.agency_short_name}</span>
					<span><IconRoute aria-hidden="true" size={18} />{t('lineDetail.header.patternCount', { count: line.pattern_count })}</span>
				</div>
			</header>
		</>
	);
}
