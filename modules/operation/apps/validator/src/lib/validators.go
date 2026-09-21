package lib

import (
	"main/types"
	"net/mail"
	"net/url"
	"regexp"
	"slices"
	"strconv"
	"strings"
	"time"
)

func ValidateTimezone(timezone string) bool {
	_, err := time.LoadLocation(timezone)
	return err == nil
}

func isHex(c byte) bool {
	return (c >= '0' && c <= '9') ||
		(c >= 'a' && c <= 'f') ||
		(c >= 'A' && c <= 'F')
}

func ValidateUrl(u string) bool {
	u = strings.TrimSpace(u)
	if u == "" {
		return false
	}

	// Disallowed characters (RFC 3986 + common breakages)
	if strings.ContainsAny(u, ` "<>{}|"'\^`) {
		return false
	}

	// Validate percent-encoding
	for i := 0; i < len(u); i++ {
		if u[i] == '%' {
			if i+2 >= len(u) ||
				!isHex(u[i+1]) ||
				!isHex(u[i+2]) {
				return false
			}
			i += 2
		}
	}

	parsedUrl, err := url.ParseRequestURI(u)
	if err != nil {
		return false
	}

	if parsedUrl.Scheme != "http" && parsedUrl.Scheme != "https" {
		return false
	}

	if parsedUrl.Host == "" {
		return false
	}

	return true
}

func ValidateEmail(e string) bool {
	e = strings.TrimSpace(e)
	if e == "" {
		return false
	}
	_, err := mail.ParseAddress(e)
	return err == nil
}

func ValidatePhone(p string) bool {
	input := strings.TrimSpace(p)
	if input == "" {
		return false
	}

	// This regex allows:
	// - Digits
	// - Letters (for dialable text like "RIDE")
	// - Punctuation: ()-+ and spaces
	// - But no other characters like @, #, $, descriptive text
	var validPhonePattern = regexp.MustCompile(`^[0-9A-Za-z\s\-\+$begin:math:text$$end:math:text$]+$`)

	// Check if input matches allowed characters
	if !validPhonePattern.MatchString(input) {
		return false
	}

	// (Optional) You could also add rules to ensure at least some digits exist
	digits := regexp.MustCompile(`[0-9]`)
	digitMatches := digits.FindAllString(input, -1)

	return len(digitMatches) >= 7
}

func ValidateLongitude(lon float64) bool {
	return lon >= -180 && lon <= 180
}

func ValidateLatitude(lat float64) bool {
	return lat >= -90 && lat <= 90
}

func ValidateLanguage(lang string) bool {
	validISO6391 := []string{"ab", "aa", "af", "ak", "sq", "am", "ar", "an", "hy", "as", "av", "ae", "ay", "az", "bm", "ba", "eu", "be", "bn", "bh", "bi", "bs", "br", "bg", "my", "ca", "ch", "ce", "ny", "zh", "cv", "kw", "co", "cr", "hr", "cs", "da", "dv", "nl", "dz", "en", "eo", "et", "ee", "fo", "fj", "fi", "fr", "ff", "gl", "ka", "de", "el", "gn", "gu", "ht", "ha", "he", "hz", "hi", "ho", "hu", "ia", "id", "ie", "ga", "ig", "ik", "io", "is", "it", "iu", "ja", "jv", "kl", "kn", "kr", "ks", "kk", "km", "ki", "rw", "ky", "kv", "kg", "ko", "ku", "kj", "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv", "gv", "mk", "mg", "ms", "ml", "mt", "mi", "mr", "mh", "mn", "na", "nv", "nd", "ne", "ng", "nb", "nn", "no", "ii", "nr", "oc", "oj", "cu", "om", "or", "os", "pa", "pi", "fa", "pl", "ps", "pt", "qu", "rm", "rn", "ro", "ru", "sa", "sc", "sd", "se", "sm", "sg", "sr", "gd", "sn", "si", "sk", "sl", "so", "st", "es", "su", "sw", "ss", "sv", "ta", "te", "tg", "th", "ti", "bo", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "cy", "wo", "fy", "xh", "yi", "yo", "za", "zu"}
	return slices.Contains(validISO6391, strings.ToLower(lang))
}

func IsValidServiceDate(date string) bool {
	if len(date) != 8 {
		return false
	}

	// Convert the date to the format YYYY-MM-DD for the time.Parse function validation
	newDate := date[:4] + "-" + date[4:6] + "-" + date[6:]

	_, err := time.Parse(time.DateOnly, newDate)
	return err == nil
}

func ValidateCurrencyType(currencyType string) bool {
	validCurrencyTypes := []string{
		"AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CKD", "CLP", "CNY", "COP", "CRC", "CUC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "EHP", "ERN", "ETB", "EUR", "FJD", "FKP", "FOK", "GBP", "GEL", "GGP", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS", "IMP", "INR", "IQD", "IRR", "ISK", "JEP", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KID", "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PND", "PRB", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLL", "SLS", "SOS", "SRD", "SSP", "STN", "SVC", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TVD", "TWD", "TZS", "UAH", "UGX", "USD", "UYU", "UZS", "VED", "VES", "VND", "VUV", "WST", "XAF", "XCD", "XOF", "XPF", "YER", "ZAR", "ZMW", "ZWB", "ZWL"}

	return slices.Contains(validCurrencyTypes, strings.ToUpper(currencyType))
}

func ValidateTime(t string) bool {
	if len(t) != 8 {
		return false
	}

	splits := strings.Split(t, ":")
	if len(splits) != 3 {
		return false
	}

	// Check if all splits are numbers
	for _, split := range splits {
		if _, err := strconv.Atoi(split); err != nil {
			return false
		}
	}

	return true
}

var plateRegex = regexp.MustCompile(`^(?:[A-Z]{2}\d{2}[A-Z]{2}|\d{2}[A-Z]{2}\d{2}|\d{4}[A-Z]{2}|[A-Z]{2}\d{4})$`)

func normalizeLicensePlate(licensePlate string) string {
	s := strings.ToUpper(strings.TrimSpace(licensePlate))
	var b strings.Builder
	b.Grow(len(s))
	for _, r := range s {
		switch r {
		case '-', ' ', '.', '_', '\u00A0', '\u202F':
			// ignore common separators (hyphen, space, dot, underscore, NBSP, narrow NBSP)
		default:
			b.WriteRune(r)
		}
	}
	return b.String()
}

func ValidateLicensePlate(licensePlate string) bool {
	licensePlate = normalizeLicensePlate(licensePlate)

	if len(licensePlate) != 6 {
		return false
	}

	return plateRegex.MatchString(licensePlate)
}

// KeyExists checks if a given key exists in a map.
func GtfsIdMapKeyExists(gtfs *types.Gtfs, fileName string, key string) bool {
	if gtfs.IdMap == nil {
		return false
	}

	rows, ok := gtfs.IdMap[fileName]
	if !ok || rows == nil {
		return false
	}

	_, ok = rows[key]
	return ok && len(rows[key]) > 0
}
