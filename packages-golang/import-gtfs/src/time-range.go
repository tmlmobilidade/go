package importgtfs

import (
	"fmt"
	"strconv"
	"time"
)

// Validates requested dates and returns a date-matching function.
// A nil result means there is no filter: import the original rows unchanged.
func prepareDateFilter(config *ImportGtfsConfigTimeRange) (func(string) bool, error) {
	if config == nil || (config.Date_range == nil && len(config.Discrete_dates) == 0) {
		return nil, nil
	}

	// YYYYMMDD means four digits for the year, then two each for month and day.
	// Go uses the example date 20060102 to describe that format to its date parser.
	validate := func(date int) error {
		value := strconv.Itoa(date)
		if len(value) != 8 {
			return fmt.Errorf("time_range: invalid YYYYMMDD date %d", date)
		}
		if _, err := time.Parse("20060102", value); err != nil {
			return fmt.Errorf("time_range: invalid YYYYMMDD date %d: %w", date, err)
		}
		return nil
	}

	// Check both range endpoints, including real calendar dates and their order.
	var start, end string
	if config.Date_range != nil {
		if err := validate(config.Date_range.Start); err != nil {
			return nil, err
		}
		if err := validate(config.Date_range.End); err != nil {
			return nil, err
		}
		if config.Date_range.Start > config.Date_range.End {
			return nil, fmt.Errorf("time_range: date_range.start must not be after date_range.end")
		}
		start = strconv.Itoa(config.Date_range.Start)
		end = strconv.Itoa(config.Date_range.End)
	}

	// Store individual dates as a set: repeated dates need only one entry.
	// The empty struct is a placeholder; only the map keys matter.
	dates := make(map[string]struct{}, len(config.Discrete_dates))
	for _, date := range config.Discrete_dates {
		if err := validate(date); err != nil {
			return nil, err
		}
		dates[strconv.Itoa(date)] = struct{}{}
	}

	// A date must pass both configured filters. Eight-digit YYYYMMDD strings
	// sort in calendar order, so string comparisons also compare dates.
	return func(date string) bool {
		if start != "" && (date < start || date > end) {
			return false
		}
		if len(dates) != 0 {
			_, found := dates[date]
			return found
		}
		return true
	}, nil
}
