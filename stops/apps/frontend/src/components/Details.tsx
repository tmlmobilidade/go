interface DetailsProps {
	_id?: string | undefined,
	latitude?: number | undefined,
	longitude?: number | undefined,
	name?: string | undefined,
	short_name?: string | null | undefined,
	tts_name?: string | null | undefined
}

export default function Details({ 
	_id, 
	latitude, 
	longitude, 
	name, 
	short_name, 
	tts_name 
}: DetailsProps) {
	return <div>
		Details
	</div>;
}
