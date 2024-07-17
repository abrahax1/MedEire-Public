import React, { useState } from "react";

const DeletePopup = ({ showPopup, onDelete, onCancel }) => {
  const [visible, setVisible] = useState(false);

  const handleDelete = () => {
    onDelete();
    setVisible(false);
  };

  const handleCancel = () => {
    onCancel();
    setVisible(false);
  };

  return visible || showPopup ? (
    <div className="delete-popup">
      <div className="delete-popup-content">
        <h4>Are you sure you want to delete?</h4>
        <button className="formbold-btn delete-btn" onClick={handleDelete}>
          Delete
        </button>
        <br />
        <br />
        <button className="formbold-btn cancel-btn" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  ) : null;
};

export default DeletePopup;
