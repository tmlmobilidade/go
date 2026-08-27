WITH
    multiIf(
        toDayOfWeek(toDate(toString(operational_date), 'YYYYMMDD')) = 6, '2',
        toDayOfWeek(toDate(toString(operational_date), 'YYYYMMDD')) = 7, '3',
        '1'
    ) AS day_type,

    toHour(fromUnixTimestamp(intDiv(created_at, 1000))) AS hora

SELECT
    assumeNotNull(agency_id) AS agency_id,
    assumeNotNull(pattern_id) AS pattern_id,
    assumeNotNull(line_id) AS line_id,

    -- Subtipo (Base / Variante)
    CASE
        WHEN substring(assumeNotNull(pattern_id), 6, 1) = '0' THEN 'Base'
        ELSE 'Variante'
    END AS subtipo,

    -- Sentido (A / D)
    CASE
        WHEN right(assumeNotNull(pattern_id), 1) IN ('1', '3') THEN 'A'
        WHEN right(assumeNotNull(pattern_id), 1) = '2' THEN 'D'
        ELSE ''
    END AS sentido,

    'Regular' AS tipo_transporte,

    CASE
        WHEN assumeNotNull(pattern_id) IN (
            '2911_0_2','2927_0_2','2910_2_2','2927_0_1','2911_1_2',
            '2911_0_1','2900_0_2','2901_1_1','2901_0_2','2908_1_2',
            '2913_1_1','2901_0_1','2910_0_1','2926_0_1','2915_0_1',
            '2910_1_1','2926_0_2','2910_0_2','2912_0_2','2912_0_1'
        ) THEN 'Municipal'
        WHEN toUInt8(substring(assumeNotNull(pattern_id), 2, 1)) <= 4 THEN 'Municipal'
        WHEN toUInt8(substring(assumeNotNull(pattern_id), 2, 1)) <= 8 THEN 'Intermunicipal'
        ELSE 'Inter-Regional'
    END AS classificacao,

    -- Total de passageiros
    countIf(is_passenger) AS passengers,

    -- Passageiros por tipo de dia
    countIf(is_passenger AND day_type = '1') AS passageiros_1,
    countIf(is_passenger AND day_type = '2') AS passageiros_2,
    countIf(is_passenger AND day_type = '3') AS passageiros_3,

    -- Passageiros por período do dia
    -- PPM 07:00-09:59 | PPT 17:00-19:59 | CD 10:00-16:59 | Noite 20:00-06:59
    countIf(is_passenger AND hora BETWEEN 7 AND 9) AS passageiros_PPM,
    countIf(is_passenger AND hora BETWEEN 17 AND 19) AS passageiros_PPT,
    countIf(is_passenger AND hora BETWEEN 10 AND 16) AS passageiros_CD,
    countIf(is_passenger AND (hora >= 20 OR hora <= 6)) AS passageiros_N

FROM simplified_apex.validations

WHERE
    agency_id IS NOT NULL
    AND pattern_id IS NOT NULL
    AND line_id IS NOT NULL
    AND agency_id IN ('LA77N', 'BNA17', '4YA15B3', 'A2L1N')

GROUP BY
    agency_id,
    pattern_id,
    line_id;
