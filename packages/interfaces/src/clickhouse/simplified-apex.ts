/* * */

import { ClickhouseService } from '@tmlmobilidade/clickhouse';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

class SimplifiedApexClass extends ClickhouseService {
	async setupDatabase() {
		await this.queryFromString(`CREATE DATABASE IF NOT EXISTS simplified_apex`);
	}
}

/* * */

export const simplifiedApex = asyncSingletonProxy(SimplifiedApexClass);
