/* * */

import { Widget } from '@/components/layout/Widget';
import { DemandByAgencyByDay } from '@/components/visualizations/DemandByAgencyByDay';
import { RealtimeDelays } from '@/components/visualizations/RealtimeDelays';
import { RealtimeDemand } from '@/components/visualizations/RealtimeDemand';
import { RecordDemand } from '@/components/visualizations/RecordDemand';
import { ServiceCompliance } from '@/components/visualizations/ServiceCompliance';
import { EXPLORER_TOPICS } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { Divider, Grid, Tooltip, useMeContext } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { VisualizationContainer } from '../VisualizationContainer';

export default function Home() {
	//

	// A. Setup variables

	const me = useMeContext();
	const userName = me.data.user.first_name;

	const homeContext = useHomeContext();
	const selectedOperator = homeContext.data.selected_operator;

	// TODO: Use Operators List and calculate status
	const operators = [
		{ key: 'all', label: 'Toda a CM', systemStatus: 'positive' },
		{ key: '41', label: 'Área 1', systemStatus: 'positive' },
		{ key: '42', label: 'Área 2', systemStatus: 'positive' },
		{ key: '43', label: 'Área 3', systemStatus: 'warning' },
		{ key: '44', label: 'Área 4', systemStatus: 'positive' },
	];

	//
	// B. Handle actions

	// C. Render components

	return (
		<div className={styles.container}>

			<div className={styles.topContainer}>
				<div className={styles.headerContainer}>
					<h1 className={styles.title}>🚀 Olá {userName},</h1>
					<p className={styles.subtitle}>Hoje a operação está <Tooltip label="Índice calculado com base na conformidade de serviço e comparando a procura hoje com a semana passada"><span style={{ color: 'var(--color-status-success-primary)', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>estável</span></Tooltip> (🔹 +3%) face à semana anterior</p>

					<div className={styles.operatorsContainer}>
						{operators.map(({ key, label, systemStatus }) => (
							<div key={key} className={`${styles.operator} ${selectedOperator !== key ? styles.mutedOperator : ''}`} onClick={() => homeContext.actions.setSelectedOperator(key)}>
								<span className={`${styles.statusCircle} ${systemStatus === 'positive' ? styles.statusPositive : styles.statusWarning}`} />
								{label}
								{/* <Badge className={selectedOperator !== key ? styles.mutedOperator : ''} onClick={() => homeContext.actions.setSelectedOperator(key)} variant={selectedOperator === key ? 'secondary' : 'active'}>
									{label}
								</Badge> */}
							</div>
						))}
					</div>
				</div>

				<Widget />
			</div>

			<Grid columns="a" gap="lg">
				<Grid columns="ab" gap="lg">
					<Grid columns="ab" gap="lg">
						<RealtimeDemand />
						<RealtimeDelays />
						<div style={{ gridColumn: '1 / -1' }}>
							<RecordDemand />
						</div>
					</Grid>

					<DemandByAgencyByDay />
				</Grid>

				<Grid columns="a" gap="lg">
					<ServiceCompliance />
				</Grid>
			</Grid>

			<Divider />

			<Grid columns="abcd" gap="lg">
				{EXPLORER_TOPICS.map(topic => (
					<VisualizationContainer key={topic.key}>
						<div className={styles.topicCard}>
							{topic.icon && <topic.icon />}
							<p className={styles.topicCardTitle}>{topic.label}</p>
						</div>
					</VisualizationContainer>
				))}
			</Grid>
		</div>
	);
}

//
