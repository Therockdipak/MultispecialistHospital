// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "hardhat/console.sol";

contract MultispecialistHospital {
    address public owner;
    uint256 public totalBeds;
    uint256 public availableBeds;

    struct Patient {
        address patient;
        string name;
        uint256 admissionDate;
        uint256 dischargeDate;
        bool isAdmitted;
        uint256 bedNumber; // Add bed number for patients
    }

    struct Doctor {
        string name;
        address doctor;
        string speciality;
        uint256 billIssued;
    }

    struct Bed {
        string patientName;
        bool isAvailable;
    }

    mapping(address => Patient) public patients;
    mapping(address => Doctor) public doctors;
    mapping(uint256 => Bed) public beds;

    event newPatientRegistered(address patient, string name);
    event newDoctorRegistered(address doctor, string name, string speciality);
    event patientAdmitted(address patient, address doctor, uint256 bedNumber); // Update event signature
    event fundsDeposited(address patient,address doctor, uint256 amount);
    event billPaid(address patient, uint256 amount);
    event patientDischarged(address patient);

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    modifier onlyDoctor() {
        require(bytes(doctors[msg.sender].name).length > 0, "Only registered doctor can call this function");
        _;
    }

    modifier onlyPatient() {
        require(bytes(patients[msg.sender].name).length > 0, "Only registered patient can call this function");
        _;
    }

    constructor(uint256 _totalBeds) {
        owner = msg.sender;
        totalBeds = _totalBeds;
        availableBeds = _totalBeds;

        // Initialize all beds as available at the start
        for (uint256 i = 0; i < _totalBeds; i++) {
            beds[i] = Bed("", true);
        }
    }


    function registerPatient(string memory name, address _patient) public {
        require(bytes(patients[msg.sender].name).length == 0, "You are already a registered patient");
        patients[_patient] = Patient(msg.sender, name, block.timestamp, 0, false, 0); // Initialize bedNumber to 0
        emit newPatientRegistered(msg.sender, name);
    }

    function registerDoctor(address _doctor, string memory name, string memory speciality) public onlyOwner {
        require(bytes(doctors[_doctor].name).length == 0, "Doctor is already registered");
        doctors[_doctor] = Doctor(name, msg.sender, speciality, 0);
        emit newDoctorRegistered(msg.sender, name, speciality);
    }

    function admitPatient(address patient, uint256 bed) public onlyDoctor {
        require(bytes(patients[patient].name).length > 0, "Only registered patients can admit, please register first");
        require(bed > 0 && bed <= totalBeds, "Invalid bed number");
        require(beds[bed].isAvailable, "Bed is currently not available");
        require(!patients[patient].isAdmitted, "Patient is already admitted");
        patients[patient].isAdmitted = true;
        patients[patient].bedNumber = bed; // Assign the bed number to the patient
        beds[bed].patientName = patients[patient].name;
        beds[bed].isAvailable = false;
        emit patientAdmitted(patient, msg.sender, bed);
        availableBeds--;
    }

    function issueBill(address _patient, uint256 _amount) public onlyDoctor {
        require(bytes(patients[_patient].name).length > 0,"patient does not exist");
        uint256 bill = doctors[msg.sender].billIssued = _amount;
        require(_amount == bill, "invalid amount");
    }

    function dischargePatient(address _patient) public payable onlyDoctor {
         address doctor = msg.sender;
         require(patients[_patient].isAdmitted,"invalid patient");
        uint256 billAmount = doctors[doctor].billIssued;
        require(billAmount > 0, "no bill issued by the doctor");

        payable (doctor).transfer(billAmount);
        // Reset the patient's billIssued to 0
        doctors[doctor].billIssued = 0;

        // discharge the patient
        beds[patients[_patient].bedNumber].patientName = " " ;
        beds[patients[_patient].bedNumber].isAvailable = true;
        patients[_patient].isAdmitted = false;
        patients[_patient].bedNumber = 0;

        emit patientDischarged(_patient);
        availableBeds++;
    }

    function payBills() public payable onlyPatient {
        require(msg.value > 0, "invalid amount");
        require(msg.value >= doctors[msg.sender].billIssued,"bill amount should be match with issueBill");
    }

}
