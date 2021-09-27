import { BigInt } from "@graphprotocol/graph-ts"
import {
  RBBRegistry,
  AccountInvalidation,
  AccountPaused,
  AccountUnpaused,
  AccountRegistration,
  AccountValidation,
} from "../generated/RBBRegistry/RBBRegistry"
import { Account } from "../generated/schema"

export function handleAccountInvalidation(event: AccountInvalidation): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = Account.load(event.params.addr.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new Account(event.params.addr.toHex())

    
  }



  // Entity fields can be set based on event parameters
  entity.addr = event.params.addr
  entity.RBBId = event.params.RBBId
  entity.CNPJ = event.params.CNPJ
  entity.responsible = event.params.responsible
  entity.reason = event.params.reason
  // Entities can be written to the store with `.save()`
  entity.save()
}


export function handleAccountPaused(event: AccountPaused): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = Account.load(event.params.addr.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new Account(event.params.addr.toHex())

    
  }

  // Entity fields can be set based on event parameters
  entity.addr = event.params.addr
  entity.RBBId = event.params.RBBId
  entity.CNPJ = event.params.CNPJ
  entity.responsible = event.params.responsible
  entity.reason = event.params.reason
  // Entities can be written to the store with `.save()`
  entity.save()
}

export function handleAccountUnpaused(event: AccountUnpaused): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = Account.load(event.params.addr.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new Account(event.params.addr.toHex())
  
  }

  // Entity fields can be set based on event parameters
  entity.addr = event.params.addr
  entity.RBBId = event.params.RBBId
  entity.CNPJ = event.params.CNPJ
  entity.responsible = event.params.responsible
  entity.reason = event.params.reason
  // Entities can be written to the store with `.save()`
  entity.save()
}

export function handleAccountRegistration(event: AccountRegistration): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = Account.load(event.params.addr.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new Account(event.params.addr.toHex())
  
  }

  // Entity fields can be set based on event parameters
  entity.addr = event.params.addr
  entity.RBBId = event.params.RBBId
  entity.CNPJ = event.params.CNPJ
  entity.hashProof = event.params.hashProof
  entity.dateTimeExpiration = event.params.dateTimeExpiration
  // Entities can be written to the store with `.save()`
  entity.save()
}


export function handleAccountValidation(event: AccountValidation): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = Account.load(event.params.addr.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new Account(event.params.addr.toHex())

    
  }



  // Entity fields can be set based on event parameters
  entity.addr = event.params.addr
  entity.RBBId = event.params.RBBId
  entity.CNPJ = event.params.CNPJ
  entity.responsible = event.params.responsible
  // Entities can be written to the store with `.save()`
  entity.save()
}
