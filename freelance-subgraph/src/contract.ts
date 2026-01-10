import { AnnouncementCreated as AnnouncementCreatedEvent, FreelancerAssigned } from "../generated/Contract/Contract"
import { Announcement } from "../generated/schema"

export function handleAnnouncementCreated(
  event: AnnouncementCreatedEvent
): void {
  let job = new Announcement(event.params.id.toString())

  job.client = event.params.client
  job.budget = event.params.budget
  job.status = "Open"
  
  job.deadline = event.params.deadline 
  job.dataHash = event.params.dataHash
  
  job.createdAt = event.block.timestamp
  job.updatedAt = event.block.timestamp
  job.save()
}

export function handleFreelancerAssigned(event: FreelancerAssigned): void {
  // Carichiamo l'entità esistente
  let entity = Announcement.load(event.params.id.toString())

  if (entity) {
    entity.freelancer = event.params.freelancer
    entity.status = "InProgress"
    entity.save()
  }
}
