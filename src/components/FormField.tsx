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
        <div className="">
            <label htmlFor={htmlFor}>
                {label}{required && <span className="required">*</span>}
            </label>
            {children}
        </div>
    );
}