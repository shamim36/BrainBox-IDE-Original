/*
  File: pages/faculty-dashboard.tsx
  
  This file contains the full implementation for the Faculty Admin Dashboard.
  It fetches and displays student submissions from Firestore, allows viewing
  student profiles, and includes the form to add or update problems.
*/

import React, { useEffect, useState } from "react";
import { auth, firestore } from "@/firebase/firebase";
import { collection, doc, getDoc, getDocs, query, orderBy, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";
import { FaCheckCircle, FaTimesCircle, FaChevronDown, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { signOut } from "firebase/auth"; // Import for logout
import { useRouter } from "next/router";


// ---- TYPE DEFINITIONS ----
interface Submission {
    id: string;
    userId: string;
    problemId: string;
    code: string;
    language: string;
    isCorrect: boolean;
    output: string;
    submittedAt: Timestamp;
    // Joined data
    userName?: string;
    problemTitle?: string;
}

interface UserProfile {
    uid: string;
    id: string;
    name: string;
    department: string;
    displayName:string;
    email: string;
    role: string;
    solvedProblems: string[];
}




// ---- ADD/UPDATE PROBLEM COMPONENT ----
const AddProblem: React.FC = () => {
    const [problemIdToEdit, setProblemIdToEdit] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [inputs, setInputs] = useState({
        id: "", title: "", difficulty: "", category: "", videoId: "", link: "", order: "",description:"", test_input: "", expected_output: ""
    });

    const handleLoadProblem = async () => {
        if (!problemIdToEdit) return toast.error("Please enter a Problem ID to load.");
        try {
            toast.loading("Loading problem...", { toastId: "load" });
            const docRef = doc(firestore, "problems", problemIdToEdit);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setInputs(docSnap.data() as any);
                setIsEditMode(true);
                toast.success("Problem loaded.");
            } else {
                toast.error("Problem not found.");
            }
        } catch (e: any) { toast.error(e.message); }
        finally { toast.dismiss("load"); }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputs.id || !inputs.title) return toast.error("ID and Title are required.");
        try {
            toast.loading(isEditMode ? "Updating..." : "Saving...", { toastId: "save" });
            const problemRef = doc(firestore, "problems", inputs.id);
            if (isEditMode) {
                await updateDoc(problemRef, { ...inputs });
            } else {
                await setDoc(problemRef, { ...inputs, likes: 0, dislikes: 0 });
            }
            toast.success("Problem saved!");
            resetForm();
        } catch (e: any) { toast.error(e.message); }
        finally { toast.dismiss("save"); }
    };

    const resetForm = (clearSearch = true) => {
        setInputs({ id: "", title: "", difficulty: "", category: "", videoId: "", link: "",  order: "",description:"",test_input: "", expected_output: "" });
        if (clearSearch) setProblemIdToEdit("");
        setIsEditMode(false);
    };



    return (
        
        <div className='bg-dark-layer-1 p-6 sm:p-8 rounded-lg w-full max-w-4xl mx-auto'>
    {/* Section to Load an Existing Problem */}
    <div className="flex flex-col sm:flex-row gap-4 mb-6 border-b border-gray-700 pb-6">
        <input 
            type="text" 
            value={problemIdToEdit} 
            onChange={(e) => setProblemIdToEdit(e.target.value)} 
            placeholder="Enter Problem ID to Load & Edit" 
            className='bg-dark-fill-3 text-gray-200 placeholder-gray-500 border border-gray-700 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-orange'
        />
        <button 
            onClick={handleLoadProblem} 
            className='bg-dark-fill-2 hover:bg-dark-fill-3 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 whitespace-nowrap'
        >
            Load
        </button>
    </div>

    {/* Form Title */}
    <h3 className='text-2xl font-semibold text-white mb-6'>
        {isEditMode ? `Editing: ${inputs.title}` : "Add New Problem"}
    </h3>

    {/* Main Form */}
    <form className='flex flex-col gap-6' onSubmit={handleSubmit}>
        {/* Grid for core details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <input 
                onChange={(e) => setInputs({...inputs, id: e.target.value})} 
                value={inputs.id} 
                type='text' 
                name='id' 
                placeholder='Problem ID (e.g., two-sum)' 
                className='input-style' 
                readOnly={isEditMode} 
                required
            />
            <input 
                onChange={(e) => setInputs({...inputs, title: e.target.value})} 
                value={inputs.title} 
                type='text' 
                name='title' 
                placeholder='Title' 
                className='input-style'
                required
            />
            
            {/* --- EDITED: Difficulty Dropdown --- */}
            <select 
                onChange={(e) => setInputs({...inputs, difficulty: e.target.value})} 
                value={inputs.difficulty}
                name='difficulty'
                className='input-style'
            >
                <option value="" disabled>Select Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
            </select>
            
            <input 
                onChange={(e) => setInputs({...inputs, category: e.target.value})} 
                value={inputs.category} 
                type='text' 
                name='category' 
                placeholder='Category (e.g., Array)' 
                className='input-style' 
            />
            <input 
                onChange={(e) => setInputs({...inputs, order: e.target.value})} 
                value={inputs.order} 
                type='text' 
                name='order' 
                placeholder='Track ID (e.g., Batch_Section_CourseCode_FacultyInitial)' 
                className='input-style' 
            />
        </div>

        {/* Textarea for the problem description */}
        <textarea 
            onChange={(e) => setInputs({...inputs, description: e.target.value})} 
            value={inputs.description} 
            name='description' 
            placeholder='Problem Description...' 
            className='input-style min-h-[140px]' 
        />

        {/* Grid for test cases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
             <textarea 
                onChange={(e) => setInputs({...inputs, test_input: e.target.value})} 
                value={inputs.test_input} 
                name='test_input' 
                placeholder='Test Case Input...' 
                className='input-style min-h-[100px]' 
            />
            <textarea 
                onChange={(e) => setInputs({...inputs, expected_output: e.target.value})} 
                value={inputs.expected_output}
                name='expected_output' 
                placeholder='Expected Output...' 
                className='input-style min-h-[100px]'
            />
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 mt-2">
            <button 
                type='submit' 
                className='bg-brand-orange hover:bg-brand-orange-s text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 w-full sm:w-auto'
            >
                {isEditMode ? "Update Problem" : "Save to DB"}
            </button>
            <button 
                type='button' 
                onClick={() => resetForm()} 
                className='bg-dark-fill-2 hover:bg-dark-fill-3 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 w-full sm:w-auto'
            >
                Clear / New
            </button>
        </div>
    </form>
</div>

    );
};

// ---- STUDENT SUBMISSIONS COMPONENT ----
const StudentSubmissions: React.FC<{ onViewSubmission: (submission: Submission) => void }> = ({ onViewSubmission }) => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            try {
                const submissionsQuery = query(collection(firestore, "submissions"), orderBy("submittedAt", "desc"));
                const querySnapshot = await getDocs(submissionsQuery);
                const subs: Submission[] = [];

                const usersSnapshot = await getDocs(collection(firestore, "users"));
                const problemsSnapshot = await getDocs(collection(firestore, "problems"));
                const usersMap = new Map(usersSnapshot.docs.map(d => [d.id, d.data().displayName]));
                const problemsMap = new Map(problemsSnapshot.docs.map(d => [d.id, d.data().title]));

                querySnapshot.forEach(doc => {
                    const data = doc.data() as Submission;
                    subs.push({
                        ...data,
                        id: doc.id,
                        userName: usersMap.get(data.userId) || 'Unknown User',
                        problemTitle: problemsMap.get(data.problemId) || 'Unknown Problem',
                    });
                });
                setSubmissions(subs);
            } catch (error: any) {
                toast.error("Failed to fetch submissions: " + error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, []);

    if (loading) return <p className="text-white text-center p-4">Loading submissions...</p>;

    return (
        <div className="overflow-x-auto p-4">
            <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-dark-layer-2">
                    <tr>
                        <th scope="col" className="px-6 py-3">Student</th>
                        <th scope="col" className="px-6 py-3">Problem</th>
                        <th scope="col" className="px-6 py-3">Language</th>
                        <th scope="col" className="px-6 py-3">Result</th>
                        <th scope="col" className="px-6 py-3">Submitted At</th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.map(sub => (
                        <tr key={sub.id} className="border-b border-dark-layer-2 hover:bg-dark-layer-2 cursor-pointer" onClick={() => onViewSubmission(sub)}>
                            <td className="px-6 py-4">{sub.userName}</td>
                            <td className="px-6 py-4">{sub.problemTitle}</td>
                            <td className="px-6 py-4">{sub.language}</td>
                            <td className="px-6 py-4 flex items-center">
                                {sub.isCorrect ? <FaCheckCircle className="text-dark-green-s mr-2" /> : <FaTimesCircle className="text-dark-pink mr-2" />}
                                {sub.isCorrect ? "Correct" : "Incorrect"}
                            </td>
                            <td className="px-6 py-4">{sub.submittedAt.toDate().toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// ---- STUDENT PROFILE MODAL ----
const StudentProfile: React.FC<{ studentId: string; onClose: () => void }> = ({ studentId, onClose }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    useEffect(() => {
        const fetchProfile = async () => {
            const userRef = doc(firestore, "users", studentId);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) setProfile(docSnap.data() as UserProfile);
        };
        fetchProfile();
    }, [studentId]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-dark-layer-1 p-6 rounded-lg w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl">&times;</button>
                <h3 className="text-2xl text-white mb-4">Student Profile : {profile?.displayName}</h3>
                {profile ? (
                    <div className="text-gray-300 space-y-2">
                        <p><strong>Role: </strong> {profile.role.toUpperCase()}</p>
                        <p><strong>Department: </strong> {profile.department}</p>
                        <p><strong>Student ID: </strong> {profile.id}</p>
                        <p><strong>Student Name: </strong> {profile.name}</p>
                        <p><strong>Email: </strong> {profile.email}</p>
                        
                        <p><strong>Problems Solved:</strong> {profile.solvedProblems.length}</p>
                    </div>
                ) : <p className="text-white">Loading profile...</p>}
            </div>
        </div>
    );
};

// ---- SUBMISSION DETAILS MODAL ----
const SubmissionDetailsModal: React.FC<{ submission: Submission; onClose: () => void; onViewProfile: (studentId: string) => void }> = ({ submission, onClose, onViewProfile }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
            <div className="bg-dark-layer-1 p-6 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-3xl">&times;</button>
                <h3 className="text-2xl text-white mb-4">Submission Details</h3>
                
                <div className="text-gray-300 space-y-2 mb-4 text-sm border-b border-gray-700 pb-4">
                    <p><strong>Student:</strong> <button onClick={() => onViewProfile(submission.userId)} className="text-brand-orange hover:underline">{submission.userName}</button></p>
                    <p><strong>Problem:</strong> {submission.problemTitle}</p>
                    <p><strong>Submitted At:</strong> {submission.submittedAt.toDate().toLocaleString()}</p>
                    <p className="flex items-center"><strong>Result:</strong> 
                        {submission.isCorrect ? <FaCheckCircle className="text-dark-green-s ml-2 mr-1" /> : <FaTimesCircle className="text-dark-pink ml-2 mr-1" />}
                        {submission.isCorrect ? "Correct" : "Incorrect"}
                    </p>
                </div>

                <div className="flex-grow overflow-y-auto space-y-4">
                    <div>
                        <h4 className="text-lg text-white mb-2">Submitted Code ({submission.language})</h4>
                        <pre className="bg-dark-layer-2 p-3 rounded-md text-sm whitespace-pre-wrap font-mono text-gray-200">
                            <code>{submission.code}</code>
                        </pre>
                    </div>
                    <div>
                        <h4 className="text-lg text-white mb-2">Output</h4>
                        <pre className="bg-dark-layer-2 p-3 rounded-md text-sm whitespace-pre-wrap text-gray-200">
                            {submission.output}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ---- MAIN DASHBOARD PAGE ----
const AdminDashboard: React.FC = () => {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [showSubmissions, setShowSubmissions] = useState(true);
    const [showManageProblems, setShowManageProblems] = useState(true);

    useEffect(() => {
        if (!loading && (!user || user.uid !== 'YOUR_FACULTY_ADMIN_UID')) { // Replace with actual admin check logic
            // router.push('/auth'); 
            // For now, we'll allow access for demonstration.
            // In a real app, you'd check if the user's role is 'faculty'.
        }
    }, [user, loading, router]);
    const handleLogout = async () => {
        try {
            toast.loading("Logging out...", { toastId: "logoutToast", position: "top-center" });
            await signOut(auth);
            toast.success("Logged out successfully!", { position: "top-center" });
            router.push("/auth");
        } catch (error: any) {
            toast.error(error.message, { position: "top-center" });
        } finally {
            toast.dismiss("logoutToast");
        }
    };
    const handleViewProfile = () => {
        if (user) {
            setSelectedStudentId(user.uid);
        } else {
            toast.error("You must be logged in to view a profile.", { position: "top-center" });
        }
    };


    if (loading) return <div className="bg-dark-layer-2 min-h-screen flex justify-center items-center"><p className="text-white">Loading...</p></div>;

    return (
        <div className="bg-dark-layer-2 min-h-screen p-6">
            <style jsx global>{`
                .input-style {
                    border: 2px solid #4A5568;
                    outline: none;
                    font-size: 0.875rem;
                    border-radius: 0.5rem;
                    display: block;
                    width: 100%;
                    padding: 0.625rem;
                    background-color: #2D3748;
                    color: white;
                }
                .btn-brand {
                    color: white;
                    background-color: #F59E0B; /* brand-orange */
                    font-weight: 500;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    padding: 0.625rem 1.25rem;
                    text-align: center;
                }
                .btn-brand:hover {
                    background-color: #D97706; /* brand-orange-s */
                }
                .btn-neutral {
                    color: white;
                    background-color: #4A5568;
                    font-weight: 500;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    padding: 0.625rem 1.25rem;
                    text-align: center;
                }
                .btn-neutral:hover {
                    background-color: #2D3748;
                }
            `}</style>
            
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-white text-3xl font-semibold">Faculty Admin Dashboard</h1>
                    <div className="flex items-center gap-5">
                        <button onClick={handleViewProfile} className="text-gray-300 hover:text-brand-orange transition-colors" title="View My Profile">
                            <FaUserCircle className="w-7 h-7" />
                        </button>
                        <button onClick={handleLogout} className="text-gray-300 hover:text-red-500 transition-colors" title="Logout">
                            <FaSignOutAlt className="w-7 h-7" />
                        </button>
                    </div>
                </header>
                <section className="mb-12 bg-dark-layer-1 rounded-lg">
                    <div
                        onClick={() => setShowSubmissions(!showSubmissions)}
                        className="p-4 flex justify-between items-center cursor-pointer"
                    >
                        <h2 className="text-xl text-white font-semibold">Student Submissions</h2>
                        <FaChevronDown className={`transform transition-transform duration-200 text-white ${showSubmissions ? 'rotate-180' : ''}`} />
                    </div>
                    {showSubmissions && (
                        <div className="border-t border-gray-700">
                           <StudentSubmissions onViewSubmission={setSelectedSubmission} />
                        </div>
                    )}
                </section>

                <section className="mb-12 bg-dark-layer-1 rounded-lg">
                    <div
                        onClick={() => setShowManageProblems(!showManageProblems)}
                        className="p-4 flex justify-between items-center cursor-pointer"
                    >
                        <h2 className="text-xl text-white font-semibold">Manage Problems</h2>
                        <FaChevronDown className={`transform transition-transform duration-200 text-white ${showManageProblems ? 'rotate-180' : ''}`} />
                    </div>
                    {showManageProblems && (
                        <div className="border-t border-gray-700">
                            <AddProblem />
                        </div>
                    )}
                </section>

                {selectedSubmission && (
                    <SubmissionDetailsModal 
                        submission={selectedSubmission}
                        onClose={() => setSelectedSubmission(null)}
                        onViewProfile={setSelectedStudentId}
                    />
                )}
                {selectedStudentId && <StudentProfile studentId={selectedStudentId} onClose={() => setSelectedStudentId(null)} />}
            </div>
        </div>
    );
};

export default AdminDashboard;


