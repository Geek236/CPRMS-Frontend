import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Axios from "axios";
import { useReactToPrint } from "react-to-print";
import "../styles/billGenerator.css";

const Bills = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentId } = location.state || {};

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const billRef = useRef(); 

  const handlePrint = useReactToPrint({
    content: () => billRef.current,
    documentTitle: `Receipt_${paymentId}`,
  });

  useEffect(() => {
    if (!paymentId) {
      navigate("/dashboard");
      return;
    }

    const fetchBill = async () => {
      try {
        const res = await Axios.get(`${API_URL}/payments/bill/${paymentId}`);
        setBill(res.data.bill);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch bill");
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [paymentId, navigate, API_URL]);

  if (loading) return <p>Loading bill...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="bill-page">
      <h1>Payment Receipt</h1>
      {bill && (
        <>
          <div className="bill-card" ref={billRef}>
            <h2>Receipt</h2>
            <p>
              <span>Plate Number:</span> <span>{bill.PlateNumber}</span>
            </p>
            <p>
              <span>Service Name:</span> <span>{bill.ServiceName}</span>
            </p>
            <p>
              <span>Service Price:</span>{" "}
              <span>{bill.ServicePrice?.toLocaleString()} Rwf</span>
            </p>
            <p>
              <span>Amount Paid:</span>{" "}
              <span>{bill.AmountPaid?.toLocaleString()} Rwf</span>
            </p>
            <p>
              <span>Recipient Name:</span> <span>{bill.RecipientName || "N/A"}</span>
            </p>
            <p>
              <span>Payment Date:</span>{" "}
              <span>{new Date(bill.PaymentDate).toLocaleString()}</span>
            </p>
          </div>

          <div className="bill-buttons">
            <button className="dashboard-btn" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
            <button className="download-btn" onClick={handlePrint}>
              Download / Print Receipt
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Bills;
