import React from "react";

const Modal = ({ isOpen, title, children, onClose }) => {
   if (!isOpen) return null;
   return (
      <div className="modal-overlay">
         <div className="modal">
            <div className="modal-header">
               <h2>{title}</h2>
               <button onClick={onClose}>×</button>
            </div>
            <div className="modal-body">{children}</div>
         </div>
      </div>
   );
};

export default Modal;
