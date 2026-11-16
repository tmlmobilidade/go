package validators

import (
	"net/url"
	"strings"
)

// ValidateURL reports whether value is a fully qualified HTTP or HTTPS URL.
func ValidateURL(value string) bool {
	value = strings.TrimSpace(value)
	if strings.ContainsAny(value, " \t\r\n\"<>{}|'\\^`") {
		return false
	}
	// Parse does not check escaping inside the raw query string.
	if _, err := url.QueryUnescape(value); err != nil {
		return false
	}
	parsed, err := url.Parse(value)
	return err == nil && (parsed.Scheme == "http" || parsed.Scheme == "https") && parsed.Hostname() != ""
}
