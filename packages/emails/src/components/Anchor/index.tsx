/* * */

import { Link } from '@react-email/components';

import styles from './styles.js';

/* * */

interface AnchorProps {
	href: string
	spaceAfter?: boolean
	spaceBefore?: boolean
	text: string
}

/* * */

export function Anchor({ href, spaceAfter, spaceBefore, text }: AnchorProps) {
	return (
		<>
			{spaceBefore && ' '}
			<Link href={href} style={styles.link}>
				{text}
			</Link>
			{spaceAfter && ' '}
		</>
	);
};
