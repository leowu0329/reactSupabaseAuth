// ==========================================
// 系統首頁控制台組件 (Home.jsx) - 已修正狀態防錯
// ==========================================
function Home() {
    // ----------------------------------------------------------------
    // 安全容錯處理：相容不同的全域 Zustand 狀態庫掛載方式，防止 Hook 崩潰
    // ----------------------------------------------------------------
    let authData = { user: null, userProfile: null };
    
    // 安全地取得可能存在的主權限 Hook
    const useAuth = window.useAuthStore || (window.store && window.store.useAuthStore);

    if (typeof useAuth === 'function') {
        try {
            authData = useAuth();
        } catch (e) {
            console.warn("嘗試讀取全域狀態庫時發生非致命錯誤，將啟用本地快取或預設值:", e);
        }
    } else {
        console.warn("偵測到 window.useAuthStore 尚未註冊為函數，系統已自動啟用安全防禦機制。");
    }

    const { user, userProfile } = authData;

    return (
        <div className="container-fluid p-4" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* 頂部歡迎橫幅 */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm p-4 bg-dark text-white rounded-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h2 className="fw-bold mb-1">
                                    🌟 歡迎回來，{userProfile?.nickname || user?.email?.split('@')[0] || '工作夥伴'}
                                </h2>
                                <p className="text-light opacity-75 mb-0 small">
                                    目前登入權限：<span className="badge bg-success">{userProfile?.role || '操作員'}</span>
                                </p>
                            </div>
                            <div className="d-none d-md-block text-end">
                                <span className="text-white-50 small">系統統計時間</span>
                                <h5 className="fw-semibold mb-0">{new Date().toLocaleDateString('zh-TW')}</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 主內容區 */}
            <div className="row g-4">
                {/* 左側資訊區 */}
                <div className="col-lg-4">
                    <div className="row g-3">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm p-3 rounded-3 bg-white">
                                <h5 className="fw-bold text-secondary mb-3">
                                    <i className="bi bi-rocket-takeoff-fill text-warning me-2"></i>功能模組快速導覽
                                </h5>
                                <div className="list-group list-group-flush">
                                    <div className="list-group-item d-flex justify-content-between align-items-center px-1">
                                        <div>
                                            <h6 className="mb-0 fw-semibold">常規製程 IPQC</h6>
                                            <small className="text-muted">製程巡檢資料登錄與防錯</small>
                                        </div>
                                        <span className="badge bg-primary rounded-pill">數據中心</span>
                                    </div>
                                    <div className="list-group-item d-flex justify-content-between align-items-center px-1">
                                        <div>
                                            <h6 className="mb-0 fw-semibold">名冊管理庫</h6>
                                            <small className="text-muted">操作員、工單及規格對應表</small>
                                        </div>
                                        <span className="badge bg-secondary rounded-pill">後台配置</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12">
                            <div className="card border-0 shadow-sm p-3 rounded-3 bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #4f46e5, #3b82f6)' }}>
                                <h6 className="text-uppercase opacity-75 mb-2 small fw-bold">品質巡檢公告</h6>
                                <p className="mb-0 small leading-relaxed">
                                    請品管課巡檢同仁務必落實產線抽樣檢驗，若發現異常分類項目，應第一時間通知現場操作員停機處置，並完整填報追溯紀錄。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 右側資訊區：已徹底移除舊有帳號/UID 資訊，改為載入全新的不良分類分佈圖 */}
                <div className="col-lg-8">
                    {window.IpqcChat ? (
                        <window.IpqcChat />
                    ) : (
                        <div className="card border-0 shadow-sm p-4 text-center text-muted">
                            <i className="bi bi-exclamation-triangle-fill text-warning fs-1 mb-2"></i>
                            <p>品質圖表組件載入中或找不到組件，請檢查 `pages/IPQC/IpqcChat.jsx` 是否正確配置。</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// 註冊至全域視窗供 app.jsx 路由渲染
window.Home = Home;