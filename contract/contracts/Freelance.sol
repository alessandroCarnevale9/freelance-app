// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Freelance is ReentrancyGuard {
    enum JobStatus { Open, InProgress, Completed, Cancelled }

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

    function createAnnouncement(string calldata _dataHash, uint256 _deadline) external payable {
        require(msg.value > 0, "Budget > 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        
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

    function setFreelancer(uint256 _jobId, address _freelancer) external {
        Announcement storage job = announcements[_jobId];
        require(job.state != JobStatus.Completed && job.state != JobStatus.Cancelled, "Job chiuso");
        job.freelancer = _freelancer;
        job.state = JobStatus.InProgress;
        emit FreelancerAssigned(_jobId, _freelancer);
    }

    //da rifare dopo, usando gli eventi
    function getOpenJobs() external view returns (Announcement[] memory, uint256[] memory) {
        // 1. Contiamo quanti lavori sono OPEN per sapere la dimensione dell'array
        uint256 activeCount = 0;
        for (uint256 i = 0; i < announcementCount; i++) {
            if (announcements[i].state == JobStatus.Open) {
                activeCount++;
            }
        }

        // 2. Creiamo gli array in memoria della dimensione giusta
        Announcement[] memory activeJobs = new Announcement[](activeCount);
        uint256[] memory activeJobIds = new uint256[](activeCount);

        // 3. Riempiamo gli array
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < announcementCount; i++) {
            if (announcements[i].state == JobStatus.Open) {
                activeJobs[currentIndex] = announcements[i];
                activeJobIds[currentIndex] = i;
                currentIndex++;
            }
        }

        return (activeJobs, activeJobIds);
    }
}