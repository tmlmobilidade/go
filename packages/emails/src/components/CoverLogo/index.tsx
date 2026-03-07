/* * */

import { GO_HOMEPAGE_URL } from '@/constants.js';
import { Img, Link } from '@react-email/components';

import styles from './styles.js';

/* * */

export function CoverLogo() {
	return (
		<Link href={GO_HOMEPAGE_URL} style={styles.link} target="_blank">
			<Img
				alt="SPG Logo"
				src="https://storage.carrismetropolitana.pt/static/test/go-header-left.png"
				style={styles.image}
			/>
			<Img
				alt="SPG Logo"
				src="https://storage.carrismetropolitana.pt/static/test/go-header-right.png"
				style={styles.image}
			/>
		</Link>
	);
};
