'use client';

/* * */

import { AlertPublicDetailHeader } from '@/components/modules/alerts/detail/AlertPublicDetailHeader';
import { AlertPublicDetailLines } from '@/components/modules/alerts/detail/AlertPublicDetailLines';
import { AlertPublicDetailNotFound } from '@/components/modules/alerts/detail/AlertPublicDetailNotFound';
import { useAlertDetailPublicContext } from '@/contexts/AlertPublicDetail.context';
import { Description, Label, Section, Surface, Tag } from '@tmlmobilidade/ui';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function AlertPublicDetail() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const alertDetailPublicContext = useAlertDetailPublicContext();
	const activePeriodStart = alertDetailPublicContext.data.activePeriodStart;
	const foundAlert = alertDetailPublicContext.data.alert;
	const foundAlertImage = alertDetailPublicContext.data.image;
	const isNotFound = alertDetailPublicContext.flags.notFound;

	//
	// B. Render components

	if (isNotFound || !foundAlert) {
		return <AlertPublicDetailNotFound />;
	}

	return (
		<Surface>
			<Section gap="lg">
				<AlertPublicDetailHeader />
				<div className={styles.headCard}>
					<h1 className={styles.title}>{foundAlert.title}</h1>
					<div className={styles.metaRow}>
						<Tag label={t(`shared:alerts.causes.${foundAlert.cause}.title`)} variant="danger" />
						<Tag label={t(`shared:alerts.effects.${foundAlert.effect}.title`)} variant="warning" />
						<Description>Início: {activePeriodStart}</Description>
					</div>
					<AlertPublicDetailLines />
				</div>

				<div className={styles.descriptionCard}>
					<Label caps={true} size="sm">Descrição</Label>
					<Description>{foundAlert.description}</Description>
					{foundAlertImage?.url && (
						<Image alt={foundAlert.title} className={styles.image} height={300} src={foundAlertImage.url} width={400} />
					)}
				</div>
			</Section>
		</Surface>
	);

	//
}
