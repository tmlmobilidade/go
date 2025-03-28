interface DetailsProps {
	_id?: string | undefined,
	latitude?: number | undefined,
	longitude?: number | undefined,
	name?: string | undefined,
	operational_status?: "active" | "inactive" | "provisional" | "seasonal" | "voided" | undefined;
	short_name?: string | null | undefined,
	tts_name?: string | null | undefined
}

export default function Details({
	_id,
	latitude,
	longitude,
	name,
	operational_status,
	short_name,
	tts_name
}: DetailsProps) {
	return <div>
		{/* Header */}
		<div>
			<div>Detalhes desta Paragem</div>
			<div>Informações gerais sobre esta paragem</div>
		</div>

		{/* _id / lat / lon */}
		<div>
			{/* _id */}
			<div>
				<div>Código Único da Paragem</div>
				<input type="text" value={_id} />
			</div>

			{/* lat */}
			<div>
				<div>Latitude</div>
				<input type="text" value={latitude} />
			</div>

			{/* lon */}
			<div>
				<div>Longitude</div>
				<input type="text" value={longitude} />
			</div>
		</div>

		{/* name (old name) */}
		<div>
			<div>Antigo Nome da Paragem (p/ alterar)</div>
			<input type="text" value={name} disabled />
		</div>

		{/* name (changeable field) */}
		<div>
			<div>Nome da Paragem (depois da correção)</div>
			<input type="text" value={name} />
		</div>

		{/* short_name / tts_name */}
		<div>
			{/* short_name */}
			<div>
				<div>Nome Curto (Postalete)</div>
				<input type="text" value={short_name} />
				<button>A</button>
			</div>

			{/* tts_name */}
			<div>
				<div>Nome Falado (Text-to-Speech)</div>
				<input type="text" value={tts_name} />
				<button>A</button>
			</div>
		</div>

		{/* operational_status */}
		<div>
			<div>Estado Operacional</div>
			<input type="text" value={operational_status} />
		</div>
	</div>;
}
