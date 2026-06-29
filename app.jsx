const { HashRouter, Routes, Route, Navigate } = window.ReactRouterDOM;
const { Provider, useSelector, useDispatch } = window.ReactRedux;

function ProtectedRoute({ children }) {
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const isRecovering = window.location.href.includes('type=recovery') || sessionStorage.getItem('isRecovering') === 'true';
    if (!isAuthenticated && !isRecovering) return <Navigate to="/login" replace />;
    return children;
}

function PublicRoute({ children }) {
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    if (isAuthenticated) return <Navigate to="/home" replace />;
    return children;
}

function MainApp() {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

    React.useEffect(() => {
        window.supabaseClient.auth.getSession().then(({ data: { session } }) => {
            if (session) dispatch({ type: 'SET_AUTH', payload: { user: session.user, session } });
        });
        const { data: { subscription } } = window.supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                sessionStorage.setItem('isRecovering', 'true');
                if (session) dispatch({ type: 'SET_AUTH', payload: { user: session.user, session } });
                window.location.hash = '#/update-password';
            } else if (session) {
                dispatch({ type: 'SET_AUTH', payload: { user: session.user, session } });
            } else {
                dispatch({ type: 'CLEAR_AUTH' });
            }
        });
        return () => subscription.unsubscribe();
    }, [dispatch]);

    return (
        <HashRouter>
            <div className="d-flex" style={{ minHeight: '100vh', overflowX: 'hidden' }}>
                <SideBar />
                <div className="flex-grow-1 d-flex flex-column bg-light">
                    <Routes>
                        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                        <Route path="/confirm" element={<PublicRoute><ConfirmSignup /></PublicRoute>} />
                        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

                        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                        {/* 載入 IPQC 巡檢頁面 */}
                        <Route path="/ipqc" element={<ProtectedRoute><IpqcPage /></ProtectedRoute>} />
                        <Route path="/update-password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                        <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
                    </Routes>
                </div>
            </div>
        </HashRouter>
    );
}

window.supabaseInitialized.then(() => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
        <Provider store={window.store}>
            <MainApp />
        </Provider>
    );
});