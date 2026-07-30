package types

const (
	// ModuleName defines the module name
	ModuleName = "pnp"

	// StoreKey defines the primary module store key
	StoreKey = ModuleName

	// MemStoreKey defines the in-memory store key
	MemStoreKey = "mem_pnp"
)

var (
	ParamsKey = []byte("p_pnp")
)

func KeyPrefix(p string) []byte {
	return []byte(p)
}
