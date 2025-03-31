import { useEffect } from "react";

import maplibregl from "maplibre-gl";

import styles from './styles.module.css';

export default function Map() {

    useEffect(() => {
        var map = new maplibregl.Map({
            container: 'map',
            style: 'https://demotiles.maplibre.org/style.json', // stylesheet location
            center: [-8.9595566, 38.7542436], // starting position [lng, lat]
            zoom: 9 // starting zoom
        });
    }, [])
    return <div className={styles.container}>
        <div id='map' style={{ width: "100%", height: "300px", overflow: "hidden" }}></div>
    </div>;
}


