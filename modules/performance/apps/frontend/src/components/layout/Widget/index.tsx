'use client';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import {
	IconCloud,
	IconCloudFog,
	IconCloudOff,
	IconCloudRain,
	IconCloudSnow,
	IconCloudStorm,
	IconSun,
} from '@tabler/icons-react';
import { Dates } from '@tmlmobilidade/dates';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface WeatherData {
	temperature: number
	weathercode: number
}

/* * */

const getIconForWeatherCode = (code: number) => {
	if ([0].includes(code)) return <IconSun size={24} />;
	if ([1, 2, 3].includes(code)) return <IconCloud size={24} />;
	if ([45, 48].includes(code)) return <IconCloudFog size={24} />;
	if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67].includes(code))
		return <IconCloudRain size={24} />;
	if ([71, 73, 75, 77].includes(code)) return <IconCloudSnow size={24} />;
	if ([80, 81, 82].includes(code)) return <IconCloudRain size={24} />;
	if ([95, 96, 99].includes(code)) return <IconCloudStorm size={24} />;
	return <IconCloudOff size={24} />;
};

/* * */

export function Widget() {
	const [hours, setHours] = useState('--');
	const [minutes, setMinutes] = useState('--');
	const [seconds, setSeconds] = useState('--');

	const [areaWeather, setAreaWeather] = useState<WeatherData>();

	const LISBON_LAT = 38.7223;
	const LISBON_LON = -9.1393;

	//
	// A. Time updater
	useEffect(() => {
		const updateTime = () => {
			const now = Dates.now('Europe/Lisbon');
			setHours(now.toFormat('HH'));
			setMinutes(now.toFormat(':mm'));
			setSeconds(now.toFormat('ss'));
		};
		updateTime();
		const timer = setInterval(updateTime, 1000);
		return () => clearInterval(timer);
	}, []);

	// B. Fetch weather data
	useEffect(() => {
		async function fetchWeather() {
			const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LISBON_LAT}&longitude=${LISBON_LON}&current_weather=true`);
			const json = await res.json();
			const weatherObj = json.current_weather as WeatherData;

			const result = { temperature: weatherObj.temperature, weathercode: weatherObj.weathercode };
			setAreaWeather(result);
		}
		fetchWeather();
	}, []);

	// C. Render
	return (
		<ContainerWrapper>
			<div className={styles.container}>
				{/* Weather Summary */}
				<div className={styles.weatherContainer}>
					{areaWeather ? (
						<>
							{getIconForWeatherCode(areaWeather.weathercode)}
							<p className={styles.weatherLabel}>
								{areaWeather.temperature.toFixed(0)}ºC
							</p>
						</>
					) : (
						<>
							<IconCloudOff size={24} />
							<p className={styles.weatherLabel}>--ºC</p>
						</>
					)}
				</div>
			</div>

			{/* Time */}
			<div className={styles.timeContainer}>
				<p className={styles.hours}>{hours}</p>
				<p className={styles.minutes}>{minutes}</p>
				<p className={styles.seconds}>{seconds}</p>
			</div>
		</ContainerWrapper>
	);
}
