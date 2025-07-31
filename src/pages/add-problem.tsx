/*
  File: pages/add-problem.tsx
  
  This page provides a UI for faculty members to add a new problem or
  load an existing problem by its ID to update it. It's a protected route,
  ensuring only authenticated users can access it.
*/

import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/firebase/firebase";
import { useRouter } from "next/router";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

// The form logic is now part of the page component itself for simplicity.
const AddOrUpdateProblemPage: React.FC = () => {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();

    const [problemIdToEdit, setProblemIdToEdit] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);

    const [inputs, setInputs] = useState({
        id: "",
        title: "",
        difficulty: "",
        category: "",
        videoId: "",
        link: "",
        order: 0,
    });

    // Effect to handle route protection.
    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth");
        }
    }, [user, loading, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Ensure 'order' is stored as a number.
        const finalValue = name === "order" ? Number(value) : value;
        setInputs((prev) => ({ ...prev, [name]: finalValue }));
    };
    
    /**
     * Fetches a problem from Firestore based on the ID entered in the search box
     * and populates the form with its data for editing.
     */
    const handleLoadProblem = async () => {
        if (!problemIdToEdit) {
            return toast.error("Please enter a Problem ID to load.", { position: "top-center" });
        }
        try {
            toast.loading("Loading problem data...", { position: "top-center", toastId: "loadingToast" });
            const problemRef = doc(firestore, "problems", problemIdToEdit);
            const docSnap = await getDoc(problemRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setInputs({
                    id: data.id,
                    title: data.title,
                    difficulty: data.difficulty,
                    category: data.category,
                    videoId: data.videoId || "",
                    link: data.link || "",
                    order: data.order,
                });
                setIsEditMode(true);
                toast.success("Problem loaded successfully!", { position: "top-center" });
            } else {
                toast.error("No problem found with that ID.", { position: "top-center" });
                setIsEditMode(false);
                resetForm(false); // Reset form but keep the searched ID
            }
        } catch (error: any) {
            toast.error(error.message, { position: "top-center" });
        } finally {
            toast.dismiss("loadingToast");
        }
    };

    /**
     * Handles the form submission. It will either create a new document
     * or update an existing one based on whether it's in "edit mode".
     */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputs.id || !inputs.title || !inputs.difficulty || !inputs.category || inputs.order === 0) {
            return toast.error("Please fill out all required fields.", { position: "top-center" });
        }

        try {
            const toastId = isEditMode ? "updateToast" : "createToast";
            toast.loading(isEditMode ? "Updating problem..." : "Saving problem...", { position: "top-center", toastId });

            const problemRef = doc(firestore, "problems", inputs.id);
            
            if (isEditMode) {
                await updateDoc(problemRef, { ...inputs });
            } else {
                await setDoc(problemRef, { ...inputs, likes: 0, dislikes: 0 });
            }

            toast.success(isEditMode ? "Problem updated successfully!" : "Problem saved successfully!", { position: "top-center" });
            resetForm();

        } catch (error: any) {
            toast.error(error.message, { position: "top-center" });
        } finally {
            toast.dismiss(isEditMode ? "updateToast" : "createToast");
        }
    };
    
    /**
     * Clears the form fields and resets the edit mode.
     */
    const resetForm = (clearSearch = true) => {
        setInputs({ id: "", title: "", difficulty: "", category: "", videoId: "", link: "", order: 0 });
        if(clearSearch) setProblemIdToEdit("");
        setIsEditMode(false);
    }

    if (loading) {
        return (
            <div className="bg-dark-layer-2 min-h-screen flex justify-center items-center">
                <p className="text-white">Loading...</p>
            </div>
        );
    }
    
    if (!user) return null; // Auth guard will redirect

    return (
        <div className="bg-dark-layer-2 min-h-screen">
            <main className="max-w-4xl mx-auto p-6">
                <div className='p-6 bg-dark-layer-1 rounded-lg'>
                    <h3 className='text-xl font-medium text-white mb-6'>Manage Problems</h3>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mb-6 border-b border-gray-600 pb-6">
                        <input
                            type="text"
                            value={problemIdToEdit}
                            onChange={(e) => setProblemIdToEdit(e.target.value)}
                            placeholder="Enter Problem ID to Edit"
                            className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white'
                        />
                        <button onClick={handleLoadProblem} className='text-white bg-gray-600 hover:bg-gray-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center'>Load</button>
                    </div>

                    <h3 className='text-lg font-medium text-white mb-4'>{isEditMode ? `Editing: ${inputs.title}` : "Add New Problem"}</h3>
                    
                    <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                        <input
                            onChange={handleInputChange}
                            value={inputs.id}
                            type='text' name='id'
                            placeholder='Problem ID (e.g., two-sum)'
                            className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white read-only:bg-gray-800'
                            readOnly={isEditMode}
                        />
                         <input
                            onChange={handleInputChange}
                            value={inputs.title}
                            type='text' name='title'
                            placeholder='Title (e.g., Two Sum)'
                            className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white'
                        />
                        <input
                            onChange={handleInputChange}
                            value={inputs.difficulty}
                            type='text' name='difficulty'
                            placeholder='Difficulty (e.g., Easy, Medium, Hard)'
                            className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white'
                        />
                        <input
                            onChange={handleInputChange}
                            value={inputs.category}
                            type='text' name='category'
                            placeholder='Category (e.g., Array, Two Pointers)'
                            className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white'
                        />
                        <input
                            onChange={handleInputChange}
                            value={inputs.order}
                            type='text' name='order'
                            placeholder='Order (e.g., 1)'
                            className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white'
                        />
                        <input
                            onChange={handleInputChange}
                            value={inputs.videoId}
                            type='text' name='videoId'
                            placeholder='YouTube Video ID (optional)'
                            className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white'
                        />
                        <input
                            onChange={handleInputChange}
                            value={inputs.link}
                            type='text' name='link'
                            placeholder='Problem Link (optional)'
                            className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white'
                        />
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                type='submit'
                                className='w-full text-white focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-brand-orange hover:bg-brand-orange-s transition-colors duration-200'
                            >
                                {isEditMode ? "Update Problem" : "Save to DB"}
                            </button>
                             <button
                                type='button'
                                onClick={() => resetForm()}
                                className='w-full text-white bg-gray-600 hover:bg-gray-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center'
                            >
                                Clear / New
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AddOrUpdateProblemPage;
