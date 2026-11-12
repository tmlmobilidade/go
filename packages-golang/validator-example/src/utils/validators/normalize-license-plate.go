package utils

import "strings"

func NormalizeLicensePlate(licensePlate string) string {
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
