import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import NavBar from "../../components/NavBar/NavBar";
import AddContainerForm from "../../components/AddContainerForm/AddContainerForm";
import LoadingDonut from "../../components/LoadingDonut/LoadingDonut";
import "./LogsPage.scss";

// --- ⏰ Helper Function to Format Time ---
const formatTimeRange = (startTimeStamp, endTimeStamp) => {
  // Check if both timestamps exist and are Firestore Timestamps
  if (
    !startTimeStamp ||
    !endTimeStamp ||
    !startTimeStamp.toDate ||
    !endTimeStamp.toDate
  ) {
    // This handles containers marked 'Completed' where one time might be missing (shouldn't happen with our logic, but is a good safeguard)
    return "Completed (Times Unavailable)";
  }

  // Convert Firestore Timestamp objects to standard JavaScript Date objects
  const startDate = startTimeStamp.toDate();
  const endDate = endTimeStamp.toDate();

  // Helper to format a single Date object to e.g., "7:00 AM"
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const startTime = formatTime(startDate);
  const endTime = formatTime(endDate);

  // Return the combined string, e.g., "7:00 AM - 8:00 AM"
  return `${startTime} - ${endTime}`;
};

const LogsPage = () => {
  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 🚀 START Button Handler ---
  const handleStart = async (containerId) => {
    const containerRef = doc(db, "logs", containerId);
    const startTime = serverTimestamp();

    try {
      await updateDoc(containerRef, {
        startTime: startTime,
        status: "In Progress",
      });
      console.log(`✅ Container ${containerId} started.`);
    } catch (error) {
      console.error("❌ Error starting container:", error);
      alert("Failed to start container. Check console for details.");
    }
  };

  // --- 🛑 FINISH Button Handler ---
  const handleFinish = async (containerId) => {
    const containerRef = doc(db, "logs", containerId);
    const endTime = serverTimestamp();

    try {
      await updateDoc(containerRef, {
        endTime: endTime,
        status: "Completed",
      });
      console.log(`✅ Container ${containerId} finished.`);
    } catch (error) {
      console.error("❌ Error finishing container:", error);
      alert("Failed to finish container. Check console for details.");
    }
  };

  useEffect(() => {
    // Reference to "logs" collection
    const logsRef = collection(db, "logs");
    const q = query(logsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setContainers(data);
        setIsLoading(false);
        console.log("🔄 Live data (sorted):", data);
      },
      (error) => {
        console.error("❌ Error listening to updates:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <section className="logsPage">
      <NavBar />
      <section className="logsPage__container">
        <AddContainerForm />
        <section className="assigned">
          <h3 className="assigned__subhead">Containers Assigned:</h3>
          <ul className="assigned__list-labels">
            <li className="label__item">Container #</li>
            <li className="label__item">Case Qty</li>
            <li className="label__item"># of SKUs</li>
            <li className="label__item">Crew Assigned</li>
            <li className="label__item">Status</li>
            <li className="label__item">Actions / Duration</li>
          </ul>
          <section className="assigned__card">
            {isLoading ? (
              <LoadingDonut />
            ) : (
              containers.map((containerInfo) => (
                <ul key={containerInfo.id} className={`assigned__item`}>
                  <li className="assigned__info">
                    {containerInfo.containerNumber}
                  </li>
                  <li className="assigned__info">{containerInfo.caseNumber}</li>
                  <li className="assigned__info">{containerInfo.skuNumber}</li>
                  <li className="assigned__info">
                    <ul className="assigned__crew-list">
                      {containerInfo.crewAssigned?.map((crew, i) => (
                        <li key={i}>
                          {crew.lastName}, {crew.firstName}
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li className="assigned__info">
                    {containerInfo.status || "Not Started"}
                  </li>

                  {/* ⚙️ ACTION / DURATION LOGIC */}
                  <li className="assigned__info assigned__actions">
                    {/* 1. START Button */}
                    {(containerInfo.status === "Not Started" ||
                      !containerInfo.status) && (
                      <button
                        onClick={() => handleStart(containerInfo.id)}
                        className="btn--start"
                      >
                        Start
                      </button>
                    )}

                    {/* 2. FINISH Button */}
                    {containerInfo.status === "In Progress" && (
                      <button
                        onClick={() => handleFinish(containerInfo.id)}
                        className="btn--finish"
                      >
                        Finish
                      </button>
                    )}

                    {/* 3. Display Duration: Shows "7:00 AM - 8:00 AM" if Completed */}
                    {containerInfo.status === "Completed" && (
                      <span className="status--duration">
                        {formatTimeRange(
                          containerInfo.startTime,
                          containerInfo.endTime
                        )}
                      </span>
                    )}
                  </li>
                </ul>
              ))
            )}
          </section>
        </section>
      </section>
    </section>
  );
};

export default LogsPage;
