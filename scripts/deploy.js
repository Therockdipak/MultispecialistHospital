const { ethers } = require("hardhat");

async function main() {
  const totalBeds = 100;
  const name = "MultispecialistHospital";
  const contract = await ethers.deployContract(name, [totalBeds]);
  await contract.waitForDeployment();

  console.log(`MultispecialistHospital at deployed at ${await contract.getAddress()}`);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
