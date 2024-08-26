import React from "react";

function Link({ text, className, underline }) {
  return (
    <a href="#" className={`${className} ${underline ? 'underline' : ''}`}>
      {text}
    </a>
  );
}

export default Link;