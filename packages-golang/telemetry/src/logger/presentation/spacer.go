package presentation

import (
	"fmt"
	"os"
)

func Spacer(lines ...int) {
	count := 1
	if len(lines) > 0 {
		count = lines[0]
	}
	for i := 0; i < count; i++ {
		fmt.Fprintln(os.Stdout)
	}
}
