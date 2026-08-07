/* * */

import { ClickhouseInterfaceTableOptions, ClickHouseInterfaceTemplate } from '@/interface.template.js';
import { simplifiedApexBankingTapTableSchema, simplifiedApexInspectionDecisionTableSchema, simplifiedApexInspectionTableSchema, simplifiedApexLocationTableSchema, simplifiedApexOnBoardRefundTableSchema, simplifiedApexOnBoardSaleTableSchema, simplifiedApexValidationTableSchema } from '@/schemas/simplified-apex.js';
import { ClickHouseClient } from '@tmlmobilidade/go-clients-clickhouse';
import { type SimplifiedApexBankingTap, SimplifiedApexInspection, SimplifiedApexInspectionDecision, SimplifiedApexLocation, SimplifiedApexOnBoardRefund, SimplifiedApexOnBoardSale, SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';

/* * */

export class SimplifiedApexDatabase {
	//

	public readonly bankingTaps: ClickHouseInterfaceTemplate<SimplifiedApexBankingTap>;
	public readonly inspectionDecisions: ClickHouseInterfaceTemplate<SimplifiedApexInspectionDecision>;
	public readonly inspections: ClickHouseInterfaceTemplate<SimplifiedApexInspection>;
	public readonly locations: ClickHouseInterfaceTemplate<SimplifiedApexLocation>;
	public readonly refunds: ClickHouseInterfaceTemplate<SimplifiedApexOnBoardRefund>;
	public readonly sales: ClickHouseInterfaceTemplate<SimplifiedApexOnBoardSale>;
	public readonly validations: ClickHouseInterfaceTemplate<SimplifiedApexValidation>;

	private readonly databaseName = 'simplified_apex';

	public constructor(client: ClickHouseClient) {
		//

		const simplifiedTableOptions: ClickhouseInterfaceTableOptions<SimplifiedApexBankingTap | SimplifiedApexInspection | SimplifiedApexInspectionDecision | SimplifiedApexLocation | SimplifiedApexOnBoardRefund | SimplifiedApexOnBoardSale | SimplifiedApexValidation> = {
			engine: 'ReplacingMergeTree(updated_at)',
			orderBy: ['agency_id', 'operational_date', 'created_at', '_id'],
			partitionBy: 'intDiv(operational_date, 100)',
		};

		this.bankingTaps = new ClickHouseInterfaceTemplate<SimplifiedApexBankingTap>(client, this.databaseName, 'banking_taps', simplifiedApexBankingTapTableSchema, simplifiedTableOptions);
		this.inspectionDecisions = new ClickHouseInterfaceTemplate<SimplifiedApexInspectionDecision>(client, this.databaseName, 'inspection_decisions', simplifiedApexInspectionDecisionTableSchema, simplifiedTableOptions);
		this.inspections = new ClickHouseInterfaceTemplate<SimplifiedApexInspection>(client, this.databaseName, 'inspections', simplifiedApexInspectionTableSchema, simplifiedTableOptions);
		this.locations = new ClickHouseInterfaceTemplate<SimplifiedApexLocation>(client, this.databaseName, 'locations', simplifiedApexLocationTableSchema, simplifiedTableOptions);
		this.refunds = new ClickHouseInterfaceTemplate<SimplifiedApexOnBoardRefund>(client, this.databaseName, 'refunds', simplifiedApexOnBoardRefundTableSchema, simplifiedTableOptions);
		this.sales = new ClickHouseInterfaceTemplate<SimplifiedApexOnBoardSale>(client, this.databaseName, 'sales', simplifiedApexOnBoardSaleTableSchema, simplifiedTableOptions);
		this.validations = new ClickHouseInterfaceTemplate<SimplifiedApexValidation>(client, this.databaseName, 'validations', simplifiedApexValidationTableSchema, simplifiedTableOptions);
	}

	public async init() {
		await Promise.all([
			this.bankingTaps.init(),
			this.inspectionDecisions.init(),
			this.inspections.init(),
			this.locations.init(),
			this.refunds.init(),
			this.sales.init(),
			this.validations.init(),
		]);
	}
}
