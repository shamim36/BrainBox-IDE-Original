import { auth, firestore } from "@/firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { DBProblem, UserProfile } from "@/utils/types/problem";

const ProfilePage = () => {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [solvedProblemsDetails, setSolvedProblemsDetails] = useState<DBProblem[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      const fetchUserData = async () => {
        setIsFetchingData(true);
        const userRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setProfile(userData);

          if (userData.solvedProblems?.length > 0) {
            const problemsRef = collection(firestore, "problems");
            const q = query(problemsRef, where("id", "in", userData.solvedProblems));
            const querySnapshot = await getDocs(q);
            const problems: DBProblem[] = [];
            
            querySnapshot.forEach(doc => {
              problems.push({ id: doc.id, ...doc.data() } as DBProblem);
            });
            
            setSolvedProblemsDetails(problems);
          }
        }
        setIsFetchingData(false);
      };
      
      fetchUserData();
    }
  }, [user, loading, router]);

  if (loading || isFetchingData) {
    return (
      <div className="bg-dark-layer-2 min-h-screen flex justify-center items-center">
        <p className="text-white">Loading Profile...</p>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="bg-dark-layer-2 min-h-screen flex justify-center items-center">
        <p className="text-white">Could not load profile. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-layer-2 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl text-white font-semibold mb-6">My Profile</h1>
        <div className="bg-dark-layer-1 rounded-lg p-6 mb-8">
          <p className="text-lg text-gray-300"><strong>Name:</strong> {profile.displayName}</p>
          <p className="text-lg text-gray-300"><strong>Email:</strong> {profile.email}</p>
          <p className="text-lg text-gray-300"><strong>Role:</strong> <span className="capitalize">{profile.role}</span></p>
        </div>

        <h2 className="text-2xl text-white font-semibold mb-4">Solved Problems ({solvedProblemsDetails.length})</h2>
        <div className="bg-dark-layer-1 rounded-lg p-4">
          {solvedProblemsDetails.length > 0 ? (
            <ul>
              {solvedProblemsDetails.map(problem => (
                <li key={problem.id} className="text-gray-300 p-3 border-b border-dark-layer-2">
                  {problem.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 p-3">You haven't solved any problems yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;