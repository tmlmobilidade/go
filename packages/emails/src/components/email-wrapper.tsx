/* * */

import { Body, Container, Head, Html, Img, Preview } from '@react-email/components';
import { getAppConfig } from '@go/lib';
import React from 'react';

import { Footer } from './footer.js';
import styles from './styles.js';

/* * */

export function EmailWrapper({ children, preview }: { children: React.ReactNode, preview: string }) {
	const image_path = getAppConfig('auth', 'frontend_url', 'production') + '/images/tml-logo.png';

	return (
		<Html>
			<Head />
			<Body style={styles.main}>
				<Preview>{preview}</Preview>
				<Container style={styles.container}>
					<Img alt="TML Logo" src={image_path} width="220px" />
					{children}
					<Footer />
				</Container>
			</Body>
		</Html>
	);
};

export default EmailWrapper;
