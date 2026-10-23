// import "./AppModal.css";

import { useDispatch, useSelector } from "react-redux";
import { setPulseModal } from "../redux/features/uiSlice";

const ICONS = {
    error: "❌",
    success: "✅",
    info: "ℹ️",
    warning: "⚠️",
};

const TITLES = {
    error: "Error",
    success: "Success",
    info: "Information",
    warning: "Warning",
};

const PulseModal = ({ actionText = "OK"}) => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.ui.PulseModal);
    const { show, type, title, message } = data;
    if (!show) return null;

    const onAction = () => {
        // Placeholder for action button functionality
        console.log("Action button clicked");
        onClose();
    }

    // const dispatch = useDispatch();
    const onClose = () => {
        dispatch(
            setPulseModal(null)
        );
    }

    return (
        <>
            {/* Backdrop */}
            <div className="app-modal-backdrop" onClick={onClose} />

            {/* Modal */}
            <div className="app-modal-wrapper">
                <div className={`app-modal card modal-${type}`}>
                    {/* Header */}
                    <div className="card-header d-flex align-items-center gap-3">
                        <div className="modal-icon">
                            {ICONS[type]}
                        </div>
                        <h5 className="mb-0">
                            {title || TITLES[type]}
                        </h5>
                    </div>

                    {/* Body */}
                    <div className="card-body">
                        <p className="mb-0 text-muted">{message}</p>
                    </div>

                    {/* Footer */}
                    <div className="card-footer d-flex gap-2 justify-content-end">

                        {type === "info" && <button
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                        >
                            Close
                        </button>}

                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                onAction?.();
                                onClose();
                            }}
                        >
                            {actionText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PulseModal;
