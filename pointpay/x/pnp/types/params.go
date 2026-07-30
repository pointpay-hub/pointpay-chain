package types

import (
	"fmt"

	paramtypes "github.com/cosmos/cosmos-sdk/x/params/types"
)

var _ paramtypes.ParamSet = (*Params)(nil)

var (
	KeyMaxSupply = []byte("MaxSupply")
)

// ParamKeyTable the param key table for launch module
func ParamKeyTable() paramtypes.KeyTable {
	return paramtypes.NewKeyTable().RegisterParamSet(&Params{})
}

// NewParams creates a new Params instance
func NewParams(maxSupply uint64) Params {
	return Params{MaxSupply: maxSupply}
}

// DefaultParams returns a default set of parameters
func DefaultParams() Params {
	return NewParams(DefaultMaxSupply)
}

// ParamSetPairs get the params.ParamSet
func (p *Params) ParamSetPairs() paramtypes.ParamSetPairs {
	return paramtypes.ParamSetPairs{
		paramtypes.NewParamSetPair(KeyMaxSupply, &p.MaxSupply, validateMaxSupply),
	}
}

// Validate validates the set of params
func (p Params) Validate() error {
	return validateMaxSupply(p.MaxSupply)
}

func validateMaxSupply(v interface{}) error {
	maxSupply, ok := v.(uint64)
	if !ok {
		return fmt.Errorf("invalid parameter type: %T", v)
	}
	if maxSupply == 0 {
		return fmt.Errorf("max supply must be > 0")
	}
	if maxSupply != DefaultMaxSupply {
		return fmt.Errorf("max supply must equal %d upnp (10M PNP); got %d", DefaultMaxSupply, maxSupply)
	}
	return nil
}
