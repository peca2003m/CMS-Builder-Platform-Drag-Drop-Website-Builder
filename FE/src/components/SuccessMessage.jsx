import { useEffect } from 'react';

function SuccessMessage({ message, onClose, autoClose = true, duration = 3000 }) {
    useEffect(() => {
        if (autoClose && message && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, autoClose, duration, onClose]);

    if (!message) return null;

    return (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
            <span>{message}</span>
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-green-700 hover:text-green-900 font-bold"
                >
                    ×
                </button>
            )}
        </div>
    );
}

export default SuccessMessage;