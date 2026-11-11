package validators

import "time"

func IsValidServiceDate(date string) bool {
	//

	//
	// 1. Check if the date is a valid service date

	if len(date) != 8 {
		return false
	}

	//
	// 2. Convert the date to the format YYYY-MM-DD for the time.Parse function validation

	newDate := date[:4] + "-" + date[4:6] + "-" + date[6:]

	//
	// 3. Parse the date and check if it is valid

	_, err := time.Parse(time.DateOnly, newDate)

	//
	// 4. Return true if the date is valid, false otherwise

	return err == nil
}
