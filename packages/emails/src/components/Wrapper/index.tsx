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
					fontFamily="Work Sans"
					fontStyle="normal"
					fontWeight={400}
					webFont={{ format: 'woff2', url: 'https://go.tmlmobilidade.pt/auth/global/fonts/work-sans-regular.woff2' }}
				/>
				<Font
					fallbackFontFamily="Verdana"
					fontFamily="Work Sans"
					fontStyle="italic"
					fontWeight={400}
					webFont={{ format: 'woff2', url: 'https://go.tmlmobilidade.pt/auth/global/fonts/work-sans-italic.woff2' }}
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
