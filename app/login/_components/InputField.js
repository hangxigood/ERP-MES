import React from "react";

function InputField({ label, id, type, required }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block mb-1.5">{label}</label>
      <input
        type={type}
        id={id}
        required={required}
        className="w-full rounded border border-solid border-neutral-700 h-[43px]"
      />
    </div>
  );
}

export default InputField;