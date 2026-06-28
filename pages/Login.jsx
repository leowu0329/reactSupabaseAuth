const { useNavigate, Link } = window.ReactRouterDOM;
const { useDispatch } = window.ReactRedux;

function Login() {
    const [formData, setFormData] = React.useState({ email: '', password: '' });
    const [modalConfig, setModalConfig] = React.useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
        });

        if (error) {
            setModalConfig({ id: 'loginModal', title: '登入失敗', body: error.message });
        } else if (data.user && !data.user.email_confirmed_at) {
            setModalConfig({ id: 'loginModal', title: '登入失敗', body: '帳號電子信箱尚未驗證，請先完成驗證。' });
            await window.supabaseClient.auth.signOut();
        } else {
            dispatch({ type: 'SET_AUTH', payload: { user: data.user, session: data.session } });
            navigate('/home');
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow" style={{ width: '400px' }}>
                <h3 className="text-center mb-4">系統登入</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">電子信箱</label>
                        <input type="email" name="email" className="form-control" onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">密碼</label>
                        <PasswordInput name="password" onChange={handleChange} />
                    </div>
                    <div className="mb-3 text-end">
                        <Link to="/forgot-password" style={{ fontSize: '0.85rem' }}>忘記密碼？</Link>
                    </div>
                    <button type="submit" className="btn btn-success w-100 mb-3">登入</button>
                </form>
                <div className="text-center">
                    <Link to="/register" className="text-decoration-none">尚未註冊？建立帳號</Link>
                </div>
            </div>
            {modalConfig && <BootstrapModal {...modalConfig} />}
        </div>
    );
}
window.Login = Login;