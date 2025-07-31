"use client";

import React, { useState } from "react";
import Topbar from "@/components/Topbar/Topbar";
import { problems } from "@/utils/problems";
import { firestore } from "@/firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

type Problem = {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  videoId: string;
  link: string;
  order: string;
};

const AddProblem: React.FC = () => {
  const [inputs, setInputs] = useState<Problem>({
    id: "",
    title: "",
    difficulty: "",
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

    const newProblem = {
      ...inputs,
      order: Number(inputs.order),
    };

    try {
      await setDoc(doc(firestore, "problems", inputs.id), newProblem);
      alert("Problem added successfully!");
      setInputs({
        id: "",
        title: "",
        difficulty: "",
        category: "",
        videoId: "",
        link: "",
        order: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add problem.");
    }
  };

  const handleLogout = () => {
    // TODO: Add Firebase logout if needed
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
              type="text"
              name={key}
              value={(inputs as any)[key]}
              onChange={handleChange}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              className="bg-dark-fill-3 p-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
              required
            />
          ))}
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg"
          >
            Add Problem
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProblem;


