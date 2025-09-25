'use client';

interface CustomInputProps {
  caption: string, 
  ipType: "text" | "password" | "email" | "number" | undefined,
  ipName: string,
}

export default function CustomInput ({caption, ipType, ipName} : CustomInputProps) {
  return (
    <input type={ipType} placeholder={caption} id={ipName} name={ipName} className="block w-full border-style-1 h-14 pl-5 placeholder:gray-92 font-medium border-radius-15 bg-white shadow-1" />
  );
}