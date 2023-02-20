package converter

import "strconv"

// base and size of the string being parsed
const (
	BASE = 10
	SIZE = 64
)

// GetID : convert stringID to uint64
func GetID(strID string) (uint64, error) {
	return strconv.ParseUint(strID, BASE, SIZE)
}
