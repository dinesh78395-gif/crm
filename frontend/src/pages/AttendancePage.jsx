import React, { useEffect, useState } from 'react';
import { trainingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AttendancePage() {
  const { user } = useAuth();
  const isTrainer = user?.role === 'TRAINER';

  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSessionInfo, setActiveSessionInfo] = useState(null);

  useEffect(() => {
    trainingAPI.getTrainerSessions()
      .then((res) => {
        const sessList = res.data || [];
        setSessions(sessList);
        if (sessList.length > 0) {
          setSelectedSessionId(sessList[0].id.toString());
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedSessionId) return;
    trainingAPI.getSessionAttendance(parseInt(selectedSessionId))
      .then((res) => {
        setActiveSessionInfo(res.data.session);
        setStudents(res.data.students || []);
        
        // Initialize attendanceMap with existing database records or default 'Present'
        const dbMap = res.data.attendance_map || {};
        const initialMap = {};
        (res.data.students || []).forEach((std) => {
          initialMap[std.id] = dbMap[std.id] || 'Present';
        });
        setAttendanceMap(initialMap);
      })
      .catch((err) => console.error(err));
  }, [selectedSessionId]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedSessionId) return;
    setSaving(true);
    try {
      const records = students.map((std) => ({
        student_id: std.id,
        status: attendanceMap[std.id] || 'Present'
      }));
      await trainingAPI.recordAttendance({
        session_id: parseInt(selectedSessionId),
        records
      });
      alert('Attendance recorded successfully!');
      
      // Refresh session data
      const res = await trainingAPI.getSessionAttendance(parseInt(selectedSessionId));
      setActiveSessionInfo(res.data.session);
    } catch (err) {
      alert('Error recording attendance: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Session Attendance Matrix</h1>
          <p className="text-xs text-slate-500 mt-1">
            {isTrainer ? 'Roll call & session attendance recording for your assigned batches.' : 'Roll call & session attendance recording.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {sessions.length > 0 && (
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.batch_code}] Session {s.session_number}: {s.topic} ({s.status})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleSaveAttendance}
            disabled={saving || students.length === 0}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Roll Call'}
          </button>
        </div>
      </div>

      {activeSessionInfo && (
        <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-blue-700 bg-white px-2.5 py-1 rounded border border-blue-200">
              {activeSessionInfo.batch_code}
            </span>
            <div>
              <span className="font-bold text-slate-900">Session {activeSessionInfo.session_number}: {activeSessionInfo.topic}</span>
              <span className="block text-[11px] text-slate-500">Date: {activeSessionInfo.session_date} | Status: <strong className="text-blue-700">{activeSessionInfo.status}</strong></span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-900">{students.length} Students Enrolled</span>
          </div>
        </div>
      )}

      {/* Attendance Matrix Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs font-bold text-slate-500">Loading attendance matrix...</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-slate-500">No students enrolled in this session batch.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Institution</th>
                  <th className="p-4">Attendance Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {students.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-blue-600">{std.student_code}</td>
                    <td className="p-4 font-bold text-slate-900">{std.name}</td>
                    <td className="p-4 text-slate-600">{std.college_company}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(std.id, 'Present')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                            (attendanceMap[std.id] || 'Present') === 'Present'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          PRESENT
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(std.id, 'Absent')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                            attendanceMap[std.id] === 'Absent'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          ABSENT
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
