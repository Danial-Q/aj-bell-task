import { useState, useEffect, useRef } from 'react';
import type {
  FundApiResponse,
  FundAsset,
  FundHolding,
  FundDocument,
} from '../../types/FundTypes';
import { Header } from '../../components';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import './FundCard.css';

export interface FundCardProps {
  fund: FundApiResponse;
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

const colors = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
  '#AA336A', '#33AA99', '#FF6666', '#AAFF66',
];

const starFull = '★';
const starEmpty = '☆';

export const FundCard = ({
  fund,
  isExpanded,
  onExpand,
  onCollapse,
}: FundCardProps) => {
  const storageKey = `fundCardActiveTab-${fund.quote.name}`;
   const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'documents'>(() => {
    const savedTab = localStorage.getItem(storageKey);
    return savedTab === 'overview' || savedTab === 'portfolio' || savedTab === 'documents'
      ? savedTab
      : 'overview';
  });

  useEffect(() => {
    localStorage.setItem(storageKey, activeTab);
  }, [activeTab, storageKey]);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? starFull : starEmpty);
    }
    return stars.join('');
  };

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && cardRef.current) {
      const isMobile = window.innerWidth <= 600;
      if (isMobile) {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [isExpanded]);

  const toggleExpand = () => {
    if (isExpanded) {
      onCollapse();
    } else {
      onExpand();
    }
  };

  const latestPriceDate = new Date(fund.quote.lastPriceDate);
  const formattedLatestPriceDate = latestPriceDate.toLocaleDateString('en-GB');

  return (
    <div
      ref={cardRef}
      className={`fund-card ${isExpanded ? 'expanded' : ''}`}
      tabIndex={0}
      onClick={toggleExpand}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleExpand();
        }
      }}
      role="button"
      aria-expanded={isExpanded}
    >
      <div className="fund-summary">
        <div className="fund-name">
          <Header as="h3">{fund.quote.name}</Header>
        </div>
        <div className="ratings-row">
          <div className="analyst-rating-container">
            <span className="analyst-label">Analyst Rating: {fund.ratings.analystRatingLabel !== null ? fund.ratings.analystRatingLabel : 'N/A'}</span>
            <div className="analyst-content">
              <span
                className="stars"
                aria-label={`Analyst rating ${fund.ratings.analystRating} out of 5`}
              >
                {renderStars(fund.ratings.analystRating)}
              </span>
            </div>
          </div>

          <div className="srri-container">
            <span className="srri-label">SRRI: {fund.ratings.SRRI !== null ? fund.ratings.SRRI : 'N/A'}</span>
            {fund.ratings.SRRI !== null && (
              <div className="srri-bar" aria-hidden="true">
                <div
                  className="srri-marker"
                  style={{ left: `${(fund.ratings.SRRI / 10) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
         <div className="fund-details" onClick={(e) => e.stopPropagation()}>
          <nav 
            className="tabs" 
            role="tablist" 
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button
              role="tab"
              aria-selected={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              className={activeTab === 'overview' ? 'active' : ''}
            >
              Overview
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'portfolio'}
              onClick={() => setActiveTab('portfolio')}
              className={activeTab === 'portfolio' ? 'active' : ''}
            >
              Portfolio
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'documents'}
              onClick={() => setActiveTab('documents')}
              className={activeTab === 'documents' ? 'active' : ''}
            >
              Documents
            </button>
          </nav>

          <div className="tab-content-wrapper">
            {activeTab === 'overview' && (
              <section role="tabpanel">
                <Header as="h4">Objective</Header>
                <p>{fund.profile.objective}</p>
                <p>
                  <strong>Latest Price:</strong> {Number(fund.quote.lastPrice).toFixed(2)} as of {formattedLatestPriceDate}
                </p>
                <p>
                  <strong>Currency:</strong> {fund.quote.currency}
                </p>
                <p>
                  <strong>Ongoing Charge:</strong> {fund.quote.ongoingCharge}%
                </p>
                <p>
                  <strong>Sector:</strong> {fund.quote.sectorName}
                </p>
              </section>
            )}

            {activeTab === 'portfolio' && (
              <section role="tabpanel">
                <Header as="h4">Asset Allocation & Top Holdings</Header>
                <div className="portfolio-content">
                  <div className="pie-chart-container">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={fund.portfolio.asset}
                          dataKey="value"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          labelLine={false}
                        >
                          {fund.portfolio.asset.map((entry: FundAsset, index) => (
                            <Cell
                              key={`cell-${entry.label}`}
                              fill={colors[index % colors.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="top-holdings-container">
                    <Header as="h4">Top 10 Holdings</Header>
                    <table className="top-holdings-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fund.portfolio.top10Holdings.map((holding: FundHolding) => (
                          <tr key={holding.name}>
                            <td>{holding.name}</td>
                            <td>{holding.weighting.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'documents' && (
              <section role="tabpanel">
                <Header as="h4">Documents</Header>
                <ul>
                  {fund.documents.map((doc: FundDocument) => (
                    <li key={doc.id}>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        {doc.type}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
