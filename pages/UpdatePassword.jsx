function UpdatePassword() {
    const [passwords, setPasswords] = React.useState({ current: '', newPass: '', confirmNew: '' });
    const [modalConfig, setModalConfig] = React.useState(null);

    const handleChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (passwords.newPass !== passwords.confirmNew) {
            setModalConfig({ id: 'passModal', title: '修改失敗', body: '新密碼與確認新密碼不相符！' });
            return;
        }

        const { error } = await window.supabaseClient.auth.updateUser({
            password: passwords.newPass
        });

        if (error) {
            setModalConfig({ id: 'passModal', title: '修改失敗', body: error.message });
        } else {
            setModalConfig({ id: 'passModal', title: '修改成功', body: '您的密碼已成功更新！' });
            setPasswords({ current: '', newPass: '', confirmNew: '' });
        }
    };

    return (
        // 外層 Flex 容器：實現完美的水平與垂直置中
        <div className="d-flex justify-content-center align-items-center w-100 p-3" style={{ minHeight: 'calc(100vh - 1rem)' }}>
            <div className="card p-4 shadow w-100" style={{ maxWidth: '450px' }}>
                <h3 className="mb-4 text-center">變更帳號密碼</h3>
                <form onSubmit={handleUpdate}>
                    <div className="mb-3">
                        <label className="form-label">目前密碼</label>
                        <PasswordInput name="current" value={passwords.current} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">輸入新密碼</label>
                        <PasswordInput name="newPass" value={passwords.newPass} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">確認新密碼</label>
                        <PasswordInput name="confirmNew" value={passwords.confirmNew} onChange={handleChange} />
                    </div>
                    <button type="submit" className="btn btn-warning w-100 mt-2">確認修改密碼</button>
                </form>
            </div>
            {modalConfig && <BootstrapModal {...modalConfig} />}
        </div>
    );
}
window.UpdatePassword = UpdatePassword;