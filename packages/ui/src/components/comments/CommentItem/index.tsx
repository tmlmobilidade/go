/* * */

import { Label } from '@/components/display';
import { Section } from '@/components/layout/Section';
import { Dates } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

/* * */

export interface CommentItemProps {
	content: React.ReactNode | string
	created_at: number
	created_by: string
	icon: React.ReactNode
	iconTopMargin?: number
	reverse?: boolean
}

export function CommentItem({ content, created_at, created_by, icon, iconTopMargin, reverse }: CommentItemProps) {
	return (
		<div className={styles.item} data-reverse={reverse}>
			<div className={styles.itemWrapper}>
				<div className={styles.icon} style={{ marginTop: iconTopMargin && `${iconTopMargin}px` }}>
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
