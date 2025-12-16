import { AnnouncementCreated as AnnouncementCreatedEvent } from "../generated/Contract/Contract"
import { AnnouncementCreated } from "../generated/schema"

export function handleAnnouncementCreated(
  event: AnnouncementCreatedEvent
): void {
  let entity = new AnnouncementCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.internal_id = event.params.id
  entity.client = event.params.client
  entity.budget = event.params.budget
  entity.deadline = event.params.deadline
  entity.dataHash = event.params.dataHash

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
