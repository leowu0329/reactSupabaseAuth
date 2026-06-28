const { useSelector } = window.ReactRedux;

function Home() {
    const user = useSelector(state => state.auth.user);

    return (
        <div className="card p-4 shadow w-100 m-3">
            <h2>歡迎登入系統，首頁控制台</h2>
            <p className="text-muted">當前帳號身分證明安全。透過選單可切換工廠工單資訊或人員帳號調整。</p>
            <div className="row mt-4">
                <div className="col-md-6 col-lg-4 mb-3">
                    <div className="card bg-light border-0 p-3 h-100">
                        <h5>使用者資訊</h5>
                        <p className="small mb-1">帳號信箱: {user?.email}</p>
                        <p className="small mb-0">UID: {user?.id}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
window.Home = Home;