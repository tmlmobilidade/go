package validators

import "time"

func IsValidServiceDate(date string) bool {
	if len(date) != 8 {
		return false
	}

	// Convert the date to the format YYYY-MM-DD for the time.Parse function validation
	newDate := date[:4] + "-" + date[4:6] + "-" + date[6:]

	_, err := time.Parse(time.DateOnly, newDate)
	return err == nil
}