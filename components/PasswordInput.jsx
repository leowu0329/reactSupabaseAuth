function PasswordInput({ value, onChange, placeholder, name, id, className = "form-control" }) {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <div className="input-group">
            <input
                type={showPassword ? "text" : "password"}
                className={className}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                name={name}
                id={id}
                required
            />
            <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
            >
                <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
            </button>
        </div>
    );
}
window.PasswordInput = PasswordInput;