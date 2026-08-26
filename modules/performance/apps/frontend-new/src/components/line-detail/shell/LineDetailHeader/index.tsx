/* * */

import { usePerformanceFilterHref } from '@/hooks/usePerformanceFilterHref';
import { IconBuilding, IconRoute } from '@tabler/icons-react';
import { type PerformanceNetworkLineDetail } from '@tmlmobilidade/go-types-performance';
import { Breadcrumbs, Tag } from '@tmlmobilidade/ui';
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
	const getFilterHref = usePerformanceFilterHref();

	return (
		<>
			<nav aria-label={t('lineDetail.breadcrumb.ariaLabel')}>
				<Breadcrumbs className={styles.breadcrumb} separator="/" separatorMargin="xs">
					<Link href={getFilterHref('/network')}>{t('navigation.network.label')}</Link>
					<Link href={getFilterHref('/network/lines')}>{t('navigation.network.lines.title')}</Link>
					<strong>{line.code}</strong>
				</Breadcrumbs>
			</nav>

			<header className={styles.header}>
				<div className={styles.identity}>
					<Tag label={line.code} variant="secondary" />
					<div>
						<h1>{line.name}</h1>
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
