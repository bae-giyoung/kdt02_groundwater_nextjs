'use client';

interface CustomInputProps {
  caption: string, 
  ipType: "text" | "password" | "email" | "number" | undefined,
  ipName: string,
}

export default function CustomInput ({caption, ipType, ipName} : CustomInputProps) {
  return (
    <input type={ipType} placeholder={caption} id={ipName} name={ipName} 
      className="block w-full border-style-1 h-14 pl-5 placeholder:gray-92 font-medium border-radius-15 bg-white shadow-1
      invalid:border-pink-500 invalid:text-pink-600 focus:border-sky-500 focus:outline focus:outline-sky-500 focus:invalid:border-pink-500 focus:invalid:outline-pink-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:shadow-none dark:disabled:border-gray-700 dark:disabled:bg-gray-800/20
      " 
    />
  );
}