export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="modal-title mb-0">{title}</h2>
          <button onClick={onClose} className="btn-icon cursor-pointer text-lg leading-none p-2 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-gray-100 transition-colors">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
