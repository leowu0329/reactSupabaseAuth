const { useSelector, useDispatch } = window.ReactRedux;
const { Link, useNavigate, useLocation } = window.ReactRouterDOM;

function SideBar() {
    const sidebarOpen = useSelector(state => state.ui.sidebarOpen);
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    if (!isAuthenticated) return null;

    const handleLogoutClick = (e) => {
        e.preventDefault();
        const confirmLogout = window.confirm("您確定要登出工廠用戶管理系統嗎？");
        if (confirmLogout) {
            window.supabaseClient.auth.signOut().then(() => {
                dispatch({ type: 'CLEAR_AUTH' });
                navigate('/login');
            });
        }
    };

    const getNavLinkClass = (path) => {
        const baseClass = "nav-link text-white d-flex align-items-center rounded mb-1 py-3 px-2 transition-all ";
        const activeClass = location.pathname === path ? "bg-primary active" : "hover-dark";
        const justifyClass = sidebarOpen ? "" : "justify-content-center";
        return `${baseClass} ${activeClass} ${justifyClass}`;
    };

    return (
        <div 
            className="bg-dark text-white vh-100 p-2 d-flex flex-column shadow-sm" 
            style={{ 
                width: sidebarOpen ? '250px' : '70px', 
                transition: 'width 0.25s ease-in-out',
                position: 'relative',
                zIndex: 1020
            }}
        >
            <div className={`d-flex align-items-center ${sidebarOpen ? 'justify-content-between p-2' : 'justify-content-center py-2'}`}>
                {sidebarOpen && <span className="fw-bold text-truncate fs-5 text-uppercase text-info tracking-wider">製程管理系統</span>}
                <button className="btn btn-dark border-0 p-1" onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}>
                    <i className={`bi ${sidebarOpen ? 'bi-text-indent-right' : 'bi-list'} fs-4`}></i>
                </button>
            </div>
            <hr className="my-2 bg-secondary" />
            <ul className="nav nav-pills flex-column mb-auto px-1">
                <li className="nav-item">
                    <Link to="/home" className={getNavLinkClass('/home')}>
                        <i className={`bi bi-house-door fs-5 ${sidebarOpen ? 'me-3 ms-2' : 'me-0'}`}></i>
                        {sidebarOpen && <span className="text-truncate fw-medium">首頁系統</span>}
                    </Link>
                </li>
                {/* IPQC 巡檢選項，位置緊鄰首頁下方 */}
                <li className="nav-item">
                    <Link to="/ipqc" className={getNavLinkClass('/ipqc')}>
                        <i className={`bi bi-clipboard-check fs-5 ${sidebarOpen ? 'me-3 ms-2' : 'me-0'}`}></i>
                        {sidebarOpen && <span className="text-truncate fw-medium">IPQC 巡檢</span>}
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/profile" className={getNavLinkClass('/profile')}>
                        <i className={`bi bi-person-gear fs-5 ${sidebarOpen ? 'me-3 ms-2' : 'me-0'}`}></i>
                        {sidebarOpen && <span className="text-truncate fw-medium">修改個人訊息</span>}
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/update-password" className={getNavLinkClass('/update-password')}>
                        <i className={`bi bi-shield-lock fs-5 ${sidebarOpen ? 'me-3 ms-2' : 'me-0'}`}></i>
                        {sidebarOpen && <span className="text-truncate fw-medium">更改密碼</span>}
                    </Link>
                </li>
            </ul>
            <hr className="my-2 bg-secondary" />
            <ul className="nav nav-pills flex-column px-1 mb-2">
                <li className="nav-item">
                    <a href="#" onClick={handleLogoutClick} className={`nav-link text-danger d-flex align-items-center rounded py-3 px-2 ${sidebarOpen ? '' : 'justify-content-center'}`} style={{ backgroundColor: 'rgba(220, 53, 69, 0.05)' }}>
                        <i className={`bi bi-box-arrow-right fs-5 ${sidebarOpen ? 'me-3 ms-2' : 'me-0'}`}></i>
                        {sidebarOpen && <span className="fw-bold">登出系統</span>}
                    </a>
                </li>
            </ul>
            <style>{`.hover-dark:hover { background-color: rgba(255, 255, 255, 0.08) !important; } .transition-all { transition: all 0.2s ease-in-out; }`}</style>
        </div>
    );
}
window.SideBar = SideBar;