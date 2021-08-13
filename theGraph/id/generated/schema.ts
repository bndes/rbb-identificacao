// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Account extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Account entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Account entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Account", id.toString(), this);
  }

  static load(id: string): Account | null {
    return store.get("Account", id) as Account | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get addr(): Bytes {
    let value = this.get("addr");
    return value.toBytes();
  }

  set addr(value: Bytes) {
    this.set("addr", Value.fromBytes(value));
  }

  get RBBId(): BigInt {
    let value = this.get("RBBId");
    return value.toBigInt();
  }

  set RBBId(value: BigInt) {
    this.set("RBBId", Value.fromBigInt(value));
  }

  get CNPJ(): BigInt | null {
    let value = this.get("CNPJ");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set CNPJ(value: BigInt | null) {
    if (value === null) {
      this.unset("CNPJ");
    } else {
      this.set("CNPJ", Value.fromBigInt(value as BigInt));
    }
  }

  get responsible(): Bytes | null {
    let value = this.get("responsible");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set responsible(value: Bytes | null) {
    if (value === null) {
      this.unset("responsible");
    } else {
      this.set("responsible", Value.fromBytes(value as Bytes));
    }
  }

  get reason(): i32 {
    let value = this.get("reason");
    return value.toI32();
  }

  set reason(value: i32) {
    this.set("reason", Value.fromI32(value));
  }

  get hashProof(): string | null {
    let value = this.get("hashProof");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set hashProof(value: string | null) {
    if (value === null) {
      this.unset("hashProof");
    } else {
      this.set("hashProof", Value.fromString(value as string));
    }
  }

  get dateTimeExpiration(): BigInt | null {
    let value = this.get("dateTimeExpiration");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set dateTimeExpiration(value: BigInt | null) {
    if (value === null) {
      this.unset("dateTimeExpiration");
    } else {
      this.set("dateTimeExpiration", Value.fromBigInt(value as BigInt));
    }
  }
}
