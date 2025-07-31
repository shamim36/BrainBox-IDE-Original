import { authModalState } from "@/atoms/authModalAtom";
import { auth, firestore } from "@/firebase/firebase";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Icons for visibility

type SignupProps = {};

const Signup: React.FC<SignupProps> = () => {
    const setAuthModalState = useSetRecoilState(authModalState);
    const handleClick = () => {
        setAuthModalState((prev) => ({ ...prev, type: "login" }));
    };

    const [inputs, setInputs] = useState({
        name: "",
        id: "",
        daprtment: "",
        email: "",
        displayName: "",
        password: "",
        confirmPassword: "", // Added confirm password
        role: "student",
    });
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const router = useRouter();
    const [createUserWithEmailAndPassword, user, loading, error] = useCreateUserWithEmailAndPassword(auth);

    const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputs.email || !inputs.password || !inputs.displayName || !inputs.name || !inputs.id || !inputs.confirmPassword) {
            return toast.error("Please fill all fields", { position: "top-center" });
        }
        if (inputs.password !== inputs.confirmPassword) {
            return toast.error("Passwords do not match", { position: "top-center" });
        }
        if (inputs.password.length < 6) {
			return toast.error("Password must be at least 6 characters long", { position: "top-center" });
		}

        try {
            toast.loading("Creating your account...", { position: "top-center", toastId: "loadingToast" });
            const newUser = await createUserWithEmailAndPassword(inputs.email, inputs.password);
            if (!newUser) return;

            const userData = {
                uid: newUser.user.uid,
                email: newUser.user.email,
                displayName: inputs.displayName,
                daprtment: inputs.daprtment,
                name: inputs.name,
                id: inputs.id,
                role: inputs.role,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                likedProblems: [],
                dislikedProblems: [],
                solvedProblems: [],
                starredProblems: [],
            };

            await setDoc(doc(firestore, "users", newUser.user.uid), userData);
            router.push("/");
        } catch (error: any) {
            toast.error(error.message, { position: "top-center" });
        } finally {
            toast.dismiss("loadingToast");
        }
    };

    useEffect(() => {
        if (error) {
            toast.error(error.message, { position: "top-center" });
        }
    }, [error]);

    return (
        <form className='space-y-6 px-6 pb-4' onSubmit={handleRegister}>
            <h3 className='text-xl font-medium text-white'>Register to BrainBox IDE</h3>
            
            {/* All inputs use the original className string */}
            <div>
                <label htmlFor='name' className='text-sm font-medium block mb-2 text-gray-300'>Full Name</label>
                <input onChange={handleChangeInput} type='text' name='name' id='name' className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white' placeholder='John Doe'/>
            </div>
            <div>
                <label htmlFor='id' className='text-sm font-medium block mb-2 text-gray-300'>Student/Faculty ID</label>
                <input onChange={handleChangeInput} type='text' name='id' id='id' className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white' placeholder='201-35-646'/>
            </div>
            <div>
                <label htmlFor='email' className='text-sm font-medium block mb-2 text-gray-300'>Email</label>
                <input onChange={handleChangeInput} type='email' name='email' id='email' className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white' placeholder='name@company.com'/>
            </div>
            <div>
                <label htmlFor='displayName' className='text-sm font-medium block mb-2 text-gray-300'>Display Name</label>
                <input onChange={handleChangeInput} type='text' name='displayName' id='displayName' className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white' placeholder='johndoe'/>
            </div>
            <div>
                <label htmlFor='displayName' className='text-sm font-medium block mb-2 text-gray-300'>Department</label>
                <input onChange={handleChangeInput} type='text' name='department' id='department' className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white' placeholder='SWE'/>
            </div>
            
            
            {/* Password Input with visibility toggle */}
            <div>
                <label htmlFor='password' className='text-sm font-medium block mb-2 text-gray-300'>Password</label>
                <div className='relative'>
                    <input onChange={handleChangeInput} type={showPassword ? "text" : "password"} name='password' id='password' className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white' placeholder='*******'/>
                    <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <AiFillEyeInvisible className="h-5 w-5 text-gray-400" /> : <AiFillEye className="h-5 w-5 text-gray-400" />}
                    </button>
                </div>
            </div>

            {/* Confirm Password Input with visibility toggle */}
            <div>
                <label htmlFor='confirmPassword' className='text-sm font-medium block mb-2 text-gray-300'>Confirm Password</label>
                 <div className='relative'>
                    <input onChange={handleChangeInput} type={showPassword ? "text" : "password"} name='confirmPassword' id='confirmPassword' className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white' placeholder='*******'/>
                    <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <AiFillEyeInvisible className="h-5 w-5 text-gray-400" /> : <AiFillEye className="h-5 w-5 text-gray-400" />}
                    </button>
                </div>
            </div>

            {/* Role Selection */}
            <div>
                <label htmlFor='role' className='text-sm font-medium block mb-2 text-gray-300'>I am a...</label>
                <select onChange={handleChangeInput} name='role' id='role' value={inputs.role} className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white'>
                    <option value='student'>Student</option>
                    <option value='faculty'>Faculty</option>
                </select>
            </div>

            <button type='submit' className='w-full text-white focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-brand-orange hover:bg-brand-orange-s'>
                {loading ? "Registering..." : "Register"}
            </button>

            <div className='text-sm font-medium text-gray-300'>
                Already have an account?{" "}
                <a href='#' className='text-blue-400 hover:underline' onClick={handleClick}>
                    Log In
                </a>
            </div>
        </form>
    );
};
export default Signup;