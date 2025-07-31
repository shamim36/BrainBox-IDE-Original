// components/Modals/StudentSubmissions.tsx
import React, { useEffect, useState } from "react";
import { firestore } from "@/firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { toast } from "react-toastify";

type Submission = {
  id: string;
  problemId: string;
  studentId: string;
  code: string;
  language: string;
  output: string;
  submissionTime: any;
  passed: boolean;
  marks?: number;
};

type Props = {
  onViewProfile: (studentId: string) => void;
};

const StudentSubmissions: React.FC<Props> = ({ onViewProfile }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const q = query(collection(firestore, "submissions"), orderBy("submissionTime", "desc"));
      const snapshot = await getDocs(q);
      const subs: Submission[] = [];
      snapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() } as Submission);
      });
      setSubmissions(subs);
    } catch (error: any) {
      toast.error("Failed to load submissions: " + error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleMarksChange = async (submissionId: string, newMarks: number) => {
    try {
      const subRef = doc(firestore, "submissions", submissionId);
      await updateDoc(subRef, { marks: newMarks });
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === submissionId ? { ...sub, marks: newMarks } : sub
        )
      );
      toast.success("Marks updated!");
    } catch (error: any) {
      toast.error("Error updating marks: " + error.message);
    }
  };

  if (loading) return <p className="text-white">Loading submissions...</p>;

  return (
    <table className="min-w-full text-white border border-gray-600 rounded">
      <thead>
        <tr>
          <th className="border p-2">Problem ID</th>
          <th className="border p-2">Student ID</th>
          <th className="border p-2">Code</th>
          <th className="border p-2">Language</th>
          <th className="border p-2">Output</th>
          <th className="border p-2">Passed</th>
          <th className="border p-2">Submission Time</th>
          <th className="border p-2">Marks</th>
          <th className="border p-2">Profile</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map((sub) => (
          <tr key={sub.id} className="border-b border-gray-600">
            <td className="border p-2">{sub.problemId}</td>
            <td className="border p-2">{sub.studentId}</td>
            <td className="border p-2 max-w-xs overflow-x-auto whitespace-pre-wrap font-mono text-sm bg-gray-800 rounded">
              {sub.code}
            </td>
            <td className="border p-2">{sub.language}</td>
            <td className="border p-2 max-w-xs overflow-x-auto whitespace-pre-wrap font-mono text-sm bg-gray-800 rounded">
              {sub.output}
            </td>
            <td className="border p-2">{sub.passed ? "Yes" : "No"}</td>
            <td className="border p-2">{sub.submissionTime?.toDate().toLocaleString()}</td>
            <td className="border p-2">
             
              <input
                type="number"
                min={0}
                max={100}
                value={sub.marks || ""}
                onChange={(e) => handleMarksChange(sub.id, Number(e.target.value))}
                className="w-16 text-black rounded"
                aria-label={`Marks for ${sub.language}`}
              />
            </td>
            <td className="border p-2">
              <button
                className="text-blue-400 underline"
                onClick={() => onViewProfile(sub.studentId)}
              >
                View Profile
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StudentSubmissions;
