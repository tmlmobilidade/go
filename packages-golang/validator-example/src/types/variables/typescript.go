package variables

import "strings"

var TsStringEscaper = strings.NewReplacer(`\`, `\\`, "'", `\'`, "\n", `\n`, "\r", `\r`)
