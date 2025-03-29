import Item from "./Item";

interface ListProps {
    stops: String[];
}

export default function List({ stops }: ListProps) {
    return <div>
        {stops.map((stop, index) => (<Item key={index} stop={stop} />))}
    </div>;
}
