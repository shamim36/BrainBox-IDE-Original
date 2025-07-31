import { auth } from "@/firebase/firebase";
import React from "react";
import { useSignOut } from "react-firebase-hooks/auth";
import { FiLogOut } from "react-icons/fi";
import { toast } from "react-toastify";

const Logout: React.FC = () => {
	const [signOut, loading, error] = useSignOut(auth);

	const handleLogout = () => {
        toast.warn("Login Out!!", { position: "top-center" });
		signOut();
	};
	return (
		<button className='bg-dark-fill-3 py-1.5 px-3 cursor-pointer rounded text-brand-orange' onClick={handleLogout} aria-label='Logout'
	title='Logout'>
			<FiLogOut />
		</button>
	);
};
export default Logout;
