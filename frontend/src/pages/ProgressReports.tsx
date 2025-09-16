import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { levelColors, Level } from '../constants'; // Assuming Level and levelColors are still needed

// Interfaces for the Progress Report API response
interface ReportPeriod {
  startDate: string;
  endDate: string;
}

interface ExecutiveSummary {
  totalWordsMastered: number;
  totalWordsInProgress: number;
  newWordsMasteredDuringPeriod: number;
  wordsMovedUpLevelDuringPeriod: number;
  lastActivityDate: string;
}

interface LevelDistributionEntry {
  level: Level;
  count: number;
}

interface HistoricalProgressEntry {
  date: string;
  count: number;
}

interface CategoryWord {
  id: string;
  word: string;
  level: Level;
}

interface CategoryBreakdownEntry {
  category: string;
  masteredCount: number;
  inProgressCount: number;
  totalCount: number;
  words: CategoryWord[];
}

interface NoteEntry {
  id: string;
  author: string;
  date: string;
  content: string;
}

interface ProgressReport {
  studentId: string;
  reportPeriod: ReportPeriod;
  executiveSummary: ExecutiveSummary;
  levelDistribution: LevelDistributionEntry[];
  historicalProgress: {
    wordsMasteredOverTime: HistoricalProgressEntry[];
    wordsMovedUpLevelOverTime: HistoricalProgressEntry[];
    cumulativeWordsMasteredOverTime: HistoricalProgressEntry[];
  };
  categoryBreakdown: CategoryBreakdownEntry[];
  notes: NoteEntry[];
}

const ProgressReports: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [report, setReport] = useState<ProgressReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('lastMonth'); // Default period

  // Function to calculate start and end dates based on selectedPeriod
  const getPeriodDates = (period: string) => {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'lastMonth':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'last3Months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'last6Months':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'lastYear':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'allTime':
        // For 'allTime', backend should handle it, or set a very early date
        startDate.setFullYear(2000, 0, 1); // Arbitrarily early date
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1); // Default to last month
    }
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in.');
          setLoading(false);
          return;
        }

        const { startDate, endDate } = getPeriodDates(selectedPeriod);
        const queryParams = new URLSearchParams({ startDate, endDate }).toString();

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/progress-report?${queryParams}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch progress report.');
        }

        const data: ProgressReport = await response.json();
        setReport(data);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchReport();
    }
  }, [studentId, selectedPeriod]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <p>Loading report...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!report) return <p>No report data available.</p>;

  // Data for Overall Progress Donut Chart
  const overallProgressData = [
    { name: 'Mastered', value: report.executiveSummary.totalWordsMastered },
    { name: 'In Progress', value: report.executiveSummary.totalWordsInProgress },
  ];

  // Data for Level Distribution Bar Chart
  const levelDistributionData = report.levelDistribution.map(entry => ({
    name: entry.level,
    count: entry.count,
    fill: levelColors[entry.level]
  }));

  // Data for Historical Progress Line Chart (Words Mastered Over Time)
  const historicalMasteredData = report.historicalProgress.wordsMasteredOverTime.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: entry.count,
  }));

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <header style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Progress Report for {studentId}</h1> {/* Placeholder for student name */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <div>
            <label htmlFor="report-period" style={{ marginRight: '0.5rem' }}>Report Period:</label>
            <select
              id="report-period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="lastMonth">Last Month</option>
              <option value="last3Months">Last 3 Months</option>
              <option value="last6Months">Last 6 Months</option>
              <option value="lastYear">Last Year</option>
              <option value="allTime">All Time</option>
            </select>
          </div>
          <button onClick={handlePrint} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Print Report
          </button>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
          Report from {report.reportPeriod.startDate} to {report.reportPeriod.endDate}
        </p>
      </header>

      <main>
        {/* Executive Summary */}
        <section style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h2 style={{ marginTop: 0, color: '#333' }}>Executive Summary</h2>
          <p><strong>Total Words Mastered:</strong> {report.executiveSummary.totalWordsMastered}</p>
          <p><strong>Total Words In Progress:</strong> {report.executiveSummary.totalWordsInProgress}</p>
          <p><strong>New Words Mastered During Period:</strong> {report.executiveSummary.newWordsMasteredDuringPeriod}</p>
          <p><strong>Words Moved Up Level During Period:</strong> {report.executiveSummary.wordsMovedUpLevelDuringPeriod}</p>
          <p><strong>Last Activity:</strong> {new Date(report.executiveSummary.lastActivityDate).toLocaleDateString()}</p>
        </section>

        {/* Charts Section */}
        <section style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Overall Progress Donut Chart */}
          <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', backgroundColor: 'white' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#444' }}>Overall Progress</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={overallProgressData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell key={`cell-mastered`} fill={'#28a745'} />
                  <Cell key={`cell-in-progress`} fill={'#007bff'} />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Acquisition Level Distribution Bar Chart */}
          <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', backgroundColor: 'white' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#444' }}>Words by Acquisition Level</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={levelDistributionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count">
                  {levelDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Historical Progress Line Chart */}
          <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', backgroundColor: 'white' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#444' }}>Words Mastered Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={historicalMasteredData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#28a745" name="Words Mastered" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Detailed Progress by Category */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>Detailed Progress by Category</h2>
          {report.categoryBreakdown.length > 0 ? (
            report.categoryBreakdown.map((categoryEntry, index) => (
              <div key={index} style={{ marginBottom: '1.5rem', border: '1px solid #eee', borderRadius: '8px', padding: '1rem', backgroundColor: '#f9f9f9' }}>
                <h3 style={{ marginTop: 0, color: '#444' }}>{categoryEntry.category}</h3>
                <p>Mastered: <span style={{ fontWeight: 'bold', color: '#28a745' }}>{categoryEntry.masteredCount}</span>, In Progress: <span style={{ fontWeight: 'bold', color: '#007bff' }}>{categoryEntry.inProgressCount}</span></p>
                {categoryEntry.words.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                    {categoryEntry.words.map((wordEntry) => (
                      <span key={wordEntry.id} style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '5px',
                        backgroundColor: levelColors[wordEntry.level] || '#ccc',
                        color: 'white',
                        fontSize: '0.9rem'
                      }}>
                        {wordEntry.word} ({wordEntry.level})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No category breakdown available for this period.</p>
          )}
        </section>

        {/* Notes Section */}
        <section>
          <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>Notes</h2>
          {report.notes.length > 0 ? (
            report.notes.map((note, index) => (
              <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                  <strong>{note.author}</strong> on {new Date(note.date).toLocaleDateString()}
                </p>
                <p style={{ margin: '0.5rem 0 0', color: '#333' }}>{note.content}</p>
              </div>
            ))
          ) : (
            <p>No notes available for this period.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProgressReports;