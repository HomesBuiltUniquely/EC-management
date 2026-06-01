'use client';

import { useRouter } from "next/navigation";
import { FormPopup } from "./FormPopup";
import React from "react";


export default function Header() {
    const router = useRouter();
    const [showForm, setShowForm] = React.useState(false);


    function launchQuiz(event: React.MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();

        router.push("https://design.hubinterior.com/DesignQA");
    }

    function launchForm(event: React.MouseEvent<HTMLButtonElement>): void {
        event.preventDefault()
        setShowForm(true);
    }
    function CloseForm(event?: React.MouseEvent<HTMLButtonElement>): void {
        if (event) event.preventDefault();
        setShowForm(false);
    }

    return (
      <div>
           <main>
                <div></div>
                <div className="grid grid-cols-3 items-center   gap-1 bg-blue-100 border border-[#ddcdc1] shadow-md">
                <div className="col-span-1 my-4 items-center  ml-14">
                    <div className="text-3xl font-extrabold ">Experience Center Management</div>
                    <div className="mt-4 text-md font-medium ">Manage walk-ins, scheduled visits, and showroom operation in one place</div>
                </div>
                <div className="col-span-2 gap-10 flex justify-center mr-10">
                    <button onClick={launchQuiz} className=" bg-white text-md text-gray-400 font-bold rounded-md w-50 h-10 shadow-md border border-[#ddcdc1] ">Launch Quiz</button>
                    <button onClick={launchForm} className="bg-blue-300 text-md text-white font-bold rounded-md w-50 h-10 shadow-md border border-[#ddcdc1]">+ New Walk-in Form</button>
                </div>

                </div>
                {showForm && <FormPopup onClose={() => CloseForm()} />}
                
           </main>
      </div>
    );
  }
  