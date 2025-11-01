import "../../css/primary_button.css";

export default function PrimaryButton({
    className = "",
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            disabled={disabled}
            className={`primary-button ${className}`} // Añadimos la clase primary-button
        >
            {children}
        </button>
    );
}
