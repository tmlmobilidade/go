/* * */

import { GO_HOMEPAGE_URL } from '@/constants.js';
import { Column, Img, Link, Row } from '@react-email/components';

import styles from './styles.js';

/* * */

export function CoverLogo() {
	return (
		<Row style={styles.container}>
			<Column>
				<Link href={GO_HOMEPAGE_URL} target="_blank">
					<Img
						alt="GO Logo"
						height={40}
						src="https://storage.carrismetropolitana.pt/static/test/go-header-left.png"
						width={88}
					/>
				</Link>
			</Column>
			<Column align="right">
				<Link href={GO_HOMEPAGE_URL} target="_blank">
					<Img
						alt="TML Logo"
						height={40}
						src="https://storage.carrismetropolitana.pt/static/test/go-header-right.png"
						width={60}
					/>
				</Link>
			</Column>
		</Row>
	);
};
