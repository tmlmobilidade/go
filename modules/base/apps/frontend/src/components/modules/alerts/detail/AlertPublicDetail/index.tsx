'use client';

/* * */

import { useAlertDetailPublicContext } from '@/contexts/AlertPublicDetail.context';
import { IconChevronLeft } from '@tabler/icons-react';
import { Description, Label, Section, Surface, Tag, TagGroup } from '@tmlmobilidade/ui';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function AlertPublicDetail() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const router = useRouter();

	const alertDetailPublicContext = useAlertDetailPublicContext();
	const activePeriodStart = alertDetailPublicContext.data.activePeriodStart;
	const foundAlert = alertDetailPublicContext.data.alert;
	const foundAlertImage = alertDetailPublicContext.data.image;
	const linesTags = alertDetailPublicContext.data.linesTags;
	const isNotFound = alertDetailPublicContext.flags.notFound;

	//
	// B. Render components

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
							<TagGroup
								limit={25}
								tags={linesTags.map(line => ({
									label: line.label,
									onClick: () => router.push(`https://carrismetropolitana.pt/lines/${line.value}`),
									variant: 'danger',
								}))}
							/>
						</div>
					)}
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
