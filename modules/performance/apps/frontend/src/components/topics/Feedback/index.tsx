/* * */

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { Skeleton } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

const SUMMARY_CARDS = [
	{ label: 'Volume', width: '56%' },
	{ label: 'Avaliação média', width: '42%' },
	{ label: 'Tempo de resposta', width: '48%' },
];

const CATEGORY_ROWS = ['Linha', 'Condutor', 'Veículo', 'Paragem'];

/* * */

export default function FeedbackTopic() {
	//

	//
	// A. Render components

	return (
		<div className={styles.container}>
			<section className={styles.summaryGrid}>
				{SUMMARY_CARDS.map(card => (
					<ContainerWrapper key={card.label} height={150}>
						<p className={styles.cardTitle}>{card.label}</p>
						<Skeleton height={36} width={card.width} />
						<Skeleton height={12} width="72%" />
					</ContainerWrapper>
				))}
			</section>

			<section className={styles.contentGrid}>
				<ContainerWrapper height={320}>
					<p className={styles.cardTitle} />
					<div className={styles.chartPlaceholder}>
						<Skeleton height="35%" width="12%" />
						<Skeleton height="58%" width="12%" />
						<Skeleton height="44%" width="12%" />
						<Skeleton height="72%" width="12%" />
						<Skeleton height="62%" width="12%" />
						<Skeleton height="82%" width="12%" />
					</div>
				</ContainerWrapper>

				<ContainerWrapper height={320}>
					<p className={styles.cardTitle}>Categorias</p>
					<div className={styles.listPlaceholder}>
						{CATEGORY_ROWS.map(row => (
							<div key={row} className={styles.listRow}>
								<span>{row}</span>
								<Skeleton height={10} width="54%" />
							</div>
						))}
					</div>
				</ContainerWrapper>
			</section>

			<ContainerWrapper>
				<p className={styles.cardTitle}>Linhas com mais feedbacks</p>
				<div className={styles.feedbackList}>
					{[0, 1, 2].map(item => (
						<div key={item} className={styles.feedbackRow}>
							<Skeleton height={14} width="26%" />
							<Skeleton height={12} width="88%" />
							<Skeleton height={12} width="64%" />
						</div>
					))}
				</div>
			</ContainerWrapper>
		</div>
	);
}

//
