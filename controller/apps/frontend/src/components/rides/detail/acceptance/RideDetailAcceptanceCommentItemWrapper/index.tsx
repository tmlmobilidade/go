/* * */

import { Label, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

/* * */

interface RideDetailAcceptanceCommentItemWrapperProps {
	content: React.ReactNode | string
	created_at: number
	created_by: string
	icon: React.ReactNode
	iconTopMargin?: number
}

export function RideDetailAcceptanceCommentItemWrapper({ content, created_at, created_by, icon, iconTopMargin }: RideDetailAcceptanceCommentItemWrapperProps) {
	return (
		<div className={styles.item}>
			<div className={styles.itemWrapper}>
				<div className={styles.icon} style={{ marginTop: iconTopMargin ? `${iconTopMargin}px` : '0' }}>
					{icon}
				</div>
				<div className={styles.path} />
			</div>
			<div className={styles.content}>
				{typeof content === 'string' ? (
					<Section flexDirection="column" padding="none">
						<div className={styles.label}>{content}</div>
						<Label size="sm">{created_by} a {Dates.fromUnixTimestamp(created_at).toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt-PT')}</Label>
					</Section>
				) : (
					content
				)}
			</div>
		</div>
	);
}
