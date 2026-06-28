const { useSelector } = window.ReactRedux;

function Profile() {
    const user = useSelector(state => state.auth.user);
    const [profile, setProfile] = React.useState({
        username: '', 
        nickname: '', 
        birthday: '', 
        idCard: '', 
        phone: '', 
        factory: '', 
        department: '', 
        jobTitle: '', 
        roleType: '',
        address: ''
    });
    const [modalConfig, setModalConfig] = React.useState(null);

    React.useEffect(() => {
        if (!user) return;
        
        window.supabaseClient
            .from('profile_list')
            .select('*')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
                if (data) {
                    setProfile({
                        username: data.username || '',
                        nickname: data.nickname || '',
                        birthday: data.birthday || '',
                        idCard: data.id_card || '',
                        phone: data.phone || '',
                        factory: data.factory || '',
                        department: data.department || '',
                        jobTitle: data.job_title || '',
                        roleType: data.role_type || '',
                        address: data.address || ''
                    });
                } else {
                    setProfile(prev => ({ ...prev, username: user.user_metadata?.display_name || '' }));
                }
            });
    }, [user]);

    const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

    const handleSave = async (e) => {
        e.preventDefault();
        
        const dbPayload = {
            id: user.id,
            username: profile.username,
            nickname: profile.nickname,
            birthday: profile.birthday || null,
            id_card: profile.idCard,
            phone: profile.phone,
            factory: profile.factory,
            department: profile.department,
            job_title: profile.jobTitle,
            role_type: profile.roleType,
            address: profile.address,
            updated_at: new Date()
        };

        const { error } = await window.supabaseClient
            .from('profile_list')
            .upsert(dbPayload);

        if (error) {
            setModalConfig({ id: 'profModal', title: '更新失敗', body: error.message });
        } else {
            setModalConfig({ id: 'profModal', title: '更新成功', body: '個人資料已成功保存至 profile_list。' });
        }
    };

    return (
        // 外層 Flex 容器：實現完美的水平與垂直置中
        <div className="d-flex justify-content-center align-items-center w-100 p-3" style={{ minHeight: 'calc(100vh - 1rem)' }}>
            <div className="card p-4 shadow w-100" style={{ maxWidth: '800px' }}>
                <h3 className="mb-4 text-center text-md-start">修改個人基本訊息</h3>
                <form onSubmit={handleSave} className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">電子信箱 (不可修改)</label>
                        <input type="text" className="form-control" value={user?.email || ''} disabled />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">使用者帳號</label>
                        <input type="text" name="username" className="form-control" value={profile.username} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">暱稱</label>
                        <input type="text" name="nickname" className="form-control" value={profile.nickname} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">生日</label>
                        <input type="date" name="birthday" className="form-control" value={profile.birthday} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">身分證字號 / ID</label>
                        <input type="text" name="idCard" className="form-control" value={profile.idCard} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">手機號碼</label>
                        <input type="text" name="phone" className="form-control" value={profile.phone} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">廠別</label>
                        <input type="text" name="factory" className="form-control" value={profile.factory} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">部門</label>
                        <input type="text" name="department" className="form-control" value={profile.department} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">職稱</label>
                        <input type="text" name="jobTitle" className="form-control" value={profile.jobTitle} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">身分別</label>
                        <input type="text" name="roleType" className="form-control" value={profile.roleType} onChange={handleChange} />
                    </div>
                    <div className="col-md-12">
                        <label className="form-label">通訊地址</label>
                        <input type="text" name="address" className="form-control" value={profile.address} onChange={handleChange} />
                    </div>
                    <div className="col-12 mt-4 text-end">
                        <button type="submit" className="btn btn-primary px-4">儲存個人設定</button>
                    </div>
                </form>
            </div>
            {modalConfig && <BootstrapModal {...modalConfig} />}
        </div>
    );
}
window.Profile = Profile;