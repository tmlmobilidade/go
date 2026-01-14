'use client';

/* * */

import { IconCalendarCancel, IconCalendarCheck, IconEdit, IconTrash } from '@tabler/icons-react';
import { Button, Spacer, Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface PatternDetailRulesProps {
	onDelete?: () => void
	onEdit?: () => void
	ruleData: {
		isOffTime: boolean // true = remove / inactive, false = add / active
		name: string
		times: string[]
		travelTime?: string
	}
}

/* * */

export default function PatternDetailRules({ onDelete, onEdit, ruleData }: PatternDetailRulesProps) {
	const statusIcon = ruleData.isOffTime ? <IconCalendarCancel color="var(--color-status-danger-primary)" size={20} /> : <IconCalendarCheck color="var(--color-status-success-primary)" size={20} />;
	const statusColor = ruleData.isOffTime ? '#E53935' : '#43A047'; // red / green

	return (
		<div className={styles.container}>
			<div className={styles.ruleInfo}>
				{/* Header */}
				{statusIcon}

				<div className={styles.cardContent}>
					<Text size="lg" weight="bold">{ruleData.name}</Text>
					<div className={styles.cardBody}>
						<Text size="sm">{ruleData.times.join(', ')}</Text>
						{/* {ruleData.travelTime && <Text size="sm">Tempo de viagem: {ruleData.travelTime}</Text>} */}
					</div>
				</div>

			</div>

			<div className={styles.actions}>
				<Button label="Editar" onClick={onEdit} size="sm" style={{ textDecoration: 'underline' }} />
				<Button label="Remover" onClick={onDelete} size="sm" variant="danger" />
			</div>
		</div>
	);
}
