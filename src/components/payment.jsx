import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Axios from "axios";
import "../styles/Payment.css";

const Payment = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const { record } = location.state || {};
  const [paymentId, setPaymentId] = useState(null);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!record) {
      navigate("/dashboard");
    }
  }, [record, navigate]);

  if (!record) return null;

  const handlePayment = async () => {
    setError("");

    if (!cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      setError("Please fill in all card details.");
      return;
    }
    if (cardNumber.length < 12 || cardNumber.length > 19) {
      setError("Card number seems invalid.");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError("Expiry should be in MM/YY format.");
      return;
    }
    if (cvv.length < 3 || cvv.length > 4) {
      setError("CVV should be 3 or 4 digits.");
      return;
    }

    setLoading(true);

 try {
  const response = await Axios.post(
    `${API_URL}/Payments/payment`,
    {
      ServiceRecordReference: record._id,
      AmountPaid: record.ServicePrice,
      PaymentDate: new Date(),
    }
  );


  setPaymentId(response.data.paymentId);
  setSuccess(true);
} catch (err) {
  setError(err.response?.data?.message || "Payment failed");
} finally {
  setLoading(false);
}
  };

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h1>Payment for {record.ServiceName}</h1>
        <p>
          Car Plate: <strong>{record.PlateNumber}</strong>
        </p>
        <p>
          Amount: <strong>{record.ServicePrice?.toLocaleString()} Rwf</strong>
        </p>

        {success ? (
          <button
            onClick={() =>
              navigate("/Bills", {
                state: { paymentId },
              })
            }
          >
            Generate Bill
          </button>
        ) : (
          <div className="payment-form">
            {error && <p className="payment-error">{error}</p>}
            <input
              type="text"
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
            <input
              type="text"
              placeholder="Expiry MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
            <input
              type="text"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />
            <button onClick={handlePayment} disabled={loading}>
              {loading
                ? "Processing..."
                : `Pay ${record.ServicePrice?.toLocaleString()} Rwf`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
