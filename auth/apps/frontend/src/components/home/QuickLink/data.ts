import { ReactNode } from 'react';

export interface QuickLink {
	href: string
	icon: ReactNode
	title: string
}

export const quickLinks: QuickLink[] = [
	{ href: 'https://go.carrismetropolitana.pt', icon: '🌐', title: 'GO v1' },
	{ href: 'https://eu.remix.com', icon: '📀', title: 'Remix' },
	{ href: '', icon: '📖', title: 'CRM' },
	{ href: '', icon: '🐤', title: 'FileDoc' },
	{ href: '', icon: '', title: 'BDH' },
];
