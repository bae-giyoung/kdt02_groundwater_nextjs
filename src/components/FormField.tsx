'use client';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}

export default function FormField({
    label, htmlFor, required, children
} : FormFieldProps
) {
    return (
        <div className="mb-5 md:mb-7 lg:mb-14 last:mb-0 md:last:mb-0 lg:last:mb-0">
            <label htmlFor={htmlFor} className="block mb-2 gray-6a text-2xl font-bold">
                {label}{required && <span className="required">*</span>}
            </label>
            {children}
        </div>
    );
}