

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BsCheckCircle } from "react-icons/bs";
import { AiFillYoutube } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import YouTube from "react-youtube";
import Editor from "@monaco-editor/react"; // You may need to install this: npm install @monaco-editor/react
import { collection, doc, getDoc, getDocs, orderBy, query, addDoc, serverTimestamp, updateDoc, setDoc } from "firebase/firestore";
import { auth, firestore } from "@/firebase/firebase";
import { DBProblem } from "@/utils/types/problem";
import { useAuthState } from "react-firebase-hooks/auth";
import Topbar from "@/components/Topbar/Topbar";
import { toast } from "react-toastify";


// ==================================================================================================
// ## Add Problem Component (Admin Form)
// ==================================================================================================

type AddProblemFormState = {
	id: string;
	title: string;
	difficulty: string;
    description: string;
    expected_output: string;
    test_input: string;
	category: string;
	videoId: string;
	link: string;
	order: string; // Stored as string in form state, converted to number on submit
};

export const AddProblem: React.FC = () => {
	const [inputs, setInputs] = useState<AddProblemFormState>({
		id: "",
		title: "",
		difficulty: "",
        description: "",
        expected_output: "",
        test_input: "",
		category: "",
		videoId: "",
		link: "",
		order: "",
	});

	const router = useRouter();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setInputs((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
        // Simple validation to prevent empty form submission
        if (!inputs.id || !inputs.title || !inputs.order) {
            alert("Please fill out at least ID, Title, and Order.");
            return;
        }

		const newProblem = {
			...inputs,
			order: Number(inputs.order),
		};

		try {
			await setDoc(doc(firestore, "problems", inputs.id), newProblem);
			toast.success("Problem added successfully!", { position: "top-center" });
			setInputs({
				id: "",
		        title: "",
		        difficulty: "",
                description: "",
                expected_output: "",
                test_input: "",
		        category: "",
		        videoId: "",
		        link: "",
		        order: "",
			});
		} catch (err: any) {
			console.error("Error adding document: ", err);
			toast.error(`Failed to add problem: ${err.message}`, { position: "top-center" });
		}
	};

	const handleLogout = () => {
		// You might want to implement Firebase sign out here
		// signOut(auth);
		router.push("/login");
	};

	const goToStudentDashboard = () => {
		router.push("/");
	};

	return (
		<div className="bg-dark-layer-2 min-h-screen text-white">
			<Topbar />
			<div className="max-w-3xl mx-auto p-6 bg-dark-layer-1 rounded-lg mt-10">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-semibold">Add New Problem</h2>
					<div className="flex gap-4">
						<button
							onClick={goToStudentDashboard}
							className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-4 rounded-lg text-sm"
						>
							Student Dashboard
						</button>
						<button
							onClick={handleLogout}
							className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-4 rounded-lg text-sm"
						>
							Logout
						</button>
					</div>
				</div>

				<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
					{Object.keys(inputs).map((key) => (
						<input
							key={key}
							type={key === "order" ? "number" : "text"}
							name={key}
							value={(inputs as any)[key]}
							onChange={handleChange}
							placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
							className="bg-dark-fill-3 p-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
							required={key === "id" || key === "title" || key === "order"}
						/>
					))}
					<button
						type="submit"
						className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg mt-2"
					>
						Add Problem
					</button>
				</form>
			</div>
		</div>
	);
};


// ==================================================================================================
// ## Problems Table Component (Main Student-Facing View)
// ==================================================================================================

type ProblemsTableProps = {
	setLoadingProblems: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProblemsTable: React.FC<ProblemsTableProps> = ({ setLoadingProblems }) => {
	const [youtubePlayer, setYoutubePlayer] = useState({ isOpen: false, videoId: "" });
	const problems = useGetProblems(setLoadingProblems);
	const solvedProblems = useGetSolvedProblems();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedProblem, setSelectedProblem] = useState<DBProblem | null>(null);

	const closeModal = () => {
		setYoutubePlayer({ isOpen: false, videoId: "" });
		setIsModalOpen(false);
		setSelectedProblem(null);
	};

	const handleProblemClick = (problem: DBProblem) => {
		setSelectedProblem(problem);
		setIsModalOpen(true);
	};

	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") closeModal();
		};
		window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, []);

	return (
		<>
			<tbody className='text-white'>
				{problems.map((problem, idx) => {
					const difficulyColor =
						problem.difficulty === "Easy"
							? "text-dark-green-s"
							: problem.difficulty === "Medium"
							? "text-dark-yellow"
							: "text-dark-pink";
					return (
						<tr className={`${idx % 2 === 1 ? "bg-dark-layer-1" : ""}`} key={problem.id}>
							<th className='px-2 py-4 font-medium whitespace-nowrap text-dark-green-s'>
								{solvedProblems.includes(problem.id) && <BsCheckCircle fontSize={"18"} width='18' />}
							</th>
							<td className='px-6 py-4'>
								<button
									className='hover:text-blue-600 cursor-pointer bg-transparent border-none p-0 font-inherit text-left'
									onClick={() => handleProblemClick(problem)}
								>
									{problem.title}
								</button>
							</td>
							<td className={`px-6 py-4 ${difficulyColor}`}>{problem.difficulty}</td>
							<td className={"px-6 py-4"}>{problem.category}</td>
							<td className={"px-6 py-4"}>
								{problem.videoId ? (
									<AiFillYoutube
										fontSize={"28"}
										className='cursor-pointer hover:text-red-600'
										onClick={() => setYoutubePlayer({ isOpen: true, videoId: problem.videoId as string })}
									/>
								) : (
									<p className='text-gray-400'>Coming soon</p>
								)}
							</td>
						</tr>
					);
				})}
			</tbody>

			{youtubePlayer.isOpen && (
				<tfoot className='fixed top-0 left-0 h-screen w-screen flex items-center justify-center'>
					<div className='bg-black z-10 opacity-70 top-0 left-0 w-screen h-screen absolute' onClick={closeModal}></div>
					<div className='w-full z-50 h-full px-6 relative max-w-4xl'>
						<div className='w-full h-full flex items-center justify-center relative'>
							<div className='w-full relative'>
								<IoClose fontSize={"35"} className='cursor-pointer absolute -top-16 right-0' onClick={closeModal} />
								<YouTube videoId={youtubePlayer.videoId} loading='lazy' iframeClassName='w-full min-h-[500px]' />
							</div>
						</div>
					</div>
				</tfoot>
			)}

			{isModalOpen && selectedProblem && <CodeRunnerModal problem={selectedProblem} onClose={closeModal} />}
		</>
	);
};
export default ProblemsTable;


