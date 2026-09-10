import React, { useEffect, useState } from 'react';
import { trainingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StudentsPage() {
  const { user } = useAuth();
  const isTrainer = user?.role === 'TRAINER';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trainingAPI.getStudents()
      .then((res) => setStudents(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isTrainer ? 'My Students' : 'Enrolled Students Directory'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isTrainer ? 'Students enrolled in your assigned training cohorts.' : 'Student roster across training cohorts.'}
          </p>
        </div>
        <span className="px-3.5 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200">
          {students.length} Students Assigned
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs font-bold text-slate-500">Loading student directory...</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-slate-500">No students found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Institution / Client</th>
                  <th className="p-4">Batch</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {students.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-blue-600">{std.student_code}</td>
                    <td className="p-4 font-bold text-slate-900">{std.name}</td>
                    <td className="p-4 text-slate-600">{std.email}</td>
                    <td className="p-4 font-semibold text-slate-800">{std.college_company}</td>
                    <td className="p-4">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {std.batch_code || 'PY-24'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {std.status || 'Enrolled'}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900">
                      <span className={`px-2.5 py-1 rounded-lg text-xs ${
                        (std.attendance_percentage ?? 100) >= 80
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {std.attendance_percentage !== undefined && std.attendance_percentage !== null ? `${std.attendance_percentage}%` : '100%'}
                      </span>
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
