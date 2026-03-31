export interface RssRawItem {
	_id?: string
	created_at?: number | string
	description?: null | string
	id?: string
	info_url?: null | string
	link?: null | string
	publish_start_date?: null | number
	publishDate?: null | string
	slug?: null | string
	summary?: null | string
	title?: null | string
}

export interface CreateRssFeedOptions {
	copyright: string
	description: string
	link: string
	title: string
}
