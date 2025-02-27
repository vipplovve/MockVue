import React, { useState } from 'react'
import { Loader } from './Loader';

export const Overlay = ({ isOpen, onClose}) => {
    const [loading, setLoading] = useState(true);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button
            className="absolute top-4 left-4 text-white text-2xl font-bold"
            onClick={onClose}
          >
            &times;
          </button>
          <Loader loading={loading} setLoading={setLoading} />
        </div>
      );
}
