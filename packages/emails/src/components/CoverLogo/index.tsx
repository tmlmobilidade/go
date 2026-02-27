/* * */

import { GO_HOMEPAGE_URL } from '@/constants.js';
import { Img, Link } from '@react-email/components';

import styles from './styles.js';

/* * */

export function CoverLogo() {
	return (
		<Link href={GO_HOMEPAGE_URL} target="_blank">
			<Img
				alt="SPG Logo"
				src="https://spginecologia.pt/wp-content/mu-plugins/post_office/templates/imgs/spg-mail-header@2x.png"
				style={styles.image}
			/>
		</Link>
	);
};
