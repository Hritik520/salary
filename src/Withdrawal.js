import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './App.css';

function Withdrawal() {
  const location = useLocation();
  const { needAmount, wantAmount, investmentAmount, needLimit, wantLimit, investmentLimit } = location.state || {};
  
  const [category, setCategory] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [reason, setReason] = useState('');
  const navigate = useNavigate();

  const handleWithdrawNow = () => {
    if (!category || !withdrawAmount || !reason) {
      alert('Please fill in all fields.');
      return;
    }

    const amount = parseFloat(withdrawAmount);

    let updatedNeedAmount = needAmount;
    let updatedWantAmount = wantAmount;
    let updatedInvestmentAmount = investmentAmount;

    // Update the selected category's amount
    if (category === 'Need') {
      updatedNeedAmount = Math.max(0, needAmount - amount);
    } else if (category === 'Want') {
      updatedWantAmount = Math.max(0, wantAmount - amount);
    } else if (category === 'Investment') {
      updatedInvestmentAmount = Math.max(0, investmentAmount - amount);
    }

    // Navigate back to the Transactions page with updated amounts
    alert('Withdrawal Successfully Completed!');
    navigate('/transactions', { 
      state: { 
        needAmount: updatedNeedAmount, 
        wantAmount: updatedWantAmount, 
        investmentAmount: updatedInvestmentAmount,
        needLimit, 
        wantLimit, 
        investmentLimit 
      } 
    });
  };

  return (
    <div className="withdrawal-container">
      <h2>Withdrawal</h2>
      <div className="form-group">
        <label htmlFor="category">Select Category:</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          <option value="Need">Need</option>
          <option value="Want">Want</option>
          <option value="Investment">Investment</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="withdrawAmount">Enter Amount to Withdraw (INR):</label>
        <input
          type="number"
          id="withdrawAmount"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          placeholder="Enter amount in INR"
        />
      </div>
      <div className="form-group">
        <label htmlFor="reason">Reason:</label>
        <input
          type="text"
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for withdrawal"
        />
      </div>
      <button className="withdraw-now-button" onClick={handleWithdrawNow}>
        Withdraw Now
      </button>
    </div>
  );
}

export default Withdrawal;
