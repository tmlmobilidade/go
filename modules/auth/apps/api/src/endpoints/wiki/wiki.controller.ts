/* * */

import { transformMarkdownToWikiArticle } from '@/utils/transform-md-to-wiki.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';
import { type WikiArticle } from '@tmlmobilidade/types';
import fs from 'node:fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

/* * */

export class WikiController {
	static async getAll(request: FastifyRequest, reply: FastifyReply<WikiArticle[]>) {
		try {
			//

			//
			// List the content directory

			const contentDirPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../content/');

			if (!fs.existsSync(contentDirPath)) {
				const error = new Error('Content directory not found');
				reply.status(HTTP_STATUS.NOT_FOUND).send({ message: error.message });
				return;
			}

			//
			// Read all .md files in the content directory

			const allMdFiles = fs
				.readdirSync(contentDirPath)
				.filter(file => file.endsWith('.md'));

			if (allMdFiles.length === 0) {
				const error = new Error('No markdown files found');
				reply.status(HTTP_STATUS.NOT_FOUND).send({ message: error.message });
				return;
			}

			//
			// Loop through each .md file
			// and process it with gray-matter and remark

			const allWikiArticles: WikiArticle[] = [];

			for (const fileName of allMdFiles) {
				// Read the contents of the file
				const filePath = resolve(contentDirPath, fileName);
				const fileData = fs.readFileSync(filePath, 'utf-8');
				// Parse into a WikiArticle data
				const result = await transformMarkdownToWikiArticle(fileName, fileData);
				// Save the parsed file data
				allWikiArticles.push(result);
			}

			//
			// Sort the articles by their order property

			const sortedWikiArticles = allWikiArticles.sort((a, b) => a.order - b.order);

			//
			// Send the response with the parsed articles

			reply.send({ data: sortedWikiArticles, error: null, statusCode: HTTP_STATUS.OK });

			//
		} catch (error) {
			reply
				.status(error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<WikiArticle>) {
		try {
			//

			//
			// Check if the article id (the filename) is provided
			// and if it exists in the content directory

			const fileName = request.params.id;

			if (!fileName?.endsWith('.md')) {
				reply.status(HTTP_STATUS.BAD_REQUEST).send({ message: 'Invalid article ID' });
				return;
			}

			//
			// List the content directory

			const contentDirPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../content/');

			if (!fs.existsSync(contentDirPath)) {
				reply.status(HTTP_STATUS.NOT_FOUND).send({ message: 'Content directory not found' });
				return;
			}

			//
			// Check if the file exists in the content directory

			const filePath = resolve(contentDirPath, fileName);

			if (!fs.existsSync(filePath)) {
				reply.status(HTTP_STATUS.NOT_FOUND).send({ message: 'Article not found' });
				return;
			}

			//
			// Parse into a WikiArticle data

			const fileData = fs.readFileSync(filePath, 'utf-8');

			const result = await transformMarkdownToWikiArticle(fileName, fileData);

			//
			// Send the response to the client

			reply.send({ data: result, error: null, statusCode: HTTP_STATUS.OK });

			//
		} catch (error) {
			reply
				.status(error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}
}
