package variables

import (
	"regexp"
	"strings"
)

var MMSIRegex = regexp.MustCompile(`^[2-7]\d{8}$`)

var PlateRegex = regexp.MustCompile(`^(?:[A-Z]{2}\d{2}[A-Z]{2}|\d{2}[A-Z]{2}\d{2}|\d{4}[A-Z]{2}|[A-Z]{2}\d{4})$`)

// PhoneRegex validates the allowed phone characters.
var PhoneRegex = regexp.MustCompile(`^[0-9A-Za-z\s\-\+$begin:math:text$$end:math:text$]+$`)

// PhoneDigitRegex identifies digits when checking phone length.
var PhoneDigitRegex = regexp.MustCompile(`[0-9]`)

const DefaultPatternIDFormat = "XXXX_X_X"

var DefaultPatternIDRegex = regexp.MustCompile(`^[^_]{1,4}_[^_]_[^_]$`)
var PatternIDDisplayReplacer = strings.NewReplacer(
	`[^_]{1,4}`, "XXXX", `[^_]`, "X", `^`, "", `$`, "", `\`, "", `(`, "", `)`, "",
)
