'use client';

/* * */

import { usePerformanceFilterHref } from '@/hooks/usePerformanceFilterHref';
import { Tooltip } from '@tmlmobilidade/ui';
import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LineDetailNavigationProps {
	activeItemId?: LineDetailNavigationItemId
	lineId: string
}

interface LineDetailNavigationItem {
	disabledTooltip?: string
	href?: string
	id: LineDetailNavigationItemId
	label: string
}

type LineDetailNavigationItemId = 'data' | 'demand' | 'feedback' | 'financial' | 'history' | 'overview' | 'patterns' | 'reliability' | 'service' | 'supply';

/* * */

export function LineDetailNavigation({ activeItemId = 'overview', lineId }: LineDetailNavigationProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const getFilterHref = usePerformanceFilterHref();
	const items = useMemo<LineDetailNavigationItem[]>(() => [
		{
			href: getFilterHref(`/network/lines/${encodeURIComponent(lineId)}`),
			id: 'overview',
			label: t('lineDetail.navigation.overview'),
		},
		{
			href: getFilterHref(`/network/lines/${encodeURIComponent(lineId)}/demand`),
			id: 'demand',
			label: t('lineDetail.navigation.demand'),
		},
		{
			href: getFilterHref(`/network/lines/${encodeURIComponent(lineId)}/planned-supply`),
			id: 'supply',
			label: t('lineDetail.navigation.supply'),
		},
		{ disabledTooltip: t('lineDetail.navigation.tooltips.service'), id: 'service', label: t('lineDetail.navigation.service') },
		{ disabledTooltip: t('lineDetail.navigation.tooltips.reliability'), id: 'reliability', label: t('lineDetail.navigation.reliability') },
		{ disabledTooltip: t('lineDetail.navigation.tooltips.patterns'), id: 'patterns', label: t('lineDetail.navigation.patterns') },
		{ disabledTooltip: t('lineDetail.navigation.tooltips.feedback'), id: 'feedback', label: t('lineDetail.navigation.feedback') },
		{ disabledTooltip: t('lineDetail.navigation.tooltips.financial'), id: 'financial', label: t('lineDetail.navigation.financial') },
		{ disabledTooltip: t('lineDetail.navigation.tooltips.history'), id: 'history', label: t('lineDetail.navigation.history') },
		{ disabledTooltip: t('lineDetail.navigation.tooltips.data'), id: 'data', label: t('lineDetail.navigation.data') },
	], [getFilterHref, lineId, t]);

	//
	// B. Render components

	return (
		<nav aria-label={t('lineDetail.navigation.ariaLabel')} className={styles.root}>
			{items.map(item => item.href ? (
				<Link
					key={item.id}
					aria-current={item.id === activeItemId ? 'page' : undefined}
					className={styles.item}
					data-active={item.id === activeItemId}
					href={item.href}
				>
					{item.label}
				</Link>
			) : (
				<Tooltip key={item.id} label={item.disabledTooltip} openDelay={300} withArrow>
					<span aria-disabled="true" className={styles.item} data-disabled="true">{item.label}</span>
				</Tooltip>
			))}
		</nav>
	);

	//
}
