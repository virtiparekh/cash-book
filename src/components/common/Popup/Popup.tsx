import "./Popup.css";

import type { ReactNode } from "react";

type PopupVariant =
    | "success"
    | "error"
    | "warning"
    | "info";

type PopupProps = {
    variant?: PopupVariant;
    title: string;
    children: ReactNode;
    onClose: () => void;
};

function Popup({
    variant = "info",
    title,
    children,
    onClose,
}: PopupProps) {

    return (

        <div
            className="popup-overlay"
            role="dialog"
            aria-modal="true"
        >

            <div
                className={`popup popup--${variant}`}
            >

                <button
                    type="button"
                    className="popup-close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>


                <div className="popup-icon">

                    {variant === "success" && "✓"}
                    {variant === "error" && "!"}
                    {variant === "warning" && "⚠"}
                    {variant === "info" && "i"}

                </div>


                <h3>
                    {title}
                </h3>


                <div className="popup-message">
                    {children}
                </div>


                {/* <button
                    type="button"
                    className="popup-button"
                    onClick={onClose}
                >
                    OK
                </button> */}

            </div>

        </div>

    );

}

export default Popup;