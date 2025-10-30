import NavBar from "../../components/NavBar/NavBar";
import "./LogsPage.scss";

const LogsPage = () => {
  const containerInfo = {
    containerNumber: "HLBU123456",
    caseNumber: 100,
    skuAmount: 2,
    crewAssigned: [
      {
        firstName: "Rafael",
        lastName: "Ramos",
      },
      {
        firstName: "Junior",
        lastName: "Najera",
      },
    ],
    startTime: "8:00 AM",
    endTime: "5:00 PM",
    status: "In progress"
  };

  return (
    <section className="logsPage">
      <NavBar />
      <h1>Logs Page</h1>
    </section>
  );
};

export default LogsPage;
