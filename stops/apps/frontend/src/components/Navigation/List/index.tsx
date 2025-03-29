import Item from "./Item";

import styles from './styles.module.css';

interface ListProps {
    stops: String[];
}

export default function List({ stops }: ListProps) {
    return <div className={styles.container}>
        {stops.map((stop, index) => (<Item key={index} stop={stop} />))}
    </div>;
}
