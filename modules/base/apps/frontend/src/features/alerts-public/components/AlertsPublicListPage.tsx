'use client';

/* * */

import type { Alert } from '@tmlmobilidade/types';

import { useAlertsPublicListContext } from '@/features/alerts-public/contexts/AlertsPublicList.context';
import { getAlertCardSeverityLevel } from '@/features/alerts-public/lib/alert-severity';
import { Dates } from '@tmlmobilidade/dates';
import { AlertCauseIcons, AlertEffectIcons, FiltersBar, FilterTypeDateRange, FilterTypeList, keepUrlParams, Label, SearchInput, Section, Surface, Switch, Toolbar } from '@tmlmobilidade/ui';
import Link from 'next/link';
import { useMemo } from 'react';

import styles from './AlertsPublicListPage.module.css';

/* * */

export function AlertsPublicListPage() {
	const alertsPublicListContext = useAlertsPublicListContext();
	const { filters } = alertsPublicListContext;
	const todayDateKey = useMemo(() => Dates.now('Europe/Lisbon').startOf('day').toFormat('yyyyMMdd'), []);
	const tomorrowDateKey = useMemo(() => Dates.now('Europe/Lisbon').plus({ days: 1 }).startOf('day').toFormat('yyyyMMdd'), []);
	const yesterdayDateKey = useMemo(() => Dates.now('Europe/Lisbon').minus({ days: 1 }).startOf('day').toFormat('yyyyMMdd'), []);

	const groupedAlerts = useMemo(() => {
		const alertsMap = new Map<number, Alert[]>();
		for (const alert of alertsPublicListContext.data.filtered) {
			const dayTimestamp = Dates.fromUnixTimestamp(alert.active_period_start_date).setZone('Europe/Lisbon', 'offset_only').startOf('day').unix_timestamp;
			const currentGroup = alertsMap.get(dayTimestamp) ?? [];
			currentGroup.push(alert);
			alertsMap.set(dayTimestamp, currentGroup);
		}
		return [...alertsMap.entries()].sort((a, b) => b[0] - a[0]).map(([dayTimestamp, alerts]) => ({ alerts, dayTimestamp }));
	}, [alertsPublicListContext.data.filtered]);

	const getGroupDateLabel = (dayTimestamp: number) => {
		const dayDate = Dates.fromUnixTimestamp(dayTimestamp).setZone('Europe/Lisbon', 'offset_only');
		const dateLabel = dayDate.toFormat('d LLLL yyyy', { locale: 'pt' });
		const dayDateKey = dayDate.toFormat('yyyyMMdd');
		if (dayDateKey === todayDateKey) return `A partir de hoje, ${dateLabel}`;
		if (dayDateKey === tomorrowDateKey) return `A partir de amanha, ${dateLabel}`;
		if (dayDateKey === yesterdayDateKey) return `Desde ontem, ${dateLabel}`;
		if (dayDateKey < todayDateKey) return `Desde ${dateLabel}`;
		return `A partir de ${dateLabel}`;
	};

	return (
		<>
			<Toolbar>
				<Label size="lg" caps singleLine>Alertas publicos</Label>
			</Toolbar>

			<div className={styles.stickyFilterBar}>
				<FiltersBar>
					<FilterTypeDateRange
						active={true}
						endDate={filters.period_until}
						label="Periodo"
						onEndDateChange={filters.setPeriodUntil}
						onStartDateChange={filters.setPeriodSince}
						startDate={filters.period_since}
					/>
					<FilterTypeList active={filters.agency.isActive} disabled={!filters.agency.options.length} label="Operador" onChange={filters.agency.set} options={filters.agency.options} withToggleAll />
					<FilterTypeList active={filters.line.isActive} disabled={!filters.line.options.length} label="Linha" onChange={filters.line.set} options={filters.line.options} withToggleAll />
					<FilterTypeList active={filters.stop.isActive} disabled={!filters.stop.options.length} label="Paragem" onChange={filters.stop.set} options={filters.stop.options} withToggleAll />
					<FilterTypeList active={filters.cause.isActive} label="Causa" onChange={filters.cause.set} options={filters.cause.options} withToggleAll />
					<FilterTypeList active={filters.effect.isActive} label="Efeito" onChange={filters.effect.set} options={filters.effect.options} withToggleAll />
					<Switch checked={filters.include_past_alerts} label="Alertas passados" onChange={e => filters.setIncludePastAlerts(e.currentTarget.checked)} />
					<SearchInput onChange={filters.search.set} value={filters.search.value} />
				</FiltersBar>
			</div>

			<Surface>
				<Section>
					<div className={styles.groups}>
						{groupedAlerts.map(group => (
							<section key={group.dayTimestamp} className={styles.group}>
								<header className={styles.groupHeader}>
									<p className={styles.groupLabel}>{group.alerts.length > 1 ? 'Alertas ativos' : 'Alerta ativo'}</p>
									<p className={styles.groupDate}>{getGroupDateLabel(group.dayTimestamp)}</p>
								</header>
								<div className={styles.groupCards}>
									{group.alerts.map(alert => (
										<Link key={alert._id} className={styles.cardLink} href={keepUrlParams(`/alerts/${alert._id}`)}>
											<AlertPublicCard alert={alert} />
										</Link>
									))}
								</div>
							</section>
						))}
					</div>
				</Section>
			</Surface>
		</>
	);
}

function AlertPublicCard({ alert }: { alert: Alert }) {
	const severity = getAlertCardSeverityLevel(alert.cause, alert.effect);
	const startDate = Dates.fromUnixTimestamp(alert.active_period_start_date).setZone('Europe/Lisbon', 'offset_only').toFormat('dd/MM/yyyy HH:mm');
	const endDate = alert.active_period_end_date
		? Dates.fromUnixTimestamp(alert.active_period_end_date).setZone('Europe/Lisbon', 'offset_only').toFormat('dd/MM/yyyy HH:mm')
		: 'Sem data fim';
	const icon = AlertEffectIcons[alert.effect] ?? AlertCauseIcons[alert.cause];

	return (
		<article className={styles.card} data-severity={severity}>
			<div className={styles.header}>
				<span aria-hidden="true" className={styles.iconWrap} data-severity={severity}>
					<span className={styles.cardIcon}>{icon}</span>
				</span>
				<div className={styles.main}>
					<h3 className={styles.title}>{alert.title}</h3>
					<p className={styles.description}>{alert.description}</p>
				</div>
			</div>
			<div className={styles.dates}>
				<div className={styles.dateRow}>
					<span className={styles.dateLabel}>Inicio</span>
					<span className={styles.dateValue}>{startDate}</span>
				</div>
				<div className={styles.dateRow}>
					<span className={styles.dateLabel}>Fim</span>
					<span className={styles.dateValue}>{endDate}</span>
				</div>
			</div>
		</article>
	);
}
