function ForgotPassword() {
    const [email, setEmail] = React.useState('');
    const [modalConfig, setModalConfig] = React.useState(null);

    const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setModalConfig({ id: 'forgotModal', title: '格式錯誤', body: '請輸入正確的電子信箱格式！' });
            return;
        }

        const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/#/update-password`,
        });

        if (error) {
            setModalConfig({ id: 'forgotModal', title: '重設失敗', body: error.message });
        } else {
            setModalConfig({ id: 'forgotModal', title: '發送成功', body: '密碼重設連結已成功發送到您的信箱。' });
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow" style={{ width: '400px' }}>
                <h3 className="text-center mb-4">忘記密碼</h3>
                <form onSubmit={handleResetSubmit}>
                    <div className="mb-3">
                        <label className="form-label">請輸入註冊的電子信箱</label>
                        <input type="text" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mb-3">發送重設密碼信件</button>
                </form>
                <div className="text-center">
                    <a href="#/login" className="text-decoration-none">返回登入</a>
                </div>
            </div>
            {modalConfig && <BootstrapModal {...modalConfig} />}
        </div>
    );
}
window.ForgotPassword = ForgotPassword;