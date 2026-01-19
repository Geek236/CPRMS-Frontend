import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AuthPage.css";
import { useNavigate } from "react-router-dom";
import img1 from "../pictures/img1.jpg";
import img2 from "../pictures/img2.jpg";
import img3 from "../pictures/img3.jpg";

const AuthPage = () => {
  const images = [img1, img2, img3];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState("fade-in");

 useEffect(() => {
  const showDuration = 8000; // how long the image stays visible
  const fadeDuration = 1000; // fade in/out time

  const interval = setInterval(() => {
    // fade out current image
    setFadeState("fade-out");

    setTimeout(() => {
      // move to next image
      setCurrentIndex((prev) => (prev + 1) % images.length);
      // fade in new image
      setFadeState("fade-in");
    }, fadeDuration); // wait for fade out to finish
  }, showDuration);

  return () => clearInterval(interval);
}, []);


  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setMessage("");
    setEmail("");
    setPassword("");
    setFullName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await axios.post("http://localhost:3001/Users/login", {
          Email: email,
          password,
        });
        localStorage.setItem("token", res.data.token);
        setMessage(res.data.message);
        navigate("/dashboard");
      } else {
        const res = await axios.post("http://localhost:3001/Users/register", {
          FullName: fullName,
          Email: email,
          password,
        });
        setMessage(res.data.message);
        toggleForm();
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setMessage(err.response.data.message || err.response.data.errors.join(", "));
      } else {
        setMessage("Server error");
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-image relative overflow-hidden">
  <img
    src={images[currentIndex]}
    alt="Auth Visual"
    className={fadeState === "fade-in" ? "img-fade-in" : "img-fade-out"}
  />
</div>


      <div className="auth-form-container">
        <div className={`form login-form ${isLogin ? "fade-in" : "fade-out"}`}>
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleSubmit}>Login</button>
          <p>
            Don't have an account?{" "}
            <span className="toggle-btn" onClick={toggleForm}>
              Register
            </span>
          </p>
          {message && <p className="message">{message}</p>}
        </div>

        <div className={`form register-form ${!isLogin ? "fade-in" : "fade-out"}`}>
          <h2>Register</h2>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleSubmit}>Register</button>
          <p>
            Already have an account?{" "}
            <span className="toggle-btn" onClick={toggleForm}>
              Login
            </span>
          </p>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
