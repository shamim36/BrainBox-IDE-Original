// components/StudentProfile.tsx
import React, { useEffect, useState } from "react";
import { firestore } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

type Props = {
  studentId: string;
  onClose: () => void;
};

// Updated type to match the Firestore document structure
type Student = {
  id: string; // The student/faculty ID, e.g., "213-35-775"
  name: string;
  department : string;
  email: string;
  displayName: string;
  role: "student" | "faculty";
  solvedProblems: string[];
};

const StudentProfile: React.FC<Props> = ({ studentId, onClose }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!studentId) return;
      setLoading(true);
      try {
        const userRef = doc(firestore, "users", studentId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setStudent(userSnap.data() as Student);
        }
      } catch (error) {
        console.error("Error fetching student profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [studentId]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
      <div className="bg-dark-layer-1 rounded-lg p-8 max-w-md w-full relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white font-bold text-2xl transition-colors"
        >
          &times;
        </button>
        {loading ? (
          <div className="text-white text-center">Loading profile...</div>
        ) : student ? (
          <div className="text-white">
            {/* Header section with name and display name */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-brand-orange">{student.name}</h2>
              <p className="text-gray-400">@{student.displayName}</p>
            </div>
            
            {/* Details section */}
            <div className="space-y-3 border-t border-gray-700 pt-6">
              <p>
                <strong>Role:</strong>
                <span className="ml-2 capitalize bg-dark-fill-2 px-2 py-1 rounded-md text-sm">
                  {student.role}
                </span>
              </p>
              <p>
                <strong>ID:</strong>
                <span className="ml-2">{student.id}</span>
              </p>
              <p>
                <strong>Email:</strong>
                <span className="ml-2">{student.email}</span>
              </p>
              <p>
                <strong>Problems Solved:</strong>
                <span className="ml-2 font-bold text-lg text-dark-green-s">
                  {student.solvedProblems.length}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <p className="text-white text-center">Student not found.</p>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;