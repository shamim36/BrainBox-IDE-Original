import { authModalState } from "@/atoms/authModalAtom";
import { auth, firestore } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useSetRecoilState } from "recoil";
import { toast } from "react-toastify";

type LoginProps = {};

const Login: React.FC<LoginProps> = () => {
    const setAuthModalState = useSetRecoilState(authModalState);
    const handleClick = (type: "login" | "register" | "forgotPassword") => {
        setAuthModalState((prev) => ({ ...prev, type }));
    };

    // Add 'role' to the initial state
    const [inputs, setInputs] = useState({ email: "", password: "", role: "student" });
    const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);
    const router = useRouter();

    /**
     * Handles changes for both input and select elements and updates the state.
     * @param e - The change event from the input or select element.
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    /**
     * Handles the user login process, including role verification and redirection.
     * @param e - The form submission event.
     */
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputs.email || !inputs.password) {
            return toast.error("Please fill all fields", { position: "top-center" });
        }

        try {
            toast.loading("Logging in...", { position: "top-center", toastId: "loadingToast" });
            const signedInUser = await signInWithEmailAndPassword(inputs.email, inputs.password);
            if (!signedInUser) {
                // The useSignInWithEmailAndPassword hook will set an error, which is handled in the useEffect.
                // We dismiss the loading toast here.
                toast.dismiss("loadingToast");
                return;
            }

            // After successful authentication, fetch the user's document to verify their role.
            const userDocRef = doc(firestore, "users", signedInUser.user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                // Check if the role selected in the form matches the role in the database.
                if (userData.role === inputs.role) {
                    // If roles match, redirect based on the role.
                    if (userData.role === "faculty") {
                        router.push("/admin"); // Redirect faculty to the add problem page.
                    } else {
                        router.push("/"); // Redirect students to the home page.
                    }
                } else {
                    // If roles do not match, sign the user out and show an error.
                    await auth.signOut();
                    toast.error("The selected role is incorrect for this account.", { position: "top-center" });
                }
            } else {
                // This case handles scenarios where a user exists in Firebase Auth but not in Firestore.
                await auth.signOut();
                toast.error("User data not found. Please contact support.", { position: "top-center" });
            }
        } catch (error: any) {
            // Catch any other unexpected errors during the process.
            toast.error(error.message, { position: "top-center", autoClose: 3000, theme: "dark" });
        } finally {
            // Ensure the loading toast is always dismissed.
            toast.dismiss("loadingToast");
        }
    };

    // Effect to display Firebase authentication errors.
    useEffect(() => {
        if (error) {
            toast.error(error.message, { position: "top-center", autoClose: 3000, theme: "dark" });
        }
    }, [error]);

    return (
        <form className='space-y-6 px-6 pb-4' onSubmit={handleLogin}>
            <h3 className='text-xl font-medium text-white'>Sign in to BrainBox IDE</h3>
            {/* Email Input */}
            <div>
                <label htmlFor='email' className='text-sm font-medium block mb-2 text-gray-300'>
                    Your Email
                </label>
                <input
                    onChange={handleInputChange}
                    type='email'
                    name='email'
                    id='email'
                    className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white'
                    placeholder='name@company.com'
                />
            </div>
            {/* Password Input */}
            <div>
                <label htmlFor='password' className='text-sm font-medium block mb-2 text-gray-300'>
                    Your Password
                </label>
                <input
                    onChange={handleInputChange}
                    type='password'
                    name='password'
                    id='password'
                    className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white'
                    placeholder='*******'
                />
            </div>
            {/* Role Selection Dropdown */}
            <div>
                <label htmlFor='role' className='text-sm font-medium block mb-2 text-gray-300'>
                    Sign in as...
                </label>
                <select
                    onChange={handleInputChange}
                    name='role'
                    id='role'
                    value={inputs.role}
                    className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white'
                >
                    <option value='student'>Student</option>
                    <option value='faculty'>Faculty</option>
                </select>
            </div>

            <button
                type='submit'
                className='w-full text-white focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-brand-orange hover:bg-brand-orange-s'
            >
                {loading ? "Loading..." : "Log In"}
            </button>
            <button className='flex w-full justify-end' onClick={() => handleClick("forgotPassword")}>
                <a href='#' className='text-sm block text-brand-orange hover:underline w-full text-right'>
                    Forgot Password?
                </a>
            </button>
            <div className='text-sm font-medium text-gray-300'>
                Not Registered?{" "}
                <a href='#' className='text-blue-400 hover:underline' onClick={() => handleClick("register")}>
                    Create account
                </a>
            </div>
        </form>
    );
};
export default Login;