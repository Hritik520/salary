import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import { signOut } from "firebase/auth";
import { doc, updateDoc, collection, addDoc, getDocs, getDoc } from "firebase/firestore";
import { auth, db } from './firebase';
import './App.css';

// Deposit Modal Component
function DepositModal({ show, onHide, currentNeedAmount, currentWantAmount, currentInvestmentAmount, setCurrentNeedAmount, setCurrentWantAmount, setCurrentInvestmentAmount, needLimit, wantLimit, investmentLimit, email, recordTransaction }) {
  const [depositAmount, setDepositAmount] = useState('');
  const [category, setCategory] = useState('');

  const handleDepositNow = async () => {
    if (!depositAmount || !category) {
      alert('Please select a category and enter an amount to deposit.');
      return;
    }

    const amount = parseFloat(depositAmount);
    let updatedNeedAmount = currentNeedAmount;
    let updatedWantAmount = currentWantAmount;
    let updatedInvestmentAmount = currentInvestmentAmount;

    if (category === 'Need') {
      if (updatedNeedAmount + amount > needLimit) {
        alert('Deposit exceeds the limit for Need category.');
        return;
      }
      updatedNeedAmount += amount;
      setCurrentNeedAmount(updatedNeedAmount);
    } else if (category === 'Want') {
      if (updatedWantAmount + amount > wantLimit) {
        alert('Deposit exceeds the limit for Want category.');
        return;
      }
      updatedWantAmount += amount;
      setCurrentWantAmount(updatedWantAmount);
    } else if (category === 'Investment') {
      if (updatedInvestmentAmount + amount > investmentLimit) {
        alert('Deposit exceeds the limit for Investment category.');
        return;
      }
      updatedInvestmentAmount += amount;
      setCurrentInvestmentAmount(updatedInvestmentAmount);
    }

    try {
      const userRef = doc(db, "users", email);
      await updateDoc(userRef, {
        needAmount: updatedNeedAmount,
        wantAmount: updatedWantAmount,
        investmentAmount: updatedInvestmentAmount
      });

      const transaction = {
        type: 'Deposit',
        category,
        amount,
        timestamp: new Date().toLocaleString(),
      };

      recordTransaction(transaction);

      // Save the transaction in Firebase
      const transactionsRef = collection(userRef, 'transactions');
      await addDoc(transactionsRef, transaction);

      alert('Deposit Successfully Completed!');
      onHide(); 
    } catch (error) {
      console.error("Error updating data:", error);
      alert("Failed to update data: " + error.message);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Deposit
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="deposit-container">
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
            <label htmlFor="depositAmount">Enter Amount to Deposit (INR):</label>
            <input
              type="number"
              id="depositAmount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Enter amount in INR"
            />
          </div>
          <button className="deposit-now-button" onClick={handleDepositNow}>
            Deposit Now
          </button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

// Withdrawal Modal Component
function WithdrawalModal({ show, onHide, currentNeedAmount, currentWantAmount, currentInvestmentAmount, setCurrentNeedAmount, setCurrentWantAmount, setCurrentInvestmentAmount, needLimit, wantLimit, investmentLimit, email, recordTransaction }) {
  const [category, setCategory] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleWithdrawNow = async () => {
    if (!category || !withdrawAmount || !reason) {
      alert('Please fill in all fields.');
      return;
    }

    const amount = parseFloat(withdrawAmount);

    let updatedNeedAmount = currentNeedAmount;
    let updatedWantAmount = currentWantAmount;
    let updatedInvestmentAmount = currentInvestmentAmount;

    if (category === 'Need') {
      updatedNeedAmount = Math.max(0, currentNeedAmount - amount);
      setCurrentNeedAmount(updatedNeedAmount);
    } else if (category === 'Want') {
      updatedWantAmount = Math.max(0, currentWantAmount - amount);
      setCurrentWantAmount(updatedWantAmount);
    } else if (category === 'Investment') {
      updatedInvestmentAmount = Math.max(0, currentInvestmentAmount - amount);
      setCurrentInvestmentAmount(updatedInvestmentAmount);
    }

    try {
      const userRef = doc(db, "users", email);
      await updateDoc(userRef, {
        needAmount: updatedNeedAmount,
        wantAmount: updatedWantAmount,
        investmentAmount: updatedInvestmentAmount
      });

      const transaction = {
        type: 'Withdrawal',
        category,
        amount,
        reason,
        timestamp: new Date().toLocaleString(),
      };

      recordTransaction(transaction);

      // Save the transaction in Firebase
      const transactionsRef = collection(userRef, 'transactions');
      await addDoc(transactionsRef, transaction);

      alert('Withdrawal Successfully Completed!');
      onHide(); 
    } catch (error) {
      console.error("Error updating data:", error);
      alert("Failed to update data: " + error.message);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Withdrawal
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="withdrawal-container">
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
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

// Transactions Component
function Transactions() {
  const location = useLocation();
  const { needLimit, wantLimit, investmentLimit, email, name, salary } = location.state || {};
  const navigate = useNavigate();

  const [currentNeedAmount, setCurrentNeedAmount] = useState(0);
  const [currentWantAmount, setCurrentWantAmount] = useState(0);
  const [currentInvestmentAmount, setCurrentInvestmentAmount] = useState(0);

  const [withdrawalModalShow, setWithdrawalModalShow] = useState(false);
  const [depositModalShow, setDepositModalShow] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('All');

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "users", email);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentNeedAmount(userData.needAmount || 0);
          setCurrentWantAmount(userData.wantAmount || 0);
          setCurrentInvestmentAmount(userData.investmentAmount || 0);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [email]);

  // Fetch transactions when the component mounts
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const userRef = doc(db, "users", email);
        const transactionsRef = collection(userRef, 'transactions');
        const querySnapshot = await getDocs(transactionsRef);
        const transactionList = querySnapshot.docs.map(doc => doc.data());
        setTransactions(transactionList);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [email]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const calculateProgress = (currentAmount, limit) => {
    return (currentAmount / limit) * 100;
  };

  const recordTransaction = (transaction) => {
    setTransactions([...transactions, transaction]);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard', {
      state: {
        email,
        name,
        salary,
        needPercentage: (currentNeedAmount / salary) * 100,
        wantPercentage: (currentWantAmount / salary) * 100,
        investmentPercentage: (currentInvestmentAmount / salary) * 100,
        needAmount: currentNeedAmount,
        wantAmount: currentWantAmount,
        investmentAmount: currentInvestmentAmount
      },
    });
  };

  const filterTransactions = (type) => {
    setActiveTab(type);
  };

  const filteredTransactions = activeTab === 'All' ? transactions : transactions.filter(transaction => transaction.type === activeTab);

  return (
    <div className="transactions-container">
      <header>
        <h2>Transactions</h2>
        <div className="header-buttons">
          <button className="dashboard-button" onClick={handleGoToDashboard}>Dashboard</button>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>
     
      <div className="progress-bar-container">
        <h4>Need: ₹{needLimit}</h4>
        <ProgressBar
          now={calculateProgress(currentNeedAmount, needLimit)}
          label={`₹${(needLimit - currentNeedAmount).toFixed(2)} used / ${calculateProgress(currentNeedAmount, needLimit).toFixed(2)}% remaining`}
        />
        <h4>Want: ₹{wantLimit}</h4>
        <ProgressBar
          now={calculateProgress(currentWantAmount, wantLimit)}
          label={`₹${(wantLimit - currentWantAmount).toFixed(2)} used / ${calculateProgress(currentWantAmount, wantLimit).toFixed(2)}% remaining`}
        />
        <h4>Investment: ₹{investmentLimit}</h4>
        <ProgressBar
          now={calculateProgress(currentInvestmentAmount, investmentLimit)}
          label={`₹${(investmentLimit - currentInvestmentAmount).toFixed(2)} used / ${calculateProgress(currentInvestmentAmount, investmentLimit).toFixed(2)}% remaining`}
        />
      </div>
      
      <div className="button-container">
        <Button variant="primary" onClick={() => setDepositModalShow(true)}>
          Deposit
        </Button>
        <Button variant="secondary" onClick={() => setWithdrawalModalShow(true)}>
          Withdrawal
        </Button>
      </div>

      <div className="transaction-history-container">
        <h3>Transaction History</h3>
        <div className="transaction-tabs">
          <button
            className={`transaction-tab ${activeTab === 'Deposits' ? 'active' : ''}`}
            onClick={() => filterTransactions('Deposit')}
          >
            Deposits
          </button>
          <button
            className={`transaction-tab ${activeTab === 'Withdrawals' ? 'active' : ''}`}
            onClick={() => filterTransactions('Withdrawal')}
          >
            Withdrawals
          </button>
          <button
            className={`transaction-tab ${activeTab === 'All' ? 'active' : ''}`}
            onClick={() => filterTransactions('All')}
          >
            All
          </button>
        </div>
        <div className="transaction-history">
        {activeTab === 'All' && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.type}</td>
                <td>{transaction.category}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.reason || '-'}</td>
                <td>{transaction.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Table for Deposit Transactions */}
      {activeTab === 'Deposit' && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.category}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Table for Withdrawal Transactions */}
      {activeTab === 'Withdrawal' && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.category}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.reason}</td>
                <td>{transaction.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      
          )}
        </div>
      </div>

      <DepositModal
        show={depositModalShow}
        onHide={() => setDepositModalShow(false)}
        currentNeedAmount={currentNeedAmount}
        currentWantAmount={currentWantAmount}
        currentInvestmentAmount={currentInvestmentAmount}
        setCurrentNeedAmount={setCurrentNeedAmount}
        setCurrentWantAmount={setCurrentWantAmount}
        setCurrentInvestmentAmount={setCurrentInvestmentAmount}
        needLimit={needLimit}
        wantLimit={wantLimit}
        investmentLimit={investmentLimit}
        email={email}
        recordTransaction={recordTransaction}
      />

      <WithdrawalModal
        show={withdrawalModalShow}
        onHide={() => setWithdrawalModalShow(false)}
        currentNeedAmount={currentNeedAmount}
        currentWantAmount={currentWantAmount}
        currentInvestmentAmount={currentInvestmentAmount}
        setCurrentNeedAmount={setCurrentNeedAmount}
        setCurrentWantAmount={setCurrentWantAmount}
        setCurrentInvestmentAmount={setCurrentInvestmentAmount}
        needLimit={needLimit}
        wantLimit={wantLimit}
        investmentLimit={investmentLimit}
        email={email}
        recordTransaction={recordTransaction}
      />
    </div>
  );
}

export default Transactions;
