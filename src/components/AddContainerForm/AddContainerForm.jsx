import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"; // ⬅️ add serverTimestamp
import { db } from "../../firebaseConfig";
import "./AddContainerForm.scss";

const AddContainerForm = () => {
  const [containerNumber, setContainerNumber] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [skuNumber, setSkuNumber] = useState("");
  const [status, setStatus] = useState("In Progress");
  const [crewAssigned, setCrewAssigned] = useState([]);
  const [crewList, setCrewList] = useState([]);
  const [selectedCrew1, setSelectedCrew1] = useState("");
  const [selectedCrew2, setSelectedCrew2] = useState("");

  // 🧭 Fetch crew list from Firestore
  useEffect(() => {
    const fetchCrew = async () => {
      const querySnapshot = await getDocs(collection(db, "crew"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 🧠 Sort alphabetically by first name
      const sortedData = data.sort((a, b) =>
        a.firstName.localeCompare(b.firstName)
      );

      setCrewList(sortedData);
    };
    fetchCrew();
  }, []);

  // 🧠 Get available options for each dropdown (prevent duplicates)
  const availableCrew1 = crewList.filter(
    (member) => member.id !== selectedCrew2
  );
  const availableCrew2 = crewList.filter(
    (member) => member.id !== selectedCrew1
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const assigned = crewList.filter(
        (member) => member.id === selectedCrew1 || member.id === selectedCrew2
      );

      await addDoc(collection(db, "logs"), {
        containerNumber,
        caseNumber,
        skuNumber,
        status,
        crewAssigned: assigned,
        createdAt: serverTimestamp(), // ⬅️ Firestore server timestamp
      });

      // Reset fields
      setContainerNumber("");
      setCaseNumber("");
      setSkuNumber("");
      setStatus("In Progress");
      setSelectedCrew1("");
      setSelectedCrew2("");
      setCrewAssigned([]);
    } catch (error) {
      console.error("Error adding container:", error);
    }
  };

  return (
    <form className="addContainerForm" onSubmit={handleSubmit}>
      <h3>Add New Container</h3>

      <div className="form-group">
        <label>Container #</label>
        <input
          type="text"
          value={containerNumber}
          onChange={(e) => setContainerNumber(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Case Qty</label>
        <input
          type="number"
          value={caseNumber}
          onChange={(e) => setCaseNumber(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label># of SKUs</label>
        <input
          type="number"
          value={skuNumber}
          onChange={(e) => setSkuNumber(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Crew Assigned</label>
        <select
          value={selectedCrew1}
          onChange={(e) => setSelectedCrew1(e.target.value)}
        >
          <option value="">Team Member One</option>
          {availableCrew1.map((crew) => (
            <option key={crew.id} value={crew.id}>
              {crew.firstName} {crew.lastName}
            </option>
          ))}
        </select>

        <select
          value={selectedCrew2}
          onChange={(e) => setSelectedCrew2(e.target.value)}
        >
          <option value="">Team Member Two</option>
          {availableCrew2.map((crew) => (
            <option key={crew.id} value={crew.id}>
              {crew.firstName} {crew.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="In progress">In progress</option>
          <option value="Completed">Completed</option>
          <option value="Not Started">Not Started</option>
        </select>
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};

export default AddContainerForm;
