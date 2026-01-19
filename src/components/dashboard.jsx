import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("home");

  const [plateNumber, setPlateNumber] = useState("");
  const [carType, setCarType] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [userCars, setUserCars] = useState([]);

  const [selectedService, setSelectedService] = useState("");
  const [serviceMessage, setServiceMessage] = useState("");
  const [dateOfService, setDateOfService] = useState("");

  const [serviceRecords, setServiceRecords] = useState([]);

  const services = [
    { name: "Engine Repair", price: 150000 },
    { name: "Transmission Repair", price: 80000 },
    { name: "Oil Change", price: 60000 },
    { name: "Chain Replacement", price: 40000 },
    { name: "Disc Replacement", price: 400000 },
    { name: "Wheel Alignment", price: 5000 },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      setFullName(decoded.username);
      fetchUserCars(decoded.username);
      fetchServiceRecords(decoded.username);
    } catch {
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  const fetchUserCars = async (username) => {
    try {
      const res = await axios.post("http://localhost:3001/Cars/SpecificCar", {
        FullName: username,
      });
      setUserCars(res.data.cars || []);
    } catch (err) {
      setUserCars([]);
      console.error(err.response?.data?.message || "Failed to fetch cars");
    }
  };

  const fetchServiceRecords = async (username) => {
    try {
      const res = await axios.post(
        "http://localhost:3001/ServiceRecords/getRecordsByUser",
        { FullName: username },
      );
      setServiceRecords(res.data.records || []);
    } catch (err) {
      setServiceRecords([]);
      console.error(
        err.response?.data?.message || "Failed to fetch service records",
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleRegisterCar = async () => {
    setMessage("");
    try {
      const res = await axios.post("http://localhost:3001/Cars/registerCar", {
        PlateNumber: plateNumber,
        CarType: carType,
        FullName: fullName,
      });
      setMessage(res.data.message);
      setPlateNumber("");
      setCarType("");
      fetchUserCars(fullName);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to register car");
    }
  };

  const handleRequestService = async () => {
    if (!selectedService || !plateNumber || !fullName || !dateOfService) {
      setServiceMessage("Please fill all fields: Car, Owner, Service, Date");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:3001/ServiceRecords/createRecord",
        {
          PlateNumber: plateNumber,
          FullName: fullName,
          ServiceName: selectedService,
          DateOfService: dateOfService,
        },
      );
      setServiceMessage(res.data.message);
      setSelectedService("");
      setDateOfService("");
      fetchServiceRecords(fullName);
    } catch (err) {
      setServiceMessage(
        err.response?.data?.message || "Failed to create service record",
      );
    }
  };

  const handleDeleteRecord = async (record) => {
    try {
      if (!record.StatusOfService) {
        await axios.delete(
          "http://localhost:3001/ServiceRecords/deleteRecord",
          {
            data: { ServiceRecordId: record._id },
          },
        );
        fetchServiceRecords(fullName);
      } else {
        navigate("/payment");
      }
    } catch (err) {
      console.error(err.response?.data?.message || "Failed to delete record");
    }
  };

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <h2 className="logo">CPRMS</h2>
        <ul className="nav-links">
          <li onClick={() => setActivePage("home")}>🏠 Home</li>
          <li onClick={() => setActivePage("car")}>🚗 Register Car</li>
          <li onClick={() => setActivePage("service")}>⚙️ Service</li>
          <li onClick={() => setActivePage("records")}>📋 My Records</li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="dashboard-main">
        {activePage === "home" && (
          <div className="dashboard-card">
            <h1>Welcome {user?.username} 👋</h1>
            <p>You’re successfully logged in.</p>
            <div className="info">
              <strong>Email:</strong> {user?.email}
            </div>
            <div className="info">
              <strong>User ID:</strong> {user?.id}
            </div>
          </div>
        )}

        {activePage === "car" && (
          <div className="dashboard-card">
            <h1>Register Car 🚗</h1>
            <input
              placeholder="Plate Number"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
            />
            <select
              value={carType}
              onChange={(e) => setCarType(e.target.value)}
            >
              <option value="">Select Vehicle Type</option>
              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Pickup">Pickup</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
            </select>
            <button onClick={handleRegisterCar}>Register</button>
            {message && <p className="message">{message}</p>}

            {userCars.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h3>Your Cars:</h3>
                <ul>
                  {userCars.map((car) => (
                    <li key={car._id}>
                      {car.PlateNumber} — {car.CarType}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activePage === "service" && (
          <div className="dashboard-card">
            <h1>Request Service ⚙️</h1>

            <select
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
            >
              <option value="">Select Your Car</option>
              {userCars.map((car) => (
                <option key={car._id} value={car.PlateNumber}>
                  {car.PlateNumber} — {car.CarType}
                </option>
              ))}
            </select>

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              style={{ marginTop: "10px" }}
            >
              <option value="">Select Service</option>
              {services.map((s, i) => (
                <option key={i} value={s.name}>
                  {s.name} — {s.price.toLocaleString()} Rwf
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateOfService}
              onChange={(e) => setDateOfService(e.target.value)}
              style={{ marginTop: "10px" }}
            />

            <button
              onClick={handleRequestService}
              style={{ marginTop: "10px" }}
            >
              Ask for Service
            </button>
            {serviceMessage && <p className="message">{serviceMessage}</p>}
          </div>
        )}

        {activePage === "records" && (
          <div className="records-card">
            <h1>My Service Records 📋</h1>
            {serviceRecords.length === 0 ? (
              <p>No records found.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {serviceRecords.map((record) => (
                  <li key={record._id} className="record-item">
                    <strong>{record.ServiceName}</strong>
                    <div className="record-info">
                      Car Plate: {record.PlateNumber}
                    </div>
                    <div className="record-info">
                      Status:{" "}
                      <span
                        style={{
                          color: record.StatusOfService ? "#10b981" : "#f59e0b",
                          fontWeight: "600",
                        }}
                      >
                        {record.StatusOfService ? "Completed" : "Pending"}
                      </span>
                    </div>

                    <div className="record-buttons">
                      <button
                        style={{
                          backgroundColor: record.PaymentStatus
                            ? "green"
                            : "red",
                        }}
                        disabled={record.PaymentStatus}
                        className={`delete-btn ${record.StatusOfService ? "approve-payment" : ""}`}
                        onClick={() =>
                          record.StatusOfService
                            ? navigate("/payment", { state: { record } })
                            : handleDeleteRecord(record)
                        }
                      >
                        {record.PaymentStatus
                          ? "Payment Completed"
                          : record.StatusOfService
                            ? "Approve Payment"
                            : "Delete"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
