/* * */

import * as fm from 'front-matter';
import fs from 'fs';
import { dirname, resolve } from 'path';
import remarkHtml from 'remark-html';
import remarkParse from 'remark-parse';
import { fileURLToPath } from 'url';
// import { read } from 'to-vfile';
import { unified } from 'unified';

/* * */

interface ParsedMdxFile {
	_id: string
	html: string
	subtitle?: string
	tags: string[]
	title: string
}

export async function transformMdxToHtml(): Promise<ParsedMdxFile[]> {
	//

	//
	// A. Setup variables

	const ParsedMdxFileComponents: ParsedMdxFile[] = [];

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	const contentPath = resolve(__dirname, '../../content/');

	const res = fs.readdirSync(contentPath);

	res.forEach(async (item) => {
		const filePath = resolve(contentPath, item);
		const fileData = fs.readFileSync(filePath, 'utf-8');
		//
		// .... trasfrom frontmatter to json ....

		const fileContent = fm.default<ParsedMdxFile>(fileData);

		// .... trasfrom md to html ....

		const contentHtml = await unified()
			.use(remarkParse)
			.use(remarkHtml)
			.process(fileContent.body);
		//

		//
		// B. Handle actions

		ParsedMdxFileComponents.push(
			{
				_id: item,
				html: String(contentHtml),
				subtitle: fileContent.attributes['subtitle'],
				tags: [...(fileContent.attributes['tags'] as unknown as string).replaceAll(' ', '').split(',')],
				title: fileContent.attributes['title'],
			},
		);
	});
	//

	//
	// C. Render components

	return ParsedMdxFileComponents;
	//
}
