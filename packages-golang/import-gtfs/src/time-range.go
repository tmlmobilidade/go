package importgtfs

import (
	"fmt"
	"strconv"
	"time"
)

// A nil filter preserves the raw import behavior when no dates are configured.
func prepareDateFilter(config *ImportGtfsConfigTimeRange) (func(string) bool, error) {
	if config == nil || (config.Date_range == nil && len(config.Discrete_dates) == 0) {
		return nil, nil
	}
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
	dates := make(map[string]struct{}, len(config.Discrete_dates))
	for _, date := range config.Discrete_dates {
		if err := validate(date); err != nil {
			return nil, err
		}
		dates[strconv.Itoa(date)] = struct{}{}
	}
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
