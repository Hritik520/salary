// src/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import './App.css';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { name = "User", email = "", salary = '', needPercentage = '', wantPercentage = '', investmentPercentage = '' } = location.state || {};

  const [salaryState, setSalaryState] = useState(salary);
  const [needPercentageState, setNeedPercentageState] = useState(needPercentage);
  const [wantPercentageState, setWantPercentageState] = useState(wantPercentage);
  const [investmentPercentageState, setInvestmentPercentageState] = useState(investmentPercentage);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (email) {
          const userDoc = await getDoc(doc(db, "users", email));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setSalaryState(data.salary || '');
            setNeedPercentageState(data.needPercentage || '');
            setWantPercentageState(data.wantPercentage || '');
            setInvestmentPercentageState(data.investmentPercentage || '');
            setIsSaved(true); // Enable the Transactions button if data is loaded
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [email]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const handlePercentageChange = (setter, otherValues) => (e) => {
    if (isSaved) return;

    const value = e.target.value;
    setter(value);

    const total = Number(otherValues[0]) + Number(otherValues[1]) + Number(value);
    if (total !== 100) {
      setErrorMessage("The total percentage must equal 100%");
    } else {
      setErrorMessage("");
    }
  };

  const calculateAmount = (percentage) => {
    return salaryState ? (salaryState * (percentage / 100)).toFixed(2) : '0.00';
  };

  const handleSave = async () => {
    if (salaryState && needPercentageState && wantPercentageState && investmentPercentageState && !errorMessage) {
      try {
        if (!email) {
          throw new Error("Email is missing. Cannot save data.");
        }

        const needLimit = calculateAmount(needPercentageState);
        const wantLimit = calculateAmount(wantPercentageState);
        const investmentLimit = calculateAmount(investmentPercentageState);

        await setDoc(doc(db, "users", email), {
          salary: salaryState,
          needPercentage: needPercentageState,
          wantPercentage: wantPercentageState,
          investmentPercentage: investmentPercentageState,
          name: name,
          needLimit,
          wantLimit,
          investmentLimit,
          needAmount: needLimit,
          wantAmount: wantLimit,
          investmentAmount: investmentLimit,
        });
        setIsSaved(true); // Enable the Transactions button after saving
        alert("Data saved successfully!");
      } catch (error) {
        console.error("Error saving data", error);
        alert("Failed to save data: " + error.message);
      }
    } else {
      alert("Please make sure all fields are filled correctly.");
    }
  };

  const handleReset = () => {
    setSalaryState('');
    setNeedPercentageState('');
    setWantPercentageState('');
    setInvestmentPercentageState('');
    setErrorMessage('');
    setIsSaved(false); // Disable the Transactions button on reset
  };

  const handleTransactions = () => {
    const needAmount = calculateAmount(needPercentageState);
    const wantAmount = calculateAmount(wantPercentageState);
    const investmentAmount = calculateAmount(investmentPercentageState);

    navigate('/transactions', {
      state: {
        needAmount,
        wantAmount,
        investmentAmount,
        needLimit: needAmount,
        wantLimit: wantAmount,
        investmentLimit: investmentAmount,
        email,
        name,
        salary: salaryState,
      },
    });
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Dashboard</h2>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>
      <div className="welcome-container">
        <h1>Welcome, {name}!</h1>
        <div className="salary-section">
          <label htmlFor="salary">Enter Salary Amount (INR):</label>
          <input
            type="number"
            id="salary"
            value={salaryState}
            onChange={(e) => !isSaved && setSalaryState(e.target.value)}
            placeholder="Enter your salary in INR"
            disabled={isSaved}
          />
        </div>
        <div className="percentage-section">
          <div className="percentage-input">
            <label htmlFor="need">Need (%):</label>
            <input
              type="number"
              id="need"
              value={needPercentageState}
              onChange={handlePercentageChange(setNeedPercentageState, [wantPercentageState, investmentPercentageState])}
              placeholder="0"
              disabled={isSaved}
            />
            <p>Amount: ₹{calculateAmount(needPercentageState)}</p>
          </div>
          <div className="percentage-input">
            <label htmlFor="want">Want (%):</label>
            <input
              type="number"
              id="want"
              value={wantPercentageState}
              onChange={handlePercentageChange(setWantPercentageState, [needPercentageState, investmentPercentageState])}
              placeholder="0"
              disabled={isSaved}
            />
            <p>Amount: ₹{calculateAmount(wantPercentageState)}</p>
          </div>
          <div className="percentage-input">
            <label htmlFor="investment">Investment (%):</label>
            <input
              type="number"
              id="investment"
              value={investmentPercentageState}
              onChange={handlePercentageChange(setInvestmentPercentageState, [needPercentageState, wantPercentageState])}
              placeholder="0"
              disabled={isSaved}
            />
            <p>Amount: ₹{calculateAmount(investmentPercentageState)}</p>
          </div>
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button className="save-button" onClick={handleSave} disabled={isSaved}>Save</button>
        <button className="reset-button" onClick={handleReset}>Reset</button>
        <button className="transactions-button" onClick={handleTransactions} disabled={!isSaved}>Transactions</button>
      </div>
    </div>
  );
}

export default Dashboard;
