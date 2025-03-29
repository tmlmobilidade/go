import styles from './styles.module.css';

export default function SearchBar() {
    return <div className={styles.container}>
        <input className={styles.input} type="text" placeholder="Pesquisar..." />
        <button className={styles.settings}></button>
    </div>;
}
