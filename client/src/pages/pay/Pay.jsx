import React, { useEffect, useState } from "react";
import "./Pay.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate, useParams } from "react-router-dom";

const Pay = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const createOrder = async () => {
      setLoading(true);
      try {
        // Call our new direct order endpoint
        await newRequest.post(`/orders/${id}`);
        setError(null);
        // Redirect to orders page after successful order creation
        navigate("/orders");
      } catch (err) {
        console.error("Order creation error:", err);
        setError("Failed to create order. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    createOrder();
  }, [id, navigate]);

  return (
    <div className="pay">
      {loading ? (
        <p>Processing your order, please wait...</p>
      ) : error ? (
        <div>
          <p className="error">{error}</p>
          <button onClick={() => navigate(`/gig/${id}`)}>Go Back</button>
        </div>
      ) : null}
    </div>
  );
};

export default Pay;
