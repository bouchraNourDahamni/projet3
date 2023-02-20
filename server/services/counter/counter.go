package counter

// Counter : act like a ticket machine
func Counter(startID uint64, counterChan chan uint64, callbacks ...func(uint64)) {
	ID := startID
	for {
		counterChan <- ID
		ID++
		for _, fn := range callbacks {
			fn(ID)
		}
	}
}
