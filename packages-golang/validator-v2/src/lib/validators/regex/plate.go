package regex

import "regexp"

var PlateRegex = regexp.MustCompile(`^(?:[A-Z]{2}\d{2}[A-Z]{2}|\d{2}[A-Z]{2}\d{2}|\d{4}[A-Z]{2}|[A-Z]{2}\d{4})$`)