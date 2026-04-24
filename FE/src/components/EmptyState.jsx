import { Link } from 'react-router-dom';

function EmptyState({
                        title,
                        message,
                        actionText,
                        actionLink,
                        icon = '📭'
                    }) {
    return (
        <div className="text-center py-12 px-4">
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            {actionLink && actionText && (
                <Link
                    to={actionLink}
                    className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
                >
                    {actionText}
                </Link>
            )}
        </div>
    );
}

export default EmptyState;