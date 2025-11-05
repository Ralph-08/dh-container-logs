import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import NavBar from "../../components/NavBar/NavBar";
import LoadingDonut from "../../components/LoadingDonut/LoadingDonut";
import "./ContainerDetails.scss";

// --- Time and Duration Helper Functions (FIXED) ---

// Converts Firestore Timestamp to a string format suitable for <input type="datetime-local"> (YYYY-MM-DDThh:mm)
const timestampToDateTimeLocal = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return "";
  const date = timestamp.toDate();
  const YYYY = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const DD = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
};

// 💡 FIX: Helper to get a native Date object from either a Timestamp or a Date object
const getDateObject = (timestampOrDate) => {
  if (!timestampOrDate) return null;
  if (typeof timestampOrDate.toDate === "function") {
    return timestampOrDate.toDate();
  }
  // Assume it is already a JavaScript Date object
  return timestampOrDate;
};

const formatSingleTime = (timestampOrDate) => {
  const date = getDateObject(timestampOrDate);
  if (!date || isNaN(date.getTime())) return "N/A";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatFullDate = (timestampOrDate) => {
  const date = getDateObject(timestampOrDate);
  if (!date || isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const calculateDuration = (startTimeStampOrDate, endTimeStampOrDate) => {
  const startDate = getDateObject(startTimeStampOrDate);
  const endDate = getDateObject(endTimeStampOrDate);

  if (
    !startDate ||
    !endDate ||
    isNaN(startDate.getTime()) ||
    isNaN(endDate.getTime())
  ) {
    return "N/A";
  }

  const start = startDate.getTime();
  const end = endDate.getTime();

  const diffMs = end - start;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;

  return `${hours} hr ${minutes} min`;
};

// Helper Function: Adds commas to numbers
const formatNumberWithCommas = (num) => {
  if (
    typeof num === "number" ||
    (typeof num === "string" && /^\d+$/.test(num))
  ) {
    return Number(num).toLocaleString("en-US");
  }
  return num || "N/A";
};

const ContainerDetails = () => {
  const { containerNumber } = useParams();
  const navigate = useNavigate();
  const [container, setContainer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for Editing and Deletion
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // 💡 NEW Crew States
  const [crewList, setCrewList] = useState([]);
  const [selectedCrew1, setSelectedCrew1] = useState("");
  const [selectedCrew2, setSelectedCrew2] = useState("");

  // --- Data Fetching and Initialization Effect ---
  useEffect(() => {
    const fetchCrewAndContainerDetails = async () => {
      setIsLoading(true);
      setError(null);
      if (!containerNumber) {
        setError("No container number provided.");
        setIsLoading(false);
        return;
      }

      try {
        // 1. Fetch Crew List (needed for dropdowns)
        const crewSnapshot = await getDocs(collection(db, "crew"));
        const crewData = crewSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => a.firstName.localeCompare(b.firstName));
        setCrewList(crewData);

        // 2. Fetch Container Details
        const logsRef = collection(db, "logs");
        const q = query(
          logsRef,
          where("containerNumber", "==", containerNumber)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0];
          const data = { id: docData.id, ...docData.data() };
          setContainer(data);

          // 3. Initialize Editing States
          const crewIds = data.crewAssigned?.map((c) => c.id) || [];
          setSelectedCrew1(crewIds[0] || "");
          setSelectedCrew2(crewIds[1] || "");

          setFormData({
            containerNumber: data.containerNumber,
            caseNumber: data.caseNumber,
            skuNumber: data.skuNumber,

            // Existing editable fields
            status: data.status || "Not Started",
            startTime: timestampToDateTimeLocal(data.startTime),
            endTime: timestampToDateTimeLocal(data.endTime),
            // Crew is now managed by selectedCrew1/2, not formData
          });
        } else {
          setError(`Container #${containerNumber} not found.`);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data (Crew or Container).");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrewAndContainerDetails();
  }, [containerNumber]);

  // --- Handler for Form Input Changes ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Auto-convert caseNumber and skuNumber to number
    if (name === "caseNumber" || name === "skuNumber") {
      finalValue = Number(value.toString().replace(/,/g, "")) || "";
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  // --- Handler for Edit Toggle ---
  const handleEdit = () => {
    // Re-initialize form data and selected crew before editing starts
    const crewIds = container.crewAssigned?.map((c) => c.id) || [];
    setSelectedCrew1(crewIds[0] || "");
    setSelectedCrew2(crewIds[1] || "");

    setFormData({
      containerNumber: container.containerNumber,
      caseNumber: container.caseNumber,
      skuNumber: container.skuNumber,
      status: container.status || "Not Started",
      startTime: timestampToDateTimeLocal(container.startTime),
      endTime: timestampToDateTimeLocal(container.endTime),
    });
    setIsEditing(true);
  };

  // --- Handler for Saving Updates ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!container || !container.id) return;

    try {
      const containerRef = doc(db, "logs", container.id);

      // 1. Prepare crewAssigned array from selectedCrew IDs (NEW LOGIC)
      const updatedCrew = crewList.filter(
        (member) => member.id === selectedCrew1 || member.id === selectedCrew2
      );

      // 2. Prepare time objects.
      const startTimeDate = formData.startTime
        ? new Date(formData.startTime)
        : null;
      const endTimeDate = formData.endTime ? new Date(formData.endTime) : null;

      const updates = {
        containerNumber: formData.containerNumber,
        caseNumber: formData.caseNumber,
        skuNumber: formData.skuNumber,

        status: formData.status,
        // Check if date is valid before sending
        startTime:
          startTimeDate && !isNaN(startTimeDate.getTime())
            ? startTimeDate
            : null,
        endTime:
          endTimeDate && !isNaN(endTimeDate.getTime()) ? endTimeDate : null,
        crewAssigned: updatedCrew,
      };

      await updateDoc(containerRef, updates);

      setIsEditing(false);

      // 3. Handle Container Number change and redirect or update state
      if (formData.containerNumber !== container.containerNumber) {
        navigate(`/container/${formData.containerNumber}`, { replace: true });
      } else {
        // Force reload the container state after successful update
        // The 'updates' object now contains JavaScript Date objects for time fields,
        // which the updated helpers can correctly format.
        setContainer((prev) => ({ ...prev, ...updates }));
      }
    } catch (err) {
      console.error("Error updating container:", err);
      // Using a simple message box replacement
      alert("Failed to update container details. Check console for errors.");
    }
  };

  // --- Handler for Deleting Document ---
  const handleDelete = async () => {
    if (!container || !container.id) return;

    try {
      const containerRef = doc(db, "logs", container.id);
      await deleteDoc(containerRef);
      // Navigate back to the logs page after successful deletion
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Error deleting container:", err);
      alert("Failed to delete container. Check console for errors.");
      setIsConfirmingDelete(false); // Reset confirmation
    }
  };

  // 💡 NEW: Logic to filter dropdowns (prevents selecting the same crew member twice)
  const availableCrew1 = crewList.filter(
    (member) => member.id !== selectedCrew2
  );
  const availableCrew2 = crewList.filter(
    (member) => member.id !== selectedCrew1
  );

  // --- Render Logic ---
  if (isLoading) {
    return (
      <section className="container-details">
        <NavBar className="navBar-fixed" />
        <div className="loading-container">
          <LoadingDonut />
        </div>
      </section>
    );
  }

  if (error || !container) {
    return (
      <section className="container-details">
        <NavBar className="navBar-fixed" />
        <div className="error-message">
          <p>Error: {error || "Data could not be loaded."}</p>
          <button onClick={() => navigate(-1)} className="btn--back">
            &larr; Back to Logs
          </button>
        </div>
      </section>
    );
  }

  const duration = calculateDuration(container.startTime, container.endTime);

  return (
    <section className="container-details">
      <NavBar className="navBar-fixed" />

      {/* --- Confirmation Box (Simple Modal Replacement) --- */}
      {isConfirmingDelete && (
        <div className="confirmation-overlay">
          <div className="confirmation-box">
            <p>
              Are you sure you want to permanently delete container log **
              {container.containerNumber}**?
            </p>
            <div className="confirmation-actions">
              <button onClick={handleDelete} className="btn--delete-confirm">
                Yes, Delete
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="btn--cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* -------------------------------------------------- */}

      <div className="details-card">
        <div className="details-header">
          <h2>Container #: {container.containerNumber}</h2>
          <div className="header-actions">
            {isEditing ? (
              <>
                {/* Save button submits the form */}
                <button
                  type="submit"
                  onClick={handleUpdate}
                  className="btn--save"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn--cancel"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={handleEdit} className="btn--edit">
                  Edit Details
                </button>
                <button
                  onClick={() => setIsConfirmingDelete(true)}
                  className="btn--delete"
                >
                  Delete Log
                </button>
                <button onClick={() => navigate(-1)} className="btn--back">
                  &larr; Back to Logs
                </button>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleUpdate}>
          {/* --- Core Details Section --- */}
          <div className="details-group core-details">
            <h3 className="group-title">Job Summary</h3>
            <div className="detail-item">
              <span className="label">Container Number:</span>
              <span className="value">
                {isEditing ? (
                  <input
                    type="text"
                    name="containerNumber"
                    value={formData.containerNumber || ""}
                    onChange={handleChange}
                    required
                    className="edit-input"
                  />
                ) : (
                  container.containerNumber
                )}
              </span>
            </div>
            {/* 💡 EDITABLE STATUS DROPDOWN */}
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className="value">
                {isEditing ? (
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="edit-input edit-select"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                ) : (
                  <span
                    className={`status status--${container.status
                      ?.toLowerCase()
                      .replace(/\s/g, "-")}`}
                  >
                    {container.status || "Not Started"}
                  </span>
                )}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Date Created:</span>
              <span className="value">
                {formatFullDate(container.createdAt)}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Case Quantity:</span>
              <span className="value">
                {isEditing ? (
                  <input
                    type="number"
                    name="caseNumber"
                    value={formData.caseNumber || ""}
                    onChange={handleChange}
                    min="0"
                    className="edit-input"
                  />
                ) : (
                  formatNumberWithCommas(container.caseNumber)
                )}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Number of SKUs:</span>
              <span className="value">
                {isEditing ? (
                  <input
                    type="number"
                    name="skuNumber"
                    value={formData.skuNumber || ""}
                    onChange={handleChange}
                    min="0"
                    className="edit-input"
                  />
                ) : (
                  formatNumberWithCommas(container.skuNumber)
                )}
              </span>
            </div>
          </div>
          {/* --- Timing Details Section --- */}
          <div className="details-group timing-details">
            <h3 className="group-title">Timing & Duration</h3>
            {/* 💡 EDITABLE START TIME */}
            <div className="detail-item">
              <span className="label">Start Time:</span>
              <span className="value">
                {isEditing ? (
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="edit-input"
                  />
                ) : (
                  formatSingleTime(container.startTime)
                )}
              </span>
            </div>
            {/* 💡 EDITABLE END TIME */}
            <div className="detail-item">
              <span className="label">End Time:</span>
              <span className="value">
                {isEditing ? (
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="edit-input"
                  />
                ) : (
                  formatSingleTime(container.endTime)
                )}
              </span>
            </div>
            <div className="detail-item total-duration">
              <span className="label">Total Duration:</span>
              <span className="value">{duration}</span>
            </div>
          </div>

          {/* --- Crew Details Section (UPDATED) --- */}
          <div className="details-group crew-details">
            <h3 className="group-title">Crew Assigned</h3>
            {/* 💡 DROPDOWNS REPLACING TEXTAREA */}
            {isEditing ? (
              <div className="crew-edit-controls">
                <select
                  value={selectedCrew1}
                  onChange={(e) => setSelectedCrew1(e.target.value)}
                  className="edit-input edit-select"
                >
                  <option value="">Team Member One</option>
                  {availableCrew1.map((crew) => (
                    <option key={`crew1-${crew.id}`} value={crew.id}>
                      {crew.firstName} {crew.lastName}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedCrew2}
                  onChange={(e) => setSelectedCrew2(e.target.value)}
                  className="edit-input edit-select"
                >
                  <option value="">Team Member Two</option>
                  {availableCrew2.map((crew) => (
                    <option key={`crew2-${crew.id}`} value={crew.id}>
                      {crew.firstName} {crew.lastName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <ul className="crew-list">
                {container.crewAssigned?.map((crew, index) => (
                  <li key={index} className="crew-member">
                    {crew.lastName}, {crew.firstName}
                  </li>
                ))}
                {/* Display a placeholder if no crew is assigned */}
                {(!container.crewAssigned ||
                  container.crewAssigned.length === 0) && (
                  <li className="crew-member">No crew assigned</li>
                )}
              </ul>
            )}
          </div>
          {isEditing && (
            <div className="edit-footer">
              <button type="submit" className="btn--save">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn--cancel"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default ContainerDetails;
