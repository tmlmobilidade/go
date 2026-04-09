'use client';

/* * */

import { useAlertDetailPublicContext } from '@/contexts/AlertPublicDetail.context';
import { useLinesContext } from '@/contexts/Lines.context';
import { getAvailableLines } from '@/lib/alert-utils';
import { IconChevronLeft } from '@tabler/icons-react';
import { Dates } from '@tmlmobilidade/dates';
import { Description, Label, LoadingOverlay, Section, Surface, Tag, TagGroup } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function AlertPublicDetail() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const linesContext = useLinesContext();
	const alertDetailPublicContext = useAlertDetailPublicContext();
	const foundAlert = alertDetailPublicContext.data.alert;
	const isLoading = alertDetailPublicContext.flags.loading;
	const isNotFound = alertDetailPublicContext.flags.notFound;
	//
	// B. Transform data

	const activePeriodStart = useMemo(() => {
		if (!foundAlert) return '-';
		return Dates.fromUnixTimestamp(foundAlert.active_period_start_date).setZone('Europe/Lisbon', 'offset_only').toFormat('d LLLL yyyy', { locale: 'pt' });
	}, [foundAlert]);

	const linesTags = useMemo(() => {
		if (!foundAlert) return [];
		return getAvailableLines(foundAlert)
			.map(lineId => linesContext.actions.getLineDataById(lineId))
			.map(lineData => ({ label: lineData.short_name, variant: 'danger' as const }));
	}, [foundAlert, linesContext]);

	//
	// C. Render components

	if (isLoading) {
		return <LoadingOverlay />;
	}

	if (isNotFound || !foundAlert) {
		return (
			<Surface>
				<Section gap="lg">
					<button className={styles.backButton} onClick={() => window.history.back()} type="button">
						<IconChevronLeft size={14} />
						<span>Voltar</span>
					</button>
					<div className={styles.descriptionCard}>
						<Description>Alerta não encontrado.</Description>
					</div>
				</Section>
			</Surface>
		);
	}

	return (
		<Surface>
			<Section gap="lg">
				<button className={styles.backButton} onClick={() => window.history.back()} type="button">
					<IconChevronLeft size={14} />
					<span>Voltar</span>
				</button>

				<div className={styles.headCard}>
					<h1 className={styles.title}>{foundAlert.title}</h1>
					<div className={styles.metaRow}>
						<Tag label={t(`shared:alerts.causes.${foundAlert.cause}.title`)} variant="danger" />
						<Tag label={t(`shared:alerts.effects.${foundAlert.effect}.title`)} variant="warning" />
						<Description>Início: {activePeriodStart}</Description>
					</div>
					{linesTags.length > 0 && (
						<div className={styles.tagsRow}>
							<TagGroup limit={20} tags={linesTags} />
						</div>
					)}
				</div>

				<div className={styles.descriptionCard}>
					<Label caps={true} size="sm">Descrição</Label>
					<Description>{foundAlert.description}</Description>
				</div>
			</Section>
		</Surface>
	);
}
