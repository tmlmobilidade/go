/* * */

import { createRssFeed, type CreateRssFeedOptions } from '@tmlmobilidade/rss';

/** The publisher escapes item text, so item tags delimit its generated entries. */
export function mergeRssFeeds(feeds: string[], options: CreateRssFeedOptions): string {
	const items = feeds.flatMap(feed => feed.match(/<item>[\s\S]*?<\/item>/g) ?? []);
	return createRssFeed([], options).replace('</channel>', `${[...new Set(items)].join('\n')}\n</channel>`);
}
