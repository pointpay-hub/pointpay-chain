package main

import (
	"fmt"

	sdk "github.com/cosmos/cosmos-sdk/types"
	authtypes "github.com/cosmos/cosmos-sdk/x/auth/types"

	"github.com/pointpay/pointpay/x/pnp/types"
)

func main() {
	cfg := sdk.GetConfig()
	cfg.SetBech32PrefixForAccount("pnp", "pnppub")
	cfg.Seal()

	names := []string{
		types.PoolSale,
		types.PoolMarketing,
		types.PoolCreator,
		types.PoolFounder,
	}
	for y := 2026; y <= 2034; y++ {
		names = append(names, types.VaultModuleAccount(y))
	}
	for _, n := range names {
		fmt.Printf("%s %s\n", n, authtypes.NewModuleAddress(n).String())
	}
}
