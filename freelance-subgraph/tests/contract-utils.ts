import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import { AnnouncementCreated } from "../generated/Contract/Contract"

export function createAnnouncementCreatedEvent(
  id: BigInt,
  client: Address,
  budget: BigInt,
  deadline: BigInt,
  dataHash: string
): AnnouncementCreated {
  let announcementCreatedEvent = changetype<AnnouncementCreated>(newMockEvent())

  announcementCreatedEvent.parameters = new Array()

  announcementCreatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  announcementCreatedEvent.parameters.push(
    new ethereum.EventParam("client", ethereum.Value.fromAddress(client))
  )
  announcementCreatedEvent.parameters.push(
    new ethereum.EventParam("budget", ethereum.Value.fromUnsignedBigInt(budget))
  )
  announcementCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "deadline",
      ethereum.Value.fromUnsignedBigInt(deadline)
    )
  )
  announcementCreatedEvent.parameters.push(
    new ethereum.EventParam("dataHash", ethereum.Value.fromString(dataHash))
  )

  return announcementCreatedEvent
}
