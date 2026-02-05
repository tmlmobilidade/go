import { IconX } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface TimeChipProps {
	onRemove?: () => void
	time: string
}

/* * */

export function TimeChip({ onRemove, time }: TimeChipProps) {
	return (
		<div className={styles.timeChip}>
			{time}
			{onRemove && (
				<div
					aria-label={`Remover ${time}`}
					className={styles.deleteBtn}
					onClick={onRemove}
					role="button"
				>
					<IconX size={12} />
				</div>
			)}
		</div>
	);
}
