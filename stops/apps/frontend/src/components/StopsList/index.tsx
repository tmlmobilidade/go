import StopsListItem from "../StopsListItem";

interface StopsListProps {
    stops: String[];
}

export default function StopsList({ stops }: StopsListProps) {
    return <div>
        {/* Search Bar */}
        <div>
            <input type="text" placeholder="Pesquisar..." />
            <button>Settings</button>
        </div>

        {/* Stops List */}
        {stops.map((stop, index) => (<StopsListItem key={index} stop={stop} />))}
    </div>;
}
