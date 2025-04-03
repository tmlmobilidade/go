"use client";

import List from "./List";
import SearchBar from "./SearchBar";
import Footer from "./Footer";

import styles from './styles.module.css';

export default function Navigation() {
    return <div className={styles.container}>
        <SearchBar />
        <List />
        <Footer />
    </div>;
}
