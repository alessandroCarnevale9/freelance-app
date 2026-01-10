import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { AnnouncementCreated } from "../generated/schema"
import { AnnouncementCreated as AnnouncementCreatedEvent } from "../generated/Contract/Contract"
import { handleAnnouncementCreated } from "../src/contract"
import { createAnnouncementCreatedEvent } from "./contract-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let id = BigInt.fromI32(234)
    let client = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let budget = BigInt.fromI32(234)
    let deadline = BigInt.fromI32(234)
    let dataHash = "Example string value"
    let newAnnouncementCreatedEvent = createAnnouncementCreatedEvent(
      id,
      client,
      budget,
      deadline,
      dataHash
    )
    handleAnnouncementCreated(newAnnouncementCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("AnnouncementCreated created and stored", () => {
    assert.entityCount("AnnouncementCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "AnnouncementCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "client",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "AnnouncementCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "budget",
      "234"
    )
    assert.fieldEquals(
      "AnnouncementCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "deadline",
      "234"
    )
    assert.fieldEquals(
      "AnnouncementCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "dataHash",
      "Example string value"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
