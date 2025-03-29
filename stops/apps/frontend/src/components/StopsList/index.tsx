import Item from "./Item";
import SearchBar from "./SearchBar";

interface StopsListProps {
    stops: String[];
}

export default function StopsList({ stops }: StopsListProps) {
    return <div>
        <SearchBar />

        <div>
            {stops.map((stop, index) => (<Item key={index} stop={stop} />))}
        </div>

        <div>
            Encontradas 12527 paragens
        </div>
    </div>;
}