// ==================================================================================================
// ## Code Runner Modal Component
// ==================================================================================================
interface CodeRunnerModalProps {
	problem: DBProblem;
	onClose: () => void;
}

const supportedLanguages = [
	{ value: "python", label: "Python" },
	{ value: "javascript", label: "JavaScript" },
	{ value: "cpp", label: "C++" },
	{ value: "java", label: "Java" },
];

const mapLangToApi = (lang: string): string => {
	switch (lang) {
		case "python": return "PYTHON3";
		case "javascript": return "JAVASCRIPT_NODE";
		case "cpp": return "CPP14";
		case "java": return "JAVA8";
		default: return "PYTHON3";
	}
}

const CodeRunnerModal: React.FC<CodeRunnerModalProps> = ({ problem, onClose }) => {
	const [user] = useAuthState(auth);
	const [code, setCode] = useState<string>("");
	const [input, setInput] = useState<string>("");
	const [language, setLanguage] = useState<string>("python");
	const [isRunning, setIsRunning] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [output, setOutput] = useState<string | null>(null);
	const [outputIsError, setOutputIsError] = useState(false);
    // IMPORTANT: This key should be in an environment variable (.env.local) not hardcoded.
	const CLIENT_SECRET = "780a21237dd1333e5509ad236559e5532a1e5e9f"; 

	const executeCode = async (isSubmission: boolean) => {
		if (!user || !code.trim()) {
            toast.warn("You must be logged in and provide code to run.", {position: "top-center"});
            return;
        }
        if (!CLIENT_SECRET) {
            toast.error("HackerEarth API client secret is not configured.", {position: "top-center"});
            return;
        }

		isSubmission ? setIsSubmitting(true) : setIsRunning(true);
		setOutput(null);
		setOutputIsError(false);

		const payload = {
			lang: mapLangToApi(language),
			source: code,
			input: input,
			time_limit: 5,
			memory_limit: 246323,
		};

		try {
			const res = await fetch('https://api.hackerearth.com/v4/partner/code-evaluation/submissions/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'client-secret': CLIENT_SECRET,
				},
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || "Failed to queue code for execution.");
			}

			const data = await res.json();
			pollForStatus(data.status_update_url, isSubmission);

		} catch (error: any) {
			setOutput(`An error occurred: ${error.message}`);
			setOutputIsError(true);
			toast.error(error.message, { position: "top-center" });
			isSubmission ? setIsSubmitting(false) : setIsRunning(false);
		}
	};

	const pollForStatus = (statusUrl: string, isSubmission: boolean) => {
		const interval = setInterval(async () => {
			try {
				const statusRes = await fetch(statusUrl, {
					headers: { 'client-secret': CLIENT_SECRET },
				});
				const statusData = await statusRes.json();

				if (statusData.request_status.code === 'REQUEST_COMPLETED') {
					clearInterval(interval);
					const outputUrl = statusData.result.run_status.output;
					const outputRes = await fetch(outputUrl);
					const codeOutput = await outputRes.text();
					
					const finalOutput = `Status: ${statusData.result.run_status.status}\nMemory: ${statusData.result.run_status.memory_used}KB\nTime: ${statusData.result.run_status.time_used}s\n\n${codeOutput}`;
					setOutput(finalOutput);

					if (isSubmission) {

						handleSubmissionResult(statusData.result.run_status.status === 'AC', finalOutput);
					}
					isSubmission ? setIsSubmitting(false) : setIsRunning(false);

				} else if (statusData.request_status.code === 'REQUEST_FAILED') {
					clearInterval(interval);
                    setOutputIsError(true);
                    setOutput(`Error: ${statusData.request_status.message}`);
					throw new Error("Code evaluation failed on the server.");
				}
			} catch (error: any) {
				clearInterval(interval);
				setOutput(`An error occurred while fetching status: ${error.message}`);
				setOutputIsError(true);
				isSubmission ? setIsSubmitting(false) : setIsRunning(false);
			}
		}, 2000);
	};
	
	const handleSubmissionResult = async (isCorrect: boolean, finalOutput: string) => {
        const words = finalOutput.split(/\s+/);
    	const newVariable = words.slice(6).join(' ');
		isCorrect = (newVariable.trim() === problem.expected_output.trim());

		if (!user) return;
		try {
			await addDoc(collection(firestore, "submissions"), {
				userId: user.uid,
				problemId: problem.id,
				code,
				language,
				input,
				isCorrect,
				output: finalOutput,
				submittedAt: serverTimestamp(),
			});
			
			if (isCorrect) {
				const userRef = doc(firestore, "users", user.uid);
				const userDoc = await getDoc(userRef);
				if (userDoc.exists()) {
					const solved = userDoc.data().solvedProblems || [];
					if (!solved.includes(problem.id)) {
						await updateDoc(userRef, {
							solvedProblems: [...solved, problem.id]
						});
                        toast.success("Congratulations! Problem solved!", { position: "top-center" });
					} else {
                        toast.info("You've already solved this problem, but nice job!", { position: "top-center" });
                    }
				}
			} else {
                toast.warn("Submission was not correct. Keep trying!", { position: "top-center" });
                toast.warn("New Variable - "+newVariable.trim(), { position: "top-center" });
                toast.warn("Expected Output - "+problem.expected_output.trim(), { position: "top-center" });
            }
		} catch (error: any) {
			toast.error("Failed to save submission result.", { position: "top-center" });
		}
	}
		
		const [inputRows, setInputRows] = useState<number>(4); // Default rows

