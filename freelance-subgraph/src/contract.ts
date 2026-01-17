import { AnnouncementCreated as AnnouncementCreatedEvent, 
  FreelancerAssigned as FreelancerAssignedEvent,
  JobStateChanged as JobStateChangedEvent,
  FundsReleased as FundsReleasedEvent,
  AnnouncementUpdated as AnnouncementUpdatedEvent,
  FreelancerRevoked as FreelancerRevokedEvent } from "../generated/Contract/Contract"
import { Announcement, Payment } from "../generated/schema"

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

export function handleFreelancerAssigned(event: FreelancerAssignedEvent): void {
  // Carichiamo l'entità esistente
  let entity = Announcement.load(event.params.id.toString())

  if (entity) {
    entity.freelancer = event.params.freelancer
    entity.status = "InProgress"
    entity.save()
  }
}

export function handleJobStateChanged(event: JobStateChangedEvent): void {
  let entity = Announcement.load(event.params.id.toString())

  if (entity) {
    // Solidity Enum: 0=Open, 1=InProgress, 2=Presentation, 3=Completed, 4=Cancelled
    let state = event.params.newState

    if (state == 0) {
      entity.status = "Open"
    } else if (state == 1) {
      entity.status = "InProgress"
    } else if (state == 2) {
      entity.status = "Presentation"
    } else if (state == 3) {
      entity.status = "Completed"
    } else if (state == 4) {
      entity.status = "Cancelled"
    }

    entity.updatedAt = event.block.timestamp
    entity.save()
  }
}

export function handleFundsReleased(event: FundsReleasedEvent): void {
  // Creiamo un ID univoco per il pagamento: "jobId-txHash"
  let paymentId = event.params.id.toString() + "-" + event.transaction.hash.toHex()
  let payment = new Payment(paymentId)
  
  // Recuperiamo l'annuncio collegato
  let announcement = Announcement.load(event.params.id.toString())

  if (announcement) {
    payment.announcement = announcement.id
    payment.recipient = event.params.recipient
    payment.amount = event.params.amount
    payment.timestamp = event.block.timestamp

    // Logica per determinare il tipo di pagamento
    // Se lo stato dell'annuncio è 'Cancelled', allora è un rimborso al client.
    // Se è 'Completed', è un pagamento al freelancer.
    if (announcement.status == "Cancelled") {
      payment.type = "Refund"
    } else {
      payment.type = "Payment"
    }

    payment.save()
  }
}

export function handleAnnouncementUpdated(event: AnnouncementUpdatedEvent): void {
  let entity = Announcement.load(event.params.id.toString())

  if (entity) {
    entity.dataHash = event.params.newDataHash
    
    entity.updatedAt = event.block.timestamp
    
    entity.save()
  }
}

export function handleFreelancerRevoked(event: FreelancerRevokedEvent): void {
  let entity = Announcement.load(event.params.id.toString())

  if (entity) {
    // 1. Rimuoviamo il freelancer (mettiamo null)
    entity.freelancer = null
    
    // 2. Rimettiamo lo stato a Open
    // (Anche se l'evento JobStateChanged lo farebbe, è meglio essere espliciti qui per pulizia immediata)
    entity.status = "Open"
    
    entity.updatedAt = event.block.timestamp
    entity.save()
  }
}
