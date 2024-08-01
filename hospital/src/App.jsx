import { useState, useEffect } from 'react';
import {ethers} from "ethers";
import abi from "./contract/MultispecialistHospital.json";
import './App.css'

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [admissionAmount, setAdmissionAmount] = useState(0);
  const [transactionHash, setTransactionHash] = useState('');
  const [isTransactionPending, setIsTransactionPending] = useState(false);

  useEffect( async () =>{
     if(window.ethereum) {
      try{
          await window.ethereum.request({method:"eth_requestAccounts"});
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
          const contractAbi = abi.abi;

          const contract = new ethers.Contract (
             contractAddress,
             contractAbi,
             signer
          );
          setContract(contract);

          const connectedAccount = await signer.getAddress();
           setAccount(connectedAccount);
      }catch(error) {
        console.error(error);
      }
     }
  },[]);

   const registerPatient = async ()=> {
      if(contract && patientName) {
        try {
          setIsTransactionPending(true);
          const tx = await contract.registerPatient(patientName, {from:account});
          await tx.wait(); //wait for tx to be confirm
          setTransactionHash(tx.hash);
          setIsTransactionPending(false);
        } catch(error) {
          console.error(error);
          setIsTransactionPending(false);
        }
      }
   };

   const AdmitPatient= async ()=> {
    if(contract && admissionAmount > 0) {
      try {
        setIsTransactionPending(true);
        const tx = await contract.AdmitPatient(account, admissionAmount, {from: account});
        await tx.wait(); 
        setTransactionHash(tx.hash);
        setIsTransactionPending(false);
      } catch(error) {
        console.error(error);
        setIsTransactionPending(false);
      }
    }
   }

  return (
    <Container>
      <Row>
        <col>
        <h1>Welcome to KDGB MultiSpeciality Hospital</h1>
        
        </col>
      </Row>
   
      
    </Container>
  )
}

export default App
