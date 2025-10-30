import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./AddContainerForm.scss";

const AddContainerForm = () => {
  const [formData, setFormData] = useState({
    containerNumber: "",
    caseNumber: "",
    skuNumber: "",
    crewAssigned: [{ firstName: "", lastName: "" }],
    status: "Not Started",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCrewChange = (index, field, value) => {
    const updatedCrew = [...formData.crewAssigned];
    updatedCrew[index][field] = value;
    setFormData({ ...formData, crewAssigned: updatedCrew });
  };

  const addCrewMember = () => {
    setFormData({
      ...formData,
      crewAssigned: [...formData.crewAssigned, { firstName: "", lastName: "" }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "logs"), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      setFormData({
        containerNumber: "",
        caseNumber: "",
        skuNumber: "",
        crewAssigned: [{ firstName: "", lastName: "" }],
        status: "Not Started",
      });
    } catch (error) {
      console.error("Error adding container:", error);
    }
  };

  return (
    <form className="addContainerForm" onSubmit={handleSubmit}>
      <h3>Add New Container</h3>

      <label>Container #</label>
      <input
        type="text"
        name="containerNumber"
        value={formData.containerNumber}
        onChange={handleChange}
        required
      />

      <label>Case Qty</label>
      <input
        type="number"
        name="caseNumber"
        value={formData.caseNumber}
        onChange={handleChange}
        required
      />

      <label># of SKUs</label>
      <input
        type="number"
        name="skuNumber"
        value={formData.skuNumber}
        onChange={handleChange}
        required
      />

      <label>Crew Assigned</label>
      {formData.crewAssigned.map((crew, index) => (
        <div key={index} className="crew-fields">
          <input
            type="text"
            placeholder="First name"
            value={crew.firstName}
            onChange={(e) =>
              handleCrewChange(index, "firstName", e.target.value)
            }
          />
          <input
            type="text"
            placeholder="Last name"
            value={crew.lastName}
            onChange={(e) =>
              handleCrewChange(index, "lastName", e.target.value)
            }
          />
        </div>
      ))}
      <button type="button" onClick={addCrewMember}>
        + Add Crew Member
      </button>

      <label>Status</label>
      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        required
      >
        <option value="Not Started">Not Started</option>
        <option value="In progress">In progress</option>
        <option value="Completed">Completed</option>
      </select>

      <button type="submit" className="submit-btn">
        Submit
      </button>
    </form>
  );
};

export default AddContainerForm;
