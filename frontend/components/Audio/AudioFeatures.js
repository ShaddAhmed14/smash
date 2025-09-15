'use client'
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AudioFeatures = ({video_name}) => {
  const [analysisData, setAnalysisData] = useState([]);
  const url = process.env.NEXT_PUBLIC_BACKEND_URL + "/fetch_audio_features?video_name=" + video_name

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(url);
      const data = await response.json();
      setAnalysisData(data);
    };

    fetchData();
  }, [])


  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{`Time: ${label}s`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${
                entry.dataKey === 'pitch' ? ' Hz' : 
                entry.dataKey === 'tempo' ? ' BPM' : ''
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {analysisData.length > 0 && (
        <div className="space-y-8">
          {/* Volume Over Time */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Volume (RMS Energy) Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analysisData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  label={{ value: 'Volume', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={customTooltip} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                  name="Volume"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pitch Over Time */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Pitch (Fundamental Frequency) Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analysisData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time"
                  label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  label={{ value: 'Frequency (Hz)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={customTooltip} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="pitch" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={false}
                  name="Pitch"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tempo Over Time */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Tempo Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analysisData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time"
                  label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  label={{ value: 'Tempo (BPM)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={customTooltip} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="tempo" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                  dot={false}
                  name="Tempo"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Combined View */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Combined Features (Normalized)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analysisData.map(d => ({
                time: d.time,
                volume_norm: (d.volume * 100).toFixed(1),
                pitch_norm: ((d.pitch - 200) / 100).toFixed(1),
                tempo_norm: ((d.tempo - 100) / 50).toFixed(1)
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time"
                  label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  label={{ value: 'Normalized Value', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="volume_norm" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                  name="Volume (×100)"
                />
                <Line 
                  type="monotone" 
                  dataKey="pitch_norm" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={false}
                  name="Pitch (Hz-200)/100"
                />
                <Line 
                  type="monotone" 
                  dataKey="tempo_norm" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                  dot={false}
                  name="Tempo (BPM-100)/50"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
};

export default AudioFeatures;