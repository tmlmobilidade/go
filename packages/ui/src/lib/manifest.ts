/* * */

import { type MetadataRoute } from 'next';

/**
 * The default manifest for the app.
 * This allows the app to be installed as a PWA.
 * @see https://nextjs.org/docs/app/guides/progressive-web-apps
 */
export const defaultManifest: MetadataRoute.Manifest = {
	background_color: '#F6F8FA',
	description: 'Gestão Inteligente de Mobilidade',
	display: 'standalone',
	icons: [
		{
			sizes: '192x192',
			src: '/assets/pwa/192x192.png',
			type: 'image/png',
		},
		{
			sizes: '512x512',
			src: '/assets/pwa/512x512.png',
			type: 'image/png',
		},
	],
	name: 'GO',
	orientation: 'landscape',
	short_name: 'GO',
	start_url: '/',
	theme_color: '#000000',
};
