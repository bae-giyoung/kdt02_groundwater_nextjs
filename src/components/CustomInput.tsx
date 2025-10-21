'use client';
import { InputHTMLAttributes } from "react";

export default function CustomInput ({className, ...rest}: InputHTMLAttributes<HTMLInputElement>) {
  const injectedStyle = className ? className : "";
  const styleString = `block w-full border-style-1 h-14 pl-5 placeholder:gray-92 font-medium border-radius-15 bg-white shadow-1
      invalid:border-orange-700 focus:border-sky-500 focus:outline focus:outline-sky-500 focus:invalid:border-orange-700 
      focus:invalid:outline-orange-700 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:shadow-none 
      dark:disabled:border-gray-700 dark:disabled:bg-gray-800/20 ${injectedStyle}`;
  
  return (
    <input className={styleString} {...rest} />
  );
}