package validators

import (
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables"
)

// ValidateMMSI checks a Maritime Mobile Service Identity, used to identify the
// vehicle unit when the transport mode is ferry. A ship station MMSI is 9
// digits whose MID (the first three digits) starts with 2-7.
func ValidateMMSI(mmsi string) bool {
	//

	//
	// 1. Trim the MMSI and check if it is empty

	mmsi = strings.TrimSpace(mmsi)
	if mmsi == "" {
		return false
	}

	//	
	// 2. Check if the MMSI is valid
	
	return variables.MMSIRegex.MatchString(mmsi)
}
