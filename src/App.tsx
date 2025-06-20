import { useState, useEffect } from "react";

import { Header, PillToggle, FundCard } from "./components";
import { humanizeKey } from "./utils/stringUtils";
import { useFundData } from './hooks/useFundData';

import './App.css'

function App() {
  const { funds, loading, error } = useFundData();
  const fundTypes = Object.keys(funds);
  const [selectedFundType, setSelectedFundType] = useState('');
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null);

  useEffect(() => {
    const savedFundType = localStorage.getItem("selectedFundType");
    const savedFundId = localStorage.getItem("selectedFundId");

    if (fundTypes.length === 0) return;

    let initialType = savedFundType && fundTypes.includes(savedFundType)
      ? savedFundType
      : fundTypes[0];

    setSelectedFundType(initialType);

    if (savedFundId && funds[initialType]?.some(fund => fund.id === savedFundId)) {
      setSelectedFundId(savedFundId);
    } else if (funds[initialType]?.length === 1) {
      setSelectedFundId(funds[initialType][0].id);
    } else {
      setSelectedFundId(null);
    }
  }, [fundTypes, funds]);


  return (
    <div className="app-container">
      <Header as={"h1"}>Welcome to the fund selector</Header>
      <main>
        {loading ? (
          <p>Loading funds, please wait...</p>
        ) : error ? (
          <p>Error loading funds: {error || 'Unknown error'}</p>
        ) : (
          <div className="main-section">
            <Header as={"h2"}>Please select your type of investment</Header>
            <PillToggle
              options={fundTypes.map(humanizeKey)}
              selected={humanizeKey(selectedFundType)}
              onChange={(humanizedKey) => {
                const rawKey = fundTypes.find(
                  (key) => humanizeKey(key) === humanizedKey
                ) || '';
                localStorage.setItem('selectedFundType', rawKey)
                setSelectedFundType(rawKey);
                setSelectedFundId(null);
              }}
            />
            <div className="fund-cards-container">
              {funds[selectedFundType]?.map((fund) => (
                <FundCard
                  key={fund.id}
                  fund={fund.data}
                  isExpanded={selectedFundId === fund.id}
                  onExpand={() => {
                    setSelectedFundId(fund.id);
                    localStorage.setItem("selectedFundId", fund.id);
                  }}
                  onCollapse={() => {
                    if (funds[selectedFundType]?.length && funds[selectedFundType].length > 1) {
                      setSelectedFundId(null);
                      localStorage.removeItem("selectedFundId");
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
