interface AdminInformationProps {
    jurisdiction: "unknown" | "ip" | "municipality" | "other";
    municipality_id: string;
    parish_id?: string | null | undefined;
    locality_id?: string | null | undefined;
}

export default function AdminInformation({
    jurisdiction,
    municipality_id,
    parish_id,
    locality_id
}: AdminInformationProps) {
    return <div>
        {/* Header */}
        <div>
            <div>Informação Administrativa</div>
            <div>Informações sobre a localização administrativa e responsabilidade de gestão desta paragem</div>
        </div>

        <div>
            {/* municipality_id */}
            <div>
                <div>Município</div>
                <input type="text" value={municipality_id} />
            </div>

            {/* parish_id */}
            <div>
                <div>Freguesia</div>
                <input type="text" value={parish_id} />
            </div>

            {/* locality_id */}
            <div>
                <div>Localidade</div>
                <input type="text" value={locality_id} />
            </div>
        </div>

        {/* jurisdiction */}
        <div>
            <div>Jurisdição</div>
            <input type="text" value={jurisdiction} />
        </div>
    </div>;
}
