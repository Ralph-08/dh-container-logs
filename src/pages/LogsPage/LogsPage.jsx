import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import NavBar from "../../components/NavBar/NavBar";
import AddContainerForm from "../../components/AddContainerForm/AddContainerForm";
import LoadingDonut from "../../components/LoadingDonut/LoadingDonut";
import "./LogsPage.scss";

const LogsPage = () => {
  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reference to "logs" collection
    const logsRef = collection(db, "logs");

    // Query ordered by createdAt (newest first)
    const q = query(logsRef, orderBy("createdAt", "desc"));

    // Real-time listener
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

    // Cleanup listener when component unmounts
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
          </ul>
          <section className="assigned__card">
            {isLoading ? (
              <LoadingDonut />
            ) : (
              containers.map((containerInfo) => (
                <ul className={`assigned__item`}>
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
                  <li className="assigned__info">{containerInfo.status}</li>
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
