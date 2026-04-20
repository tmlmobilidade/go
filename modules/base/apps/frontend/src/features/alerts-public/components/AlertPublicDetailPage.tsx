'use client';

/* * */

import { useAlertDetailPublicContext } from '@/features/alerts-public/contexts/AlertPublicDetail.context';
import { IconChevronLeft } from '@tabler/icons-react';
import { Description, Label, Section, Surface, Tag, TagGroup } from '@tmlmobilidade/ui';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import styles from './AlertPublicDetailPage.module.css';

/* * */

function formatEnum(value: string) {
	return value.replaceAll('_', ' ').toLowerCase();
}

export function AlertPublicDetailPage() {
	const router = useRouter();
	const alertDetailPublicContext = useAlertDetailPublicContext();
	const activePeriodStart = alertDetailPublicContext.data.activePeriodStart;
	const foundAlert = alertDetailPublicContext.data.alert;
	const foundAlertImage = alertDetailPublicContext.data.image;
	const linesTags = alertDetailPublicContext.data.linesTags;
	const isNotFound = alertDetailPublicContext.flags.notFound;

	if (isNotFound || !foundAlert) {
		return (
			<Surface>
				<Section gap="lg">
					<button className={styles.backButton} onClick={() => window.history.back()} type="button">
						<IconChevronLeft size={14} />
						<span>Voltar</span>
					</button>
					<div className={styles.descriptionCard}>
						<Description>Alerta nao encontrado.</Description>
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
						<Tag label={formatEnum(foundAlert.cause)} variant="danger" />
						<Tag label={formatEnum(foundAlert.effect)} variant="warning" />
						<Description>Inicio: {activePeriodStart}</Description>
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
					<Label caps={true} size="sm">Descricao</Label>
					<Description>{foundAlert.description}</Description>
					{foundAlertImage?.url && (
						<Image alt={foundAlert.title} className={styles.image} height={300} src={foundAlertImage.url} width={400} />
					)}
				</div>
			</Section>
		</Surface>
	);
}
