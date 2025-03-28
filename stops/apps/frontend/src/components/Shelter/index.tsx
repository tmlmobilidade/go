export default function Shelter() {
    return <div>
        {/* Header */}
        <div>
            <div>Abrigo</div>
            <div>Informações relacionadas com o abrigo.</div>
        </div>

        <div>
            {/*  */}
            <div>
                <div>Existe Abrigo?</div>
                <input type="text" />
            </div>

            {/*  */}
            <div>
                <div>Código do Abrigo</div>
                <input type="text" />
            </div>

            {/*  */}
            <div>
                <div>Entidade Gestora do Abrigo</div>
                <input type="text" />
            </div>
        </div>

        <div>
            {/*  */}
            <div>
                <div>Última verificação do estado do abrigo</div>
                <input type="text" />
            </div>

            {/*  */}
            <div>
                <div>Data de Instalação do Abrigo</div>
                <input type="text" />
            </div>
        </div>
    </div>;
}
