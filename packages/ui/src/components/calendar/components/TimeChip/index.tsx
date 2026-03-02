import { IconX } from '@tabler/icons-react';
import { Tooltip } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface TimeChipProps {
	onRemove?: () => void
	time: string
	tooltip?: string
	variant?: 'default' | 'removed'
}

/* * */

export function TimeChip({ onRemove, time, tooltip, variant = 'default' }: TimeChipProps) {
	const chip = (
		<div className={`${styles.timeChip} ${variant === 'removed' ? styles.removed : ''}`}>
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

	if (tooltip) {
		return (
			<Tooltip label={tooltip} withArrow>
				{chip}
			</Tooltip>
		);
	}

	return chip;
}
