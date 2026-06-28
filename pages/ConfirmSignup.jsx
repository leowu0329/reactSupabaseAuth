function ConfirmSignup() {
    const [email, setEmail] = React.useState('');
    const [modalConfig, setModalConfig] = React.useState(null);

    const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    const handleVerifyNotify = (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setModalConfig({ id: 'confModal', title: '格式錯誤', body: '請輸入正確的電子信箱格式！' });
            return;
        }
        setModalConfig({ id: 'confModal', title: '系統提示', body: `驗證信已重新發送至 ${email}，請查收。` });
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow text-center" style={{ width: '450px' }}>
                <i className="bi bi-envelope-check text-primary fs-1 mb-3"></i>
                <h3>等待信箱驗證</h3>
                <p className="text-muted mt-2">我們已寄送一封驗證信至您的電子信箱，請點擊信中連結激活帳號。</p>
                <hr />
                <form onSubmit={handleVerifyNotify}>
                    <div className="mb-3 text-start">
                        <label className="form-label">未收到信件？請輸入信箱重新發送：</label>
                        <input type="text" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
                    </div>
                    <button type="submit" className="btn btn-outline-secondary btn-sm w-100">重新發送驗證信</button>
                </form>
                <div className="mt-3">
                    <a href="#/login" className="btn btn-link btn-sm text-decoration-none">返回登入頁面</a>
                </div>
            </div>
            {modalConfig && <BootstrapModal {...modalConfig} />}
        </div>
    );
}
window.ConfirmSignup = ConfirmSignup;