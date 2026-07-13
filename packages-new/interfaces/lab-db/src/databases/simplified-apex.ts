/* * */

import { ClickhouseInterfaceTableOptions, ClickHouseInterfaceTemplate } from '@/interface.template.js';
import { simplifiedApexBankingTapSchema, simplifiedApexInspectionDecisionSchema, simplifiedApexInspectionSchema, simplifiedApexLocationSchema, simplifiedApexOnBoardRefundSchema, simplifiedApexOnBoardSaleSchema, simplifiedApexValidationSchema } from '@/types/simplified-apex.js';
import { ClickHouseClient } from '@tmlmobilidade/go-clients-clickhouse';
import { type SimplifiedApexBankingTap, SimplifiedApexInspection, SimplifiedApexInspectionDecision, SimplifiedApexLocation, SimplifiedApexOnBoardRefund, SimplifiedApexOnBoardSale, SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';

/* * */

export class SimplifiedApexDatabase {
	//

	//
	// Tables
	public readonly bankingTaps: ClickHouseInterfaceTemplate<SimplifiedApexBankingTap>;
	public readonly inspectionDecisions: ClickHouseInterfaceTemplate<SimplifiedApexInspectionDecision>;
	public readonly inspections: ClickHouseInterfaceTemplate<SimplifiedApexInspection>;
	public readonly locations: ClickHouseInterfaceTemplate<SimplifiedApexLocation>;
	public readonly refunds: ClickHouseInterfaceTemplate<SimplifiedApexOnBoardRefund>;
	public readonly sales: ClickHouseInterfaceTemplate<SimplifiedApexOnBoardSale>;
	public readonly validations: ClickHouseInterfaceTemplate<SimplifiedApexValidation>;

	//
	private readonly databaseName = 'simplified_apex';

	public constructor(instance: ClickHouseClient) {
		//

		// Setup the table options, as they are the same for all simplified APEX tables
		const simplifiedTableOptions: ClickhouseInterfaceTableOptions<SimplifiedApexBankingTap | SimplifiedApexInspection | SimplifiedApexInspectionDecision | SimplifiedApexLocation | SimplifiedApexOnBoardRefund | SimplifiedApexOnBoardSale | SimplifiedApexValidation> = {
			engine: 'ReplacingMergeTree(updated_at)',
			orderBy: ['agency_id', 'operational_date', 'created_at', '_id'],
			partitionBy: 'intDiv(operational_date, 100)',
		};

		// Create the table interfaces
		this.bankingTaps = new ClickHouseInterfaceTemplate<SimplifiedApexBankingTap>(instance, this.databaseName, 'banking_taps', simplifiedApexBankingTapSchema, simplifiedTableOptions);
		this.inspectionDecisions = new ClickHouseInterfaceTemplate<SimplifiedApexInspectionDecision>(instance, this.databaseName, 'inspection_decisions', simplifiedApexInspectionDecisionSchema, simplifiedTableOptions);
		this.inspections = new ClickHouseInterfaceTemplate<SimplifiedApexInspection>(instance, this.databaseName, 'inspections', simplifiedApexInspectionSchema, simplifiedTableOptions);
		this.locations = new ClickHouseInterfaceTemplate<SimplifiedApexLocation>(instance, this.databaseName, 'locations', simplifiedApexLocationSchema, simplifiedTableOptions);
		this.refunds = new ClickHouseInterfaceTemplate<SimplifiedApexOnBoardRefund>(instance, this.databaseName, 'refunds', simplifiedApexOnBoardRefundSchema, simplifiedTableOptions);
		this.sales = new ClickHouseInterfaceTemplate<SimplifiedApexOnBoardSale>(instance, this.databaseName, 'sales', simplifiedApexOnBoardSaleSchema, simplifiedTableOptions);
		this.validations = new ClickHouseInterfaceTemplate<SimplifiedApexValidation>(instance, this.databaseName, 'validations', simplifiedApexValidationSchema, simplifiedTableOptions);
	}
}
