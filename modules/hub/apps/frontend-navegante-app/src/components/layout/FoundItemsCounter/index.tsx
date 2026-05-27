/* * */

import styles from './styles.module.css';

/* * */

interface Props {
	text: string
}

/* * */

export function FoundItemsCounter({ text }: Props) {
	return (
		<p className={styles.text}>{text}</p>
	);
}
