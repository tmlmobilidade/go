import { ReactNode } from 'react';

export interface QuickLink {
	href: string
	icon: ReactNode
	title: string
}

export const quickLinks: QuickLink[] = [
	{ href: 'https://go.carrismetropolitana.pt', icon: '🌐', title: 'GO v1' },
	{ href: 'https://eu.remix.com', icon: '📀', title: 'Remix' },
	{ href: 'https://pt.wikipedia.org/wiki/Carris_Metropolitana', icon: '📖', title: 'Wiki' },
	{ href: 'https://x.com/CMetropolitana_?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor', icon: '🐤', title: 'Twiitter' },
];
