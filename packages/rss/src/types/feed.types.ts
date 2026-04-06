/* * */

export type RssRawImageInput = string | { alt?: null | string, length?: null | number, type?: null | string, url: string };

/* * */

export interface RssRawItem {
	_id?: string
	contentHtml?: null | string
	created_at?: number | string
	description?: null | string
	images?: Array<RssRawImageInput>
	link?: null | string
	linkLabel?: null | string
	publish_start_date?: null | number
	publishDate?: null | string
	slug?: null | string
	summary?: null | string
	title?: null | string
}

/* * */

export interface CreateRssFeedOptions {
	copyright: string
	description: string
	feedSelfUrl?: string
	link: string
	title: string
}

/* * */
