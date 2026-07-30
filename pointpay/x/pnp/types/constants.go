package types

// Native coin constants — see chain/ROADMAP.md / SECURITY.md
const (
	// DisplayDenom is the human symbol.
	DisplayDenom = "PNP"
	// BaseDenom is the on-chain denom (6 decimals).
	BaseDenom = "upnp"
	// BondDenom is CometBFT staking denom (separate from PNP user asset).
	BondDenom = "stake"
	// Decimals for BaseDenom vs DisplayDenom.
	Decimals = 6
	// MaxSupplyDisplay is 1 crore PNP.
	MaxSupplyDisplay uint64 = 10_000_000
	// DefaultMaxSupply is max supply in base units (upnp).
	DefaultMaxSupply uint64 = MaxSupplyDisplay * 1_000_000 // 10_000_000_000_000
)

// Economy module account name suffixes (auth module accounts) — funded at genesis.
const (
	PoolSale      = "pnp_sale"
	PoolMarketing = "pnp_marketing"
	PoolCreator   = "pnp_creator"
	PoolFounder   = "pnp_founder"
)

// VaultModuleAccount returns module account name for a calendar year vault.
func VaultModuleAccount(year int) string {
	return "pnp_vault_" + itoa(year)
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	var b [16]byte
	i := len(b)
	for n > 0 {
		i--
		b[i] = byte('0' + n%10)
		n /= 10
	}
	return string(b[i:])
}
