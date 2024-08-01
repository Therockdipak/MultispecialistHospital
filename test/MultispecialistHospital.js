const { expect } = require("chai");

describe("MultispecialistHospital", () => {
  let contract;
  let owner;
  let doctor;
  let patient1;
  let patientAddress;

  beforeEach(async () => {
    [owner, doctor, patient1] = await ethers.getSigners();
    const totalBeds = 100;
    contract = await ethers.deployContract("MultispecialistHospital", [
      totalBeds,
    ]);

    await contract.waitForDeployment();
    console.log(
      `MultispecialistHospital deployed at ${await contract.getAddress()}`
    );

    // register owner, doctor and patient
    await contract
      .connect(owner)
      .registerDoctor(doctor.address, "Dr Dongre", "homeopathy");
    await contract.registerPatient("Dipak", patient1.address);
    patientAddress = patient1.address;
  });

  it("should admit a patient", async () => {
    await contract.connect(doctor).admitPatient(patientAddress, 1);
    const bedInfo = await contract.beds(1);

    expect(bedInfo.patientName).to.equal("Dipak");
    expect(bedInfo.isAvailable).to.equal(false);
  });

  it("should issue a bill by doctor", async () => {
    await contract.connect(doctor).issueBill(patientAddress, 200);
    const doctorInfo = await contract.doctors(doctor.address);
    expect(doctorInfo.billIssued).to.equal(200);
  });

  it("should discharge a patient", async () => {
    const bedInfoBeforeAddmission = await contract.beds(1);
    expect(bedInfoBeforeAddmission.isAvailable).to.equal(true);
    await contract.connect(doctor).admitPatient(patientAddress, 1);
    const bedInfo = await contract.beds(1);
    expect(bedInfo.patientName).to.equal("Dipak");
    expect(bedInfo.isAvailable).to.equal(false);

    await contract.connect(doctor).issueBill(patientAddress, 200);
    const doctorInfo = await contract.doctors(doctor.address);
    expect(doctorInfo.billIssued).to.equal(200);

    await contract.connect(patient1).payBills({ value: 200 });

    await contract.connect(doctor).dischargePatient(patientAddress);
    const bedInfoAfterDischarge = await contract.beds(1);
    const doctorInfoAfterDischarge = await contract.doctors(doctor.address);

    expect(bedInfoAfterDischarge.patientName).to.equal(" ");
    expect(bedInfoAfterDischarge.isAvailable).to.equal(true);
    expect(doctorInfoAfterDischarge.billIssued).to.equal(0);
  });

  it("should pay the bills by the patient", async () => {
    await contract.connect(doctor).issueBill(patientAddress, 100);
    await expect(
      contract.connect(patient1).payBills({ value: 100 })
    ).to.changeEtherBalance(patient1, -100);
  });
});
