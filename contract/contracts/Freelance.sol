// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract Freelance is ReentrancyGuard {
    enum JobStatus {
        Open,
        InProgress,
        Presentation,
        Completed,
        Cancelled
    }

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

    bool public stopped = false;
    address public owner;

    event AnnouncementCreated(
        uint256 indexed id,
        address indexed client,
        uint256 budget,
        uint256 deadline,
        string dataHash
    );
    event FreelancerAssigned(uint256 indexed id, address indexed freelancer);
    event JobStateChanged(uint256 indexed id, JobStatus newState);
    event FundsReleased(
        uint256 indexed id,
        address indexed recipient,
        uint256 amount
    );
    event AnnouncementUpdated(uint256 indexed id, string newDataHash);
    event FreelancerRevoked(uint256 indexed id);
    event ContractStopped(bool status);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Devi essere l'owner per eseguire questa funzione"
        );
        _;
    }

    modifier stopInEmergency() {
        require(!stopped, "Contract is currently stopped due to emergency");
        _;
    }

    modifier onlyInEmergency() {
        require(stopped, "Action allowed only in emergency mode");
        _;
    }

    modifier atStage(uint256 _jobId, JobStatus _stage) {
        require(
            announcements[_jobId].state == _stage,
            "Function cannot be called at this time (Wrong Stage)"
        );
        _;
    }

    modifier transitionAfter(uint256 _jobId, JobStatus _nextStage) {
        _;
        announcements[_jobId].state = _nextStage;
        emit JobStateChanged(_jobId, _nextStage);
    }

    modifier onlyClient(uint256 _jobId) {
        require(
            msg.sender == announcements[_jobId].client,
            "Solo il client puo' eseguire questa azione"
        );
        _;
    }

    function toggleContractActive() external onlyOwner {
        stopped = !stopped;
        emit ContractStopped(stopped);
    }

    function createAnnouncement(
        string calldata _dataHash,
        uint256 _deadline
    ) external payable stopInEmergency {
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

        emit AnnouncementCreated(
            announcementCount,
            msg.sender,
            msg.value,
            _deadline,
            _dataHash
        );
        announcementCount++;
    }

    function setFreelancer(
        uint256 _jobId,
        address _freelancer
    )
        external
        onlyClient(_jobId)
        stopInEmergency
        atStage(_jobId, JobStatus.Open)
        transitionAfter(_jobId, JobStatus.InProgress)
    {
        require(_freelancer != address(0), "Indirizzo freelancer non valido");
        announcements[_jobId].freelancer = _freelancer;
        emit FreelancerAssigned(_jobId, _freelancer);
    }

    function requestPresentation(
        uint256 _jobId
    )
        external
        onlyClient(_jobId)
        atStage(_jobId, JobStatus.InProgress)
        transitionAfter(_jobId, JobStatus.Presentation)
    {}

    function completeJob(
        uint256 _jobId
    )
        external
        onlyClient(_jobId)
        nonReentrant
        atStage(_jobId, JobStatus.Presentation)
        transitionAfter(_jobId, JobStatus.Completed)
    {
        Announcement storage job = announcements[_jobId];

        require(
            address(this).balance >= job.budget,
            "ERRORE CRITICO: Il contratto non ha i fondi!"
        );

        uint256 amount = job.budget;
        job.budget = 0;

        (bool success, ) = job.freelancer.call{value: amount}("");
        require(success, "Trasferimento fondi fallito");

        emit FundsReleased(_jobId, job.freelancer, amount);
    }

    function updateAnnouncementDataAfterPresentation(
        uint256 _jobId,
        string calldata _newDataHash
    )
        external
        onlyClient(_jobId)
        atStage(_jobId, JobStatus.Presentation)
        transitionAfter(_jobId, JobStatus.InProgress)
    {
        announcements[_jobId].dataHash = _newDataHash;
        emit AnnouncementUpdated(_jobId, _newDataHash);
    }

    function reOpenAnnouncement(uint256 _jobId)
     external 
     onlyClient(_jobId)
     atStage(_jobId, JobStatus.Presentation)
     transitionAfter(_jobId, JobStatus.Open)
      {
        announcements[_jobId].freelancer = address(0);

        emit FreelancerRevoked(_jobId);
    }

    function cancelJob(
        uint256 _jobId
    ) external onlyClient(_jobId) 
    nonReentrant
    transitionAfter(_jobId, JobStatus.Cancelled)
     {
        Announcement storage job = announcements[_jobId];
        require(((block.timestamp > job.deadline && (job.state != JobStatus.Completed && job.state != JobStatus.Cancelled)) || (job.state == JobStatus.Open)), "La deadline non e' ancora stata superata");
        uint256 amount = announcements[_jobId].budget;
        announcements[_jobId].budget = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Rimborso al client fallito");

        emit FundsReleased(_jobId, msg.sender, amount);
    }
}
