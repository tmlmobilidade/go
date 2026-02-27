/* * */

import { CoverLogo } from '@/components/CoverLogo/index.js';
import { Footer } from '@/components/Footer/index.js';
import { Body, Container, Font, Head, Html, Preview } from '@react-email/components';
import { type PropsWithChildren } from 'react';

import styles from './styles.js';

/* * */

interface WrapperProps {
	previewMessage: string
}

/* * */

export function Wrapper({ children, previewMessage }: PropsWithChildren<WrapperProps>) {
	return (
		<Html>
			<Head>
				<Font
					fallbackFontFamily="Verdana"
					fontFamily="Lato"
					fontStyle="normal"
					fontWeight={400}
					webFont={{ format: 'woff2', url: 'https://cdnjs.cloudflare.com/ajax/libs/lato-font/3.0.0/fonts/lato-normal/lato-normal.woff2' }}
				/>
				<Font
					fallbackFontFamily="Verdana"
					fontFamily="Lato"
					fontStyle="normal"
					fontWeight={600}
					webFont={{ format: 'woff2', url: 'https://cdnjs.cloudflare.com/ajax/libs/lato-font/3.0.0/fonts/lato-bold/lato-bold.woff2' }}
				/>
			</Head>
			<Body style={styles.body}>
				<Preview>{previewMessage}</Preview>
				<Container style={styles.container}>
					<CoverLogo />
					<Container style={styles.content}>
						{children}
					</Container>
					<Footer />
				</Container>
			</Body>
		</Html>
	);
};
