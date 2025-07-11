import { ReactNode } from "react";

export interface QuickLink {
	icon: ReactNode
	href: string
	title: string
}


export const quickLinks: QuickLink[] = [
	{ icon: '🌐', href: 'https://go.carrismetropolitana.pt', title: 'GO v1' },
	{ icon: '📀', href: 'https://eu.remix.com', title: 'Remix' },
	{ icon: '📖', href: 'https://pt.wikipedia.org/wiki/Carris_Metropolitana', title: 'Wiki' },
	{ icon: '🐤', href: 'https://x.com/CMetropolitana_?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor', title: 'Twitter' },
];
