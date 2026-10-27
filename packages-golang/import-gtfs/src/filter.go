package importgtfs

import (
	"database/sql"
	"fmt"
	"slices"
	"strconv"
	"strings"
	"time"
)

// Resolve and filter only staged rows. Existing caller-owned data is never pruned.
func filterServiceDates(tx *sql.Tx, tables map[string]string, prefix string, config *ImportGtfsConfigTimeRange, matches func(string) bool) error {
	headers := make(map[string][]string)
	for table, staged := range tables {
		rows, err := tx.Query("PRAGMA temp.table_info(" + quoteIdentifier(staged) + ")")
		if err != nil {
			return err
		}
		for rows.Next() {
			var id, notNull, primaryKey int
			var name, kind string
			var defaultValue any
			if err := rows.Scan(&id, &name, &kind, &notNull, &defaultValue, &primaryKey); err != nil {
				rows.Close()
				return err
			}
			headers[table] = append(headers[table], name)
		}
		err = rows.Err()
		rows.Close()
		if err != nil {
			return err
		}
		if len(headers[table]) == 0 {
			delete(tables, table)
		}
	}
	require := func(table string, columns ...string) error {
		for _, column := range columns {
			if !slices.Contains(headers[table], column) {
				return fmt.Errorf("time_range: %s requires column %s", table, column)
			}
		}
		return nil
	}
	datesHeader := headers["calendar_dates"]
	if len(datesHeader) == 0 {
		datesHeader = []string{"service_id", "date", "exception_type"}
	} else if err := require("calendar_dates", "service_id", "date", "exception_type"); err != nil {
		return err
	}
	resolved := prefix + "resolved_dates"
	definitions := make([]string, len(datesHeader))
	quotedColumns := make([]string, len(datesHeader))
	placeholders := make([]string, len(datesHeader))
	for i, column := range datesHeader {
		quotedColumns[i] = quoteIdentifier(column)
		definitions[i] = quotedColumns[i] + " TEXT"
		placeholders[i] = "?"
	}
	if _, err := tx.Exec("CREATE TEMP TABLE " + quoteIdentifier(resolved) + " (" + strings.Join(definitions, ",") + ", UNIQUE(service_id,date))"); err != nil {
		return err
	}
	insert, err := tx.Prepare("INSERT OR IGNORE INTO " + quoteIdentifier(resolved) + " (service_id,date,exception_type) VALUES (?,?,'1')")
	if err != nil {
		return err
	}
	defer insert.Close()
	if calendar, found := tables["calendar"]; found {
		weekdays := []string{"sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"}
		if err := require("calendar", append([]string{"service_id", "start_date", "end_date"}, weekdays...)...); err != nil {
			return err
		}
		rows, err := tx.Query("SELECT service_id,start_date,end_date," + strings.Join(weekdays, ",") + " FROM " + quoteIdentifier(calendar))
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var service, startValue, endValue string
			var days [7]string
			if err := rows.Scan(&service, &startValue, &endValue, &days[0], &days[1], &days[2], &days[3], &days[4], &days[5], &days[6]); err != nil {
				return err
			}
			start, err := time.Parse("20060102", startValue)
			if err != nil {
				return fmt.Errorf("calendar.start_date: %w", err)
			}
			end, err := time.Parse("20060102", endValue)
			if err != nil {
				return fmt.Errorf("calendar.end_date: %w", err)
			}
			if config.Date_range != nil {
				lower, _ := time.Parse("20060102", strconv.Itoa(config.Date_range.Start))
				upper, _ := time.Parse("20060102", strconv.Itoa(config.Date_range.End))
				if start.Before(lower) {
					start = lower
				}
				if end.After(upper) {
					end = upper
				}
			}
			add := func(date time.Time) error {
				value := date.Format("20060102")
				if !date.Before(start) && !date.After(end) && days[date.Weekday()] == "1" && matches(value) {
					_, err := insert.Exec(service, value)
					return err
				}
				return nil
			}
			if len(config.Discrete_dates) != 0 {
				for _, value := range config.Discrete_dates {
					date, _ := time.Parse("20060102", strconv.Itoa(value))
					if err := add(date); err != nil {
						return err
					}
				}
			} else {
				for date := start; !date.After(end); date = date.AddDate(0, 0, 1) {
					if err := add(date); err != nil {
						return err
					}
				}
			}
		}
		if err := rows.Err(); err != nil {
			return err
		}
		rows.Close()
		// All selected services are represented by resolved calendar_dates rows.
		if _, err := tx.Exec("DELETE FROM " + quoteIdentifier(calendar)); err != nil {
			return err
		}
	}
	if exceptions, found := tables["calendar_dates"]; found {
		rows, err := tx.Query("SELECT " + strings.Join(quotedColumns, ",") + " FROM " + quoteIdentifier(exceptions))
		if err != nil {
			return err
		}
		defer rows.Close()
		replace, err := tx.Prepare("INSERT OR REPLACE INTO " + quoteIdentifier(resolved) + " (" + strings.Join(quotedColumns, ",") + ") VALUES (" + strings.Join(placeholders, ",") + ")")
		if err != nil {
			return err
		}
		defer replace.Close()
		remove, err := tx.Prepare("DELETE FROM " + quoteIdentifier(resolved) + " WHERE service_id=? AND date=?")
		if err != nil {
			return err
		}
		defer remove.Close()
		for rows.Next() {
			values := make([]any, len(datesHeader))
			pointers := make([]any, len(values))
			for i := range values {
				pointers[i] = &values[i]
			}
			if err := rows.Scan(pointers...); err != nil {
				return err
			}
			service := values[slices.Index(datesHeader, "service_id")]
			date, _ := values[slices.Index(datesHeader, "date")].(string)
			if !matches(date) {
				continue
			}
			switch values[slices.Index(datesHeader, "exception_type")] {
			case "1":
				_, err = replace.Exec(values...)
			case "2":
				_, err = remove.Exec(service, date)
			default:
				return fmt.Errorf("time_range: invalid calendar_dates.exception_type")
			}
			if err != nil {
				return err
			}
		}
		if err := rows.Err(); err != nil {
			return err
		}
		rows.Close()
		if _, err := tx.Exec("DROP TABLE " + quoteIdentifier(exceptions)); err != nil {
			return err
		}
	}
	tables["calendar_dates"] = resolved
	headers["calendar_dates"] = datesHeader

	// Index the references used by pruning, including large stop_times feeds.
	for table, columns := range map[string][]string{"trips": {"service_id", "trip_id", "route_id", "shape_id"}, "stop_times": {"trip_id", "stop_id"}, "stops": {"stop_id"}} {
		for _, column := range columns {
			if slices.Contains(headers[table], column) {
				if _, err := tx.Exec("CREATE INDEX " + quoteIdentifier(prefix+table+"_"+column) + " ON " + quoteIdentifier(tables[table]) + " (" + quoteIdentifier(column) + ")"); err != nil {
					return err
				}
			}
		}
	}
	prune := func(table, column, reference, referenceColumn string) error {
		staged, found := tables[table]
		if !found {
			return nil
		}
		if err := require(table, column); err != nil {
			return err
		}
		query := "DELETE FROM " + quoteIdentifier(staged)
		if parent, found := tables[reference]; found && slices.Contains(headers[reference], referenceColumn) {
			query += " WHERE NOT EXISTS (SELECT 1 FROM " + quoteIdentifier(parent) + " AS reference WHERE reference." + quoteIdentifier(referenceColumn) + " = " + quoteIdentifier(staged) + "." + quoteIdentifier(column) + ")"
		}
		_, err := tx.Exec(query)
		return err
	}
	for _, edge := range [][4]string{{"trips", "service_id", "calendar_dates", "service_id"}, {"stop_times", "trip_id", "trips", "trip_id"}, {"routes", "route_id", "trips", "route_id"}, {"shapes", "shape_id", "trips", "shape_id"}} {
		if err := prune(edge[0], edge[1], edge[2], edge[3]); err != nil {
			return err
		}
	}
	if stops, found := tables["stops"]; found && tables["stop_times"] != "" && slices.Contains(headers["stops"], "parent_station") {
		if err := require("stops", "stop_id"); err != nil {
			return err
		}
		if err := require("stop_times", "stop_id"); err != nil {
			return err
		}
		query := "WITH RECURSIVE retained(stop_id) AS (SELECT stop_id FROM " + quoteIdentifier(tables["stop_times"]) + " UNION SELECT stops.parent_station FROM " + quoteIdentifier(stops) + " AS stops JOIN retained ON stops.stop_id=retained.stop_id WHERE stops.parent_station IS NOT NULL) DELETE FROM " + quoteIdentifier(stops) + " WHERE stop_id NOT IN (SELECT stop_id FROM retained WHERE stop_id IS NOT NULL)"
		if _, err := tx.Exec(query); err != nil {
			return err
		}
	} else if err := prune("stops", "stop_id", "stop_times", "stop_id"); err != nil {
		return err
	}

	for table, staged := range tables {
		columns := make([]string, len(headers[table]))
		for i, column := range headers[table] {
			columns[i] = quoteIdentifier(column)
		}
		if _, err := tx.Exec("CREATE TABLE IF NOT EXISTS main." + quoteIdentifier(table) + " AS SELECT * FROM " + quoteIdentifier(staged) + " WHERE 0"); err != nil {
			return err
		}
		if _, err := tx.Exec("INSERT INTO main." + quoteIdentifier(table) + " (" + strings.Join(columns, ",") + ") SELECT " + strings.Join(columns, ",") + " FROM " + quoteIdentifier(staged)); err != nil {
			return err
		}
		if _, err := tx.Exec("DROP TABLE " + quoteIdentifier(staged)); err != nil {
			return err
		}
	}
	return nil
}
