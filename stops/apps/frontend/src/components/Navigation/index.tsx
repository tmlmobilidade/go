"use client";

import List from "./List";
import SearchBar from "./SearchBar";
import Footer from "./Footer";

import styles from './styles.module.css';

interface NavigationProps {
    stops: String[];
}

export default function Navigation({ stops }: NavigationProps) {
    return <div className={styles.container}>
        <SearchBar />
        <List stops={stops} />
        <Footer />
    </div>;
}
