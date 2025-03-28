export default function AdminInformation() {
    return <div>
        {/* Header */}
        <div>
            <div>Informação Administrativa</div>
            <div>Informações sobre a localização administrativa e responsabilidade de gestão desta paragem</div>
        </div>

        <div>
            <div>
                <div>Município</div>
                <input type="text" />
            </div>

            <div>
                <div>Freguesia</div>
                <input type="text" />
            </div>

            <div>
                <div>Localidade</div>
                <input type="text" />
            </div>
        </div>

        {/* jurisdiction */}
        <div>
            <div>Jurisdição</div>
            <input type="text" />
        </div>
    </div>;
}