const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Calculate number of lines (minimum 4, maximum 10)
    const lineCount = Math.max(4, Math.min(value.split('\n').length, 10));
    setInputRows(lineCount);
};
	return (
		

		<div className='fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4'>
			<div className='bg-dark-layer-1 p-6 rounded-lg w-full max-w-7xl max-h-[95vh] flex flex-col'>
				<div className="flex justify-between items-center mb-4">
					<h2 className='text-xl font-semibold text-white'>{problem.title}</h2>
					<button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
				</div>

				<div className="flex-grow flex flex-col md:flex-row gap-6 overflow-y-auto">
					{/* Left Side: Description, Input & Output */}
					<div className="md:w-1/2 flex flex-col gap-4">
						<div>
							<h3 className="text-lg font-semibold text-white mb-2">Problem Description | Catagory : {problem.category} | Difficulty : {problem.difficulty}</h3>
							<p className="text-gray-300 text-sm">
								{problem.description}
							</p>
						</div>
                        <div className="flex flex-col flex-grow">
							<h3 className="text-lg font-semibold text-white mb-2">Sample Input</h3>
							<pre className={`bg-dark-layer-2 p-3 rounded-md text-sm whitespace-pre-wrap flex-grow w-full text-gray-200}`}>
								{problem.test_input}
							</pre>
						</div>
                        <div className="flex flex-col flex-grow">
							<h3 className="text-lg font-semibold text-white mb-2">Expected Output</h3>
							<pre className={`bg-dark-layer-2 p-3 rounded-md text-sm whitespace-pre-wrap flex-grow w-full text-red-40 text-gray-200}`}>
								{problem.expected_output}
							</pre>
						</div>
						<div className="flex flex-col flex-grow">
								<h3 className="text-lg font-semibold text-white mb-2">Input</h3>
								{/* <textarea
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder="Enter your test input here..."
									className="bg-dark-layer-2 p-3 rounded-md text-sm whitespace-pre-wrap flex-grow w-full text-white font-mono resize-none"
									
								/> */
								
								<textarea
    								value={input}
    								onChange={handleInputChange}
    								placeholder="Enter your test input here..."
    								className="bg-dark-layer-2 p-3 rounded-md text-sm whitespace-pre-wrap flex-grow w-full text-white font-mono resize-none"
    								rows={inputRows}
    								style={{ minHeight: `${inputRows * 1}rem` }} // Smooth height transition
								/>
								}
								
						</div>
						<div className="flex flex-col flex-grow">
							<h3 className="text-lg font-semibold text-white mb-2">Output</h3>
							<pre className={`bg-dark-layer-2 p-3 rounded-md text-sm whitespace-pre-wrap flex-grow w-full ${outputIsError ? 'text-red-400' : 'text-gray-200'}`}>
								{isRunning || isSubmitting ? "Processing..." : output || "Execution output will appear here."}
							</pre>
						</div>
					</div>

					{/* Right Side: Editor */}
					<div className="md:w-1/2 flex flex-col">
						<label className='block mb-2 text-white text-sm'>
							Language:
							<select
								value={language}
								onChange={(e) => setLanguage(e.target.value)}
								className='w-full p-2 mt-1 rounded bg-dark-fill-3 text-white border border-gray-600'
							>
								{supportedLanguages.map((lang) => (
									<option key={lang.value} value={lang.value}>{lang.label}</option>
								))}
							</select>
						</label>
						<div className="flex-grow rounded-md overflow-hidden border border-gray-600 mt-2">
								<Editor
								height="100%"
								language={language}
								theme="vs-dark"
								value={code}
								onChange={(value) => setCode(value || "")}
								options={{ fontSize: 14, minimap: { enabled: false } }}
							/>
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-4 mt-4 pt-4 border-t border-gray-700">
					<button onClick={onClose} className="px-4 py-2 bg-dark-fill-3 text-white rounded hover:bg-gray-600">Cancel</button>
					<button onClick={() => executeCode(false)} disabled={isRunning || isSubmitting} className={`px-4 py-2 text-white rounded ${isRunning || isSubmitting ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
						{isRunning ? "Running..." : "Run Code"}
					</button>
					<button onClick={() => executeCode(true)} disabled={isRunning || isSubmitting} className={`px-4 py-2 text-white rounded ${isRunning || isSubmitting ? "bg-gray-500 cursor-not-allowed" : "bg-brand-orange hover:bg-brand-orange-s"}`}>
						{isSubmitting ? "Submitting..." : "Submit"}
					</button>
				</div>
			</div>
		</div>
	);
};


// ==================================================================================================
// ## Custom Hooks for Data Fetching
// ==================================================================================================

function useGetProblems(setLoadingProblems: React.Dispatch<React.SetStateAction<boolean>>) {
	const [problems, setProblems] = useState<DBProblem[]>([]);
	useEffect(() => {
		const getProblems = async () => {
			setLoadingProblems(true);
			const q = query(collection(firestore, "problems"), orderBy("order", "asc"));
			const querySnapshot = await getDocs(q);
			const tmp: DBProblem[] = [];
			querySnapshot.forEach((doc) => tmp.push({ id: doc.id, ...doc.data() } as DBProblem));
			setProblems(tmp);
			setLoadingProblems(false);
		};
		getProblems();
	}, [setLoadingProblems]);
	return problems;
}

function useGetSolvedProblems() {
	const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
	const [user] = useAuthState(auth);
	useEffect(() => {
		const getSolvedProblems = async () => {
			if (!user) { setSolvedProblems([]); return; }
			const userRef = doc(firestore, "users", user.uid);
			const userDoc = await getDoc(userRef);
			if (userDoc.exists()) {
				setSolvedProblems(userDoc.data().solvedProblems || []);
			}
		};
		getSolvedProblems();
	}, [user]);
	return solvedProblems;
}