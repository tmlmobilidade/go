export interface RssRawItem {
	_id?: string
	created_at?: number | string
	description?: null | string
	id?: string
	info_url?: null | string
	link?: null | string
	publish_start_date?: null | number
	publishedAt?: null | string
	slug?: null | string
	summary?: null | string
	title?: null | string
}

export interface RssNormalizedItem {
	description: string
	guid: string
	link: string
	publishDate?: string
	title: string
}
