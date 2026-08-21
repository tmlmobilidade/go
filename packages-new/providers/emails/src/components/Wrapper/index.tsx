/* * */

import { CoverLogo } from '@/components/CoverLogo/index.js';
import { Disclaimer } from '@/components/Disclaimer/index.js';
import { fontWeight } from '@/styles/font.js';
import { type PropsWithChildren } from 'react';
import { Body, Container, Font, Head, Html, Preview, Section } from 'react-email';

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
					fontWeight={fontWeight.normal}
					webFont={{ format: 'woff2', url: 'https://storage.carrismetropolitana.pt/static/test/work-sans-regular.woff2' }}
				/>
				<Font
					fallbackFontFamily="Verdana"
					fontFamily="Work Sans"
					fontStyle="normal"
					fontWeight={fontWeight.bold}
					webFont={{ format: 'woff2', url: 'https://storage.carrismetropolitana.pt/static/test/work-sans-regular.woff2' }}
				/>
				<Font
					fallbackFontFamily="Verdana"
					fontFamily="Work Sans"
					fontStyle="italic"
					fontWeight={fontWeight.normal}
					webFont={{ format: 'woff2', url: 'https://storage.carrismetropolitana.pt/static/test/work-sans-italic.woff2' }}
				/>
				<Font
					fallbackFontFamily="Verdana"
					fontFamily="Work Sans"
					fontStyle="italic"
					fontWeight={fontWeight.bold}
					webFont={{ format: 'woff2', url: 'https://storage.carrismetropolitana.pt/static/test/work-sans-italic.woff2' }}
				/>
			</Head>
			<Body style={styles.body}>
				<Preview>{previewMessage}</Preview>
				<Container style={styles.container}>
					<CoverLogo />
					<Section style={styles.content}>
						{children}
					</Section>
					<Disclaimer />
				</Container>
			</Body>
		</Html>
	);
};
