/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { type ClickHouseTableEngine, type ClickHouseTableSchema } from '@/types/index.js';
import { type Itrp } from '@tmlmobilidade/go-types-performance';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const tableSchema: ClickHouseTableSchema<Itrp> = {
	agency_id: { type: 'String' },
	pattern_id: { type: 'String' },
	line_id: { type: 'String' },
	route_id: { type: 'String' },
	subtipo: { type: 'String' },
	designacao: { type: 'String' },
	sentido: { type: 'String' },
	tipo_transporte: { type: 'String' },
	origem_municipio: { type: 'String' },
	origem_dtcc: { type: 'String' },
	destino_municipio: { type: 'String' },
	destino_dtcc: { type: 'String' },
	classificacao: { type: 'String' },
	extension_scheduled: { type: 'Float64' },
	extension_observed: { type: 'Float64' },
	circulations_scheduled: { type: 'UInt64' },
	circulations_observed: { type: 'UInt64' },
	veiculos_km_previsto: { type: 'Float64' },
	veiculos_km_produzido: { type: 'Float64' },
	passengers: { type: 'UInt64' },
	carreiras_servicos_1: { type: 'UInt64' },
	veiculos_km_1: { type: 'Float64' },
	passageiros_1: { type: 'UInt64' },
	carreiras_servicos_2: { type: 'UInt64' },
	veiculos_km_2: { type: 'Float64' },
	passageiros_2: { type: 'UInt64' },
	carreiras_servicos_3: { type: 'UInt64' },
	veiculos_km_3: { type: 'Float64' },
	passageiros_3: { type: 'UInt64' },
	carreiras_servicos_PPM: { type: 'UInt64' },
	veiculos_km_PPM: { type: 'Float64' },
	passageiros_PPM: { type: 'UInt64' },
	carreiras_servicos_PPT: { type: 'UInt64' },
	veiculos_km_PPT: { type: 'Float64' },
	passageiros_PPT: { type: 'UInt64' },
	carreiras_servicos_CD: { type: 'UInt64' },
	veiculos_km_CD: { type: 'Float64' },
	passageiros_CD: { type: 'UInt64' },
	carreiras_servicos_N: { type: 'UInt64' },
	veiculos_km_N: { type: 'Float64' },
	passageiros_N: { type: 'UInt64' },
};

/* * */

class ItrpClass extends ClickHouseInterfaceTemplate<Itrp> {
	//

	private static _instance: null | Promise<ItrpClass> = null;

	protected override readonly databaseName = 'performance';
	protected override readonly engine: ClickHouseTableEngine<Itrp> = 'ReplacingMergeTree()';
	protected override readonly manageSchema = false;
	protected override readonly orderBy = 'agency_id, pattern_id, line_id';
	protected override readonly schema = tableSchema;
	protected override readonly tableName = 'ITRP';

	public static async getInstance() {
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new ItrpClass();
				await instance.init();
				return instance;
			})();
		}
		return await this._instance;
	}

	protected override connectToClient() {
		return GOClickHouseClient.getClient();
	}
}

/* * */

export const itrp = asyncSingletonProxy(ItrpClass);
