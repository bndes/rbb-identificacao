import { BigInt } from "@graphprotocol/graph-ts"
import {
  Contract,
  AccountInvalidation,
} from "../generated/Contract/Contract"
import { UserInvalidation } from "../generated/schema"

export function handleAccountInvalidation(event: AccountInvalidation): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = UserInvalidation.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new UserInvalidation(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.addr = event.params.addr
  entity.RBBId = event.params.RBBId
  entity.CNPJ = event.params.CNPJ
  // Entities can be written to the store with `.save()`
  entity.save()
}

