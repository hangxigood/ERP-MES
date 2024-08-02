import React from "react";

function Button({ text }) {
  return (
    <button className="w-full py-4 mt-5 bg-teal-300 rounded ">
      {text}
    </button>
  );
}

export default Button;