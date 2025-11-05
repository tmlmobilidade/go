/* * */

import { type WikiArticle } from '@tmlmobilidade/go-types';
import matter from 'gray-matter';
import remarkHtml from 'remark-html';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

/* * */

export async function transformMarkdownToWikiArticle(fileId: string, fileData: string): Promise<WikiArticle> {
	//

	//
	// With gray-matter, extract metadata and file contents

	const fileContentAndMetadata = matter(fileData);

	//
	// Transform contents to HTML

	const htmlData = await unified()
		.use(remarkParse)
		.use(remarkHtml)
		.process(fileContentAndMetadata.content);

	//
	// Return the parsed WikiArticle data

	return {
		_id: fileId,
		html: String(htmlData),
		order: fileContentAndMetadata.data.order || 0,
		tags: (fileContentAndMetadata.data.tags as string)?.replaceAll(' ', '').split(',') ?? [],
		title: fileContentAndMetadata.data.title,
	};

	//
}
