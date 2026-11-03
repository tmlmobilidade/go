package validators

import (
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/validators/regex"
)

// ValidateMMSI checks a Maritime Mobile Service Identity, used to identify the
// vehicle unit when the transport mode is ferry. A ship station MMSI is 9
// digits whose MID (the first three digits) starts with 2-7.
func ValidateMMSI(mmsi string) bool {
	mmsi = strings.TrimSpace(mmsi)
	return regex.MMSIRegex.MatchString(mmsi)
}