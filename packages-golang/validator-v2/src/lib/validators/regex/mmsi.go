package regex

import "regexp"

var MMSIRegex = regexp.MustCompile(`^[2-7]\d{8}$`)