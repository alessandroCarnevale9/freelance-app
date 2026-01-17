// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract Freelance is ReentrancyGuard {
    enum JobStatus { Open, InProgress, Presentation, Completed, Cancelled }

    struct Announcement {
        address client;
        address freelancer;
        uint256 budget;
        uint256 deadline;
        string dataHash;
        JobStatus state;
    }

    mapping(uint256 => Announcement) public announcements;
    uint256 public announcementCount;

    event AnnouncementCreated(uint256 indexed id, address indexed client, uint256 budget, uint256 deadline, string dataHash);
    event FreelancerAssigned(uint256 indexed id, address indexed freelancer);
    event JobStateChanged(uint256 indexed id, JobStatus newState);
    event FundsReleased(uint256 indexed id, address indexed recipient, uint256 amount);
    event AnnouncementUpdated(uint256 indexed id, string newDataHash);
    event FreelancerRevoked(uint256 indexed id);

    modifier onlyClient(uint256 _jobId) {
        console.log("Verifica client", msg.sender);
        console.log("Cliente:", announcements[_jobId].client);
        require(msg.sender == announcements[_jobId].client, "Solo il client puo' eseguire questa azione");
        _;
    }

    function createAnnouncement(string calldata _dataHash, uint256 _deadline) external payable {
        require(msg.value > 0, "Budget > 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        console.log("Creazione annuncio da:", msg.sender);
        console.log("Budget:", msg.value);
        
        announcements[announcementCount] = Announcement({
            client: msg.sender,
            freelancer: address(0),
            budget: msg.value,
            deadline: _deadline,
            dataHash: _dataHash,
            state: JobStatus.Open
        });

        emit AnnouncementCreated(announcementCount, msg.sender, msg.value, _deadline, _dataHash);
        announcementCount++;
    }

    function setFreelancer(uint256 _jobId, address _freelancer) external onlyClient(_jobId) {
        Announcement storage job = announcements[_jobId];

        require(job.state == JobStatus.Open, "L'annuncio non e' nello stato Open");
        require(_freelancer != address(0), "Indirizzo freelancer non valido");

        job.freelancer = _freelancer;
        job.state = JobStatus.InProgress;
        emit FreelancerAssigned(_jobId, _freelancer);
    }

    function requestPresentation(uint256 _jobId) external onlyClient(_jobId) {
        Announcement storage job = announcements[_jobId];

        require(job.state == JobStatus.InProgress, "Stato non valido: il lavoro deve essere InProgress");

        job.state = JobStatus.Presentation;
        emit JobStateChanged(_jobId, JobStatus.Presentation);
    }

    function completeJob(uint256 _jobId) external onlyClient(_jobId) nonReentrant {
        Announcement storage job = announcements[_jobId];

        require(job.state == JobStatus.Presentation, "Stato non valido: il lavoro deve essere in Presentation");

        console.log("Budget del Job:", job.budget);
        console.log("Saldo totale del Contratto:", address(this).balance);
        console.log("Indirizzo Freelancer:", job.freelancer);

        require(address(this).balance >= job.budget, "ERRORE CRITICO: Il contratto non ha i fondi!");

        job.state = JobStatus.Completed;
        emit JobStateChanged(_jobId, JobStatus.Completed);

        uint256 amount = job.budget;
        job.budget = 0;

        (bool success, ) = job.freelancer.call{value: amount}("");
        require(success, "Trasferimento fondi fallito");

        emit FundsReleased(_jobId, job.freelancer, amount);
    }

    function updateAnnouncementData(uint256 _jobId, string calldata _newDataHash) external onlyClient(_jobId) {
        Announcement storage job = announcements[_jobId];
        
        // Permetti la modifica solo se il lavoro non è ancora stato completato o cancellato
        require(job.state == JobStatus.Open || job.state == JobStatus.Presentation, "Impossibile modificare questo annuncio");

        job.dataHash = _newDataHash;
        
        emit AnnouncementUpdated(_jobId, _newDataHash);
    }

    function updateAnnouncementDataAfterPresentation(uint256 _jobId, string calldata _newDataHash) external onlyClient(_jobId) {
        Announcement storage job = announcements[_jobId];
        
        // Permetti la modifica solo se il lavoro non è ancora stato completato o cancellato
        require(job.state == JobStatus.Open || job.state == JobStatus.Presentation, "Impossibile modificare questo annuncio");
        job.state = JobStatus.InProgress;
        emit JobStateChanged(_jobId, JobStatus.InProgress);

        job.dataHash = _newDataHash;
        
        emit AnnouncementUpdated(_jobId, _newDataHash);
    }

    function reOpenAnnouncement(uint256 _jobId) external onlyClient(_jobId) {
        Announcement storage job = announcements[_jobId];

        require(job.state == JobStatus.Presentation, "Stato non valido per revocare il freelancer");

        job.freelancer = address(0);
        job.state = JobStatus.Open;

        emit FreelancerRevoked(_jobId);
    }

    // function cancelJob(uint256 _jobId) external onlyClient(_jobId) nonReentrant {
    //     Announcement storage job = announcements[_jobId];

    //     require(job.state == JobStatus.Open, "Impossibile cancellare: job gia' assegnato o chiuso");

    //     job.state = JobStatus.Cancelled;
    //     emit JobStateChanged(_jobId, JobStatus.Cancelled);

    //     uint256 amount = job.budget;
    //     job.budget = 0;

    //     (bool success, ) = msg.sender.call{value: amount}("");
    //     require(success, "Rimborso al client fallito");

    //     emit FundsReleased(_jobId, msg.sender, amount);
    // }
}