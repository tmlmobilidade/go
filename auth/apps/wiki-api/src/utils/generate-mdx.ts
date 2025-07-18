import fm from 'front-matter';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MarkdownComponent {
	id: string
	subtitle?: string
	tags: string[]
	title: string
}

const WIKI_PATH = __dirname + '/wiki/';

export function generateWikiMdx(): MarkdownComponent[] {
	const markdownComponents: MarkdownComponent[] = [];

	const res = fs.readdirSync(WIKI_PATH);
	res.forEach((item) => {
		const file = fs.readFileSync(WIKI_PATH + item, 'utf-8');

		const content = fm.default<MarkdownComponent>(file);
		markdownComponents.push(
			{
				id: item,
				subtitle: content.attributes['subtitle'],
				tags: [...(content.attributes['tags'] as unknown as string).replaceAll(' ', '').split(',')],
				title: content.attributes['title'],
			},
		);
	});

	return markdownComponents;
}
