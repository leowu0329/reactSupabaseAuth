const { useNavigate, Link } = window.ReactRouterDOM;

function Register() {
    const [formData, setFormData] = React.useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [modalConfig, setModalConfig] = React.useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setModalConfig({ id: 'regModal', title: '註冊失敗', body: '兩次輸入的密碼不一致！' });
            return;
        }

        const { data, error } = await window.supabaseClient.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: { data: { display_name: formData.username } }
        });

        if (error) {
            setModalConfig({ id: 'regModal', title: '註冊失敗', body: error.message });
        } else {
            setModalConfig({ 
                id: 'regModal', 
                title: '註冊成功', 
                body: '註冊驗證信已寄出，請至信箱確認後再行登入。',
                onClosed: () => navigate('/confirm')
            });
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow" style={{ width: '400px' }}>
                <h3 className="text-center mb-4">帳號註冊</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">使用者帳號</label>
                        <input type="text" name="username" className="form-control" onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">電子信箱</label>
                        <input type="email" name="email" className="form-control" onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">密碼</label>
                        <PasswordInput name="password" onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">確認密碼</label>
                        <PasswordInput name="confirmPassword" onChange={handleChange} />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mb-3">註冊</button>
                </form>
                <div className="text-center">
                    <Link to="/login" className="text-decoration-none">已有帳號？前往登入</Link>
                </div>
            </div>
            {modalConfig && <BootstrapModal {...modalConfig} />}
        </div>
    );
}
window.Register = Register;