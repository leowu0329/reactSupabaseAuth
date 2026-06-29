// ==========================================
// 關聯子表專用：整合型多功能 CRUD 模組彈窗元件
// ==========================================
function SubTableManagerModal({ tableName, title, onClose, onRefreshOptions }) {
    const [records, setRecords] = React.useState([]);
    const [search, setSearch] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [editItem, setEditItem] = React.useState(null);
    const [formData, setFormData] = React.useState({});
    const itemsPerPage = 5;

    const getFieldsByTable = () => {
        switch(tableName) {
            case 'defect_list': return ['defect_type', 'description'];
            case 'operator_list': return ['department', 'name'];
            case 'order_list': return ['order_number', 'product_number', 'product_name', 'quantity'];
            case 'spec_list': return ['product_number', 'product_name', 'spec', 'version', 'inspection_hours'];
            default: return [];
        }
    };

    const fields = getFieldsByTable();

    const fetchRecords = async () => {
        const { data, error } = await window.supabaseClient.from(tableName).select('*').order('id', { ascending: false });
        if (!error && data) setRecords(data);
    };

    React.useEffect(() => { fetchRecords(); }, [tableName]);

    const filtered = records.filter(r => 
        Object.values(r).some(v => String(v || '').toLowerCase().includes(search.toLowerCase()))
    );

    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const handleSave = async (e) => {
        e.preventDefault();
        // 確保子表的數字型態正確
        const cleanedData = { ...formData };
        if (cleanedData.quantity) cleanedData.quantity = parseInt(cleanedData.quantity, 10) || 0;
        if (cleanedData.inspection_hours) cleanedData.inspection_hours = parseFloat(cleanedData.inspection_hours) || 0;

        if (editItem) {
            const { error } = await window.supabaseClient.from(tableName).update(cleanedData).eq('id', editItem.id);
            if(error) alert(error.message);
        } else {
            const { error } = await window.supabaseClient.from(tableName).insert([cleanedData]);
            if(error) alert(error.message);
        }
        setEditItem(null);
        setFormData({});
        fetchRecords();
        if (onRefreshOptions) onRefreshOptions();
    };

    const handleDelete = async (id) => {
        if (window.confirm("確定要刪除此筆關聯紀錄嗎？")) {
            await window.supabaseClient.from(tableName).delete().eq('id', id);
            fetchRecords();
            if (onRefreshOptions) onRefreshOptions();
        }
    };

    const handleImportExcel = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rawData = XLSX.utils.sheet_to_json(ws);
            if (rawData.length > 0) {
                const { error } = await window.supabaseClient.from(tableName).insert(rawData);
                if (error) alert("匯入失敗：" + error.message);
                else {
                    fetchRecords();
                    if (onRefreshOptions) onRefreshOptions();
                    alert("子表資料匯入成功！");
                }
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(records);
        const wb = XLSX.utils.book_new();
        XLSX.book_append_sheet(wb, ws, "Backup_Data");
        XLSX.writeFile(wb, `IPQC_SubTable_${tableName}.xlsx`);
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 1060 }} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header bg-secondary text-white">
                        <h5 className="modal-title"><i className="bi bi-folder-symlink-fill me-2"></i>關聯庫維護：{title}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                        <div className="d-flex justify-content-between mb-3 align-items-center gap-2">
                            <input type="text" className="form-control form-control-sm w-50" placeholder="搜尋子表關鍵字..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                            <div>
                                <button className="btn btn-sm btn-outline-success me-2" onClick={handleExportExcel}><i className="bi bi-download"></i> 匯出備份</button>
                                <label className="btn btn-sm btn-outline-primary mb-0 me-2 cursor-pointer">
                                    <i className="bi bi-upload"></i> 匯入資料 <input type="file" accept=".xlsx, .xls" hidden onChange={handleImportExcel} />
                                </label>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="row g-2 mb-4 bg-light p-3 rounded border">
                            <div className="col-12"><h6 className="fw-bold text-secondary mb-1">{editItem ? "✏️ 編輯選定項目" : "➕ 新增項目欄位"}</h6></div>
                            {fields.map(col => (
                                <div className="col-md-4" key={col}>
                                    <label className="form-label small mb-0 fw-medium text-capitalize">{col}</label>
                                    <input 
                                        type={col === 'quantity' || col === 'inspection_hours' ? 'number' : 'text'} 
                                        className="form-control form-control-sm" 
                                        value={formData[col] || ''} 
                                        onChange={e => setFormData({ ...formData, [col]: e.target.value })} 
                                        required={col.includes('number') || col.includes('name') || col.includes('type')}
                                    />
                                </div>
                            ))}
                            <div className="col-md-4 d-flex align-items-end gap-1">
                                <button type="submit" className="btn btn-sm btn-dark flex-grow-1">{editItem ? "儲存更新" : "確認新增"}</button>
                                {editItem && <button type="button" className="btn btn-sm btn-light border" onClick={() => { setEditItem(null); setFormData({}); }}>取消</button>}
                            </div>
                        </form>

                        <table className="table table-sm table-striped border text-center align-middle">
                            <thead className="table-dark">
                                <tr>
                                    {fields.map(c => <th key={c}>{c}</th>)}
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(r => (
                                    <tr key={r.id}>
                                        {fields.map(c => <td key={c}>{String(r[c] || '')}</td>)}
                                        <td>
                                            <i className="bi bi-pencil-square text-primary me-2 cursor-pointer" onClick={() => { setEditItem(r); setFormData(r); }}></i>
                                            <i className="bi bi-trash text-danger cursor-pointer" onClick={() => handleDelete(r.id)}></i>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="d-flex justify-content-between align-items-center mt-2 small">
                            <span className="text-muted">第 {currentPage} / {totalPages || 1} 頁</span>
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}><button type="button" className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>上頁</button></li>
                                <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}><button type="button" className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>下頁</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


// ==========================================
// 主控制台頁面：IPQC 巡檢管理控制台
// ==========================================
function IpqcPage() {
    const [ipqcRecords, setIpqcRecords] = React.useState([]);
    const [searchKeyword, setSearchKeyword] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [showMainModal, setShowMainModal] = React.useState(false);
    const [currentEditId, setCurrentEditId] = React.useState(null);
    
    const [subModalConfig, setSubModalConfig] = React.useState(null);

    const [operators, setOperators] = React.useState([]);
    const [defects, setDefects] = React.useState([]);
    const [orders, setOrders] = React.useState([]);
    const [specs, setSpecs] = React.useState([]);

    const [orderSuggestions, setOrderSuggestions] = React.useState([]);

    const initialFormState = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        order_number: '',
        operator: '',
        draw_ver: '',
        product_number: '',
        product_name: '',
        spec: '',
        quantity: 0,
        inspector: '',
        defect_classification: '',
        defect_status: '',
        handling_measures: '',
        remark: ''
    };
    const [mainForm, setMainForm] = React.useState(initialFormState);
    const recordsPerPage = 10;

    const loadAllReferences = async () => {
        const { data: op } = await window.supabaseClient.from('operator_list').select('*');
        if (op) setOperators(op);
        const { data: df } = await window.supabaseClient.from('defect_list').select('*');
        if (df) setDefects(df);
        const { data: od } = await window.supabaseClient.from('order_list').select('*');
        if (od) setOrders(od);
        const { data: sp } = await window.supabaseClient.from('spec_list').select('*');
        if (sp) setSpecs(sp);
    };

    const fetchMainRecords = async () => {
        const { data, error } = await window.supabaseClient
            .from('ipqc_list')
            .select('*')
            .order('date', { ascending: false })
            .order('time', { ascending: false });
        if (!error && data) setIpqcRecords(data);
    };

    React.useEffect(() => {
        fetchMainRecords();
        loadAllReferences();
    }, []);

    const filteredIpqc = ipqcRecords.filter(r => 
        Object.values(r).some(val => String(val || '').toLowerCase().includes(searchKeyword.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredIpqc.length / recordsPerPage);
    const paginatedIpqc = filteredIpqc.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

    const handleDeleteMain = async (id) => {
        if (window.confirm("您確定要刪除此筆 IPQC 檢驗紀錄嗎？")) {
            await window.supabaseClient.from('ipqc_list').delete().eq('id', id);
            fetchMainRecords();
        }
    };

    const handleOrderInputEvent = (val) => {
        setMainForm(prev => ({ ...prev, order_number: val }));
        if (val.trim() === '') {
            setOrderSuggestions([]);
            return;
        }
        const matched = orders.filter(o => o.order_number.toLowerCase().includes(val.toLowerCase()));
        setOrderSuggestions(matched);
    };

    const selectOrderAndCascadeInject = (selectedOrder) => {
        const matchedSpecObj = specs.find(s => s.product_number === selectedOrder.product_number);
        
        setMainForm(prev => ({
            ...prev,
            order_number: selectedOrder.order_number,
            product_number: selectedOrder.product_number,
            product_name: selectedOrder.product_name,
            quantity: selectedOrder.quantity || 0,
            spec: matchedSpecObj ? matchedSpecObj.spec : '',
            draw_ver: matchedSpecObj ? matchedSpecObj.version : ''
        }));
        setOrderSuggestions([]);
    };

    // 核心修正：處理主表單提交，精確防禦 400 型態與 ID 對齊錯誤
    const handleMainSubmit = async (e) => {
        e.preventDefault();
        
        // 轉換並建立乾淨且符合 PostgreSQL 資料庫型態的 Payload
        const submitPayload = {
            date: mainForm.date,
            time: mainForm.time,
            order_number: mainForm.order_number,
            operator: mainForm.operator,
            draw_ver: mainForm.draw_ver,
            product_number: mainForm.product_number,
            product_name: mainForm.product_name,
            spec: mainForm.spec,
            quantity: parseInt(mainForm.quantity, 10) || 0, // 確保為 int 型態
            inspector: mainForm.inspector,
            defect_classification: mainForm.defect_classification || null,
            defect_status: mainForm.defect_status,
            handling_measures: mainForm.handling_measures,
            remark: mainForm.remark
        };

        if (currentEditId) {
            // 編輯狀態：使用明確的 update 語法並指定特定 id，排除主鍵衝突
            const { error } = await window.supabaseClient
                .from('ipqc_list')
                .update(submitPayload)
                .eq('id', currentEditId);
                
            if (error) {
                alert("更新失敗原因: " + error.message);
                return;
            }
        } else {
            // 新增狀態
            const { error } = await window.supabaseClient
                .from('ipqc_list')
                .insert([submitPayload]);
                
            if (error) {
                alert("新增失敗原因: " + error.message);
                return;
            }
        }
        
        setShowMainModal(false);
        setCurrentEditId(null);
        fetchMainRecords();
    };

    const handleMainExcelExport = () => {
        const ws = XLSX.utils.json_to_sheet(ipqcRecords);
        const wb = XLSX.utils.book_new();
        XLSX.book_append_sheet(wb, ws, "IPQC_Backup");
        XLSX.writeFile(wb, "IPQC_Inspection_Master_List.xlsx");
    };

    const handleMainExcelImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const rawData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            if (rawData.length > 0) {
                await window.supabaseClient.from('ipqc_list').insert(rawData);
                fetchMainRecords();
                alert("IPQC 檢驗主表紀錄匯入完畢！");
            }
        };
        reader.readAsBinaryString(file);
    };

    const renderTruncatedText = (text) => {
        const str = String(text || '');
        if (str.length > 10) {
            return (
                <span className="text-truncate-custom" title={str} style={{ cursor: 'help' }}>
                    {str.substring(0, 10)}...
                </span>
            );
        }
        return <span>{str || '—'}</span>;
    };

    const getVisiblePageNumbers = () => {
        const pages = [];
        if (totalPages <= 3) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage === 1) {
                pages.push(1, 2, 3);
            } else if (currentPage === totalPages) {
                pages.push(totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(currentPage - 1, currentPage, currentPage + 1);
            }
        }
        return pages;
    };

    return (
        <div className="container-fluid p-4" style={{ minHeight: '100vh' }}>
            <div className="card shadow border-0 p-4">
                <h3 className="mb-4 text-dark fw-bold d-flex align-items-center"><i className="bi bi-check2-circle text-success me-2"></i> IPQC 巡檢數據中心面板</h3>
                
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    <div className="d-flex align-items-center w-50" style={{ minWidth: '300px' }}>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                            <input type="text" className="form-control border-start-0" placeholder="輸入全表關鍵字進行即時搜尋..." value={searchKeyword} onChange={e => { setSearchKeyword(e.target.value); setCurrentPage(1); }} />
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-primary shadow-sm px-3" onClick={() => { 
                            setCurrentEditId(null); 
                            setMainForm(initialFormState);
                            setShowMainModal(true); 
                        }}><i className="bi bi-plus-circle-fill"></i> 新增紀錄</button>
                        <button className="btn btn-outline-success" onClick={handleMainExcelExport}><i className="bi bi-file-earmark-arrow-down"></i> 匯出備份</button>
                        <label className="btn btn-outline-primary mb-0 cursor-pointer">
                            <i className="bi bi-file-earmark-arrow-up"></i> 匯入資料 <input type="file" accept=".xlsx, .xls" hidden onChange={handleMainExcelImport} />
                        </label>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle text-center border">
                        <thead className="table-dark">
                            <tr>
                                <th>日期</th> 
                                <th>工單號碼</th>
                                <th>品號/品名/規格</th> 
                                <th>抽樣數量</th>
                                <th>不良分類</th>
                                <th>不良狀態</th>
                                <th>處置措施</th>
                                <th>備註</th>
                                <th>資料操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedIpqc.map(row => (
                                <tr key={row.id}>
                                    <td>
                                        <span className="fw-bold">{row.date}</span>
                                        <br />
                                        <small className="text-muted">{row.time}</small>
                                    </td>
                                    <td className="fw-medium text-primary text-uppercase">{row.order_number}</td>
                                    <td className="text-start ps-3">
                                        <div className="text-truncate" style={{ maxWidth: '280px' }}>
                                            <span className="text-secondary fw-semibold">編號:</span> {row.product_number}<br/>
                                            <span className="text-secondary fw-semibold">品名:</span> {row.product_name}<br/>
                                            <span className="text-muted fw-semibold">規格:</span> <small>{row.spec}</small>
                                        </div>
                                    </td>
                                    <td className="fw-bold text-dark">{row.quantity}</td>
                                    <td>{row.defect_classification || <span className="text-muted">—</span>}</td>
                                    <td>{renderTruncatedText(row.defect_status)}</td>
                                    <td>{renderTruncatedText(row.handling_measures)}</td>
                                    <td>{renderTruncatedText(row.remark)}</td>
                                    <td>
                                        <div className="btn-group btn-group-sm">
                                            {/* 修正點：點擊編輯時明確快取目前記錄的 id 序號 */}
                                            <button type="button" className="btn btn-light border text-primary" onClick={() => { setCurrentEditId(row.id); setMainForm({ ...row }); setShowMainModal(true); }}><i className="bi bi-pencil-square"></i></button>
                                            <button type="button" className="btn btn-light border text-danger" onClick={() => handleDeleteMain(row.id)}><i className="bi bi-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedIpqc.length === 0 && (
                                <tr><td colSpan="9" className="text-muted py-4">查無對應的巡檢紀錄數據</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">顯示第 {currentPage} / {totalPages || 1} 頁 (總共 {filteredIpqc.length} 筆)</small>
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button type="button" className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>上一頁</button>
                            </li>
                            {getVisiblePageNumbers().map(pageNum => (
                                <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                    <button type="button" className="page-link" onClick={() => setCurrentPage(pageNum)}>{pageNum}</button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                                <button type="button" className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>下一頁</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* 主表單新增/編輯彈窗 (Modal) */}
            {showMainModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }} tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header bg-dark text-white">
                                <h5 className="modal-title"><i className="bi bi-pencil-square me-2"></i>{currentEditId ? "修改巡檢紀錄數據" : "建立常規製程 IPQC 紀錄"}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowMainModal(false)}></button>
                            </div>
                            <form onSubmit={handleMainSubmit}>
                                <div className="modal-body row g-3" style={{ maxHeight: 'calc(100vh - 210px)', overflowY: 'auto' }}>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">巡檢日期</label>
                                        <input type="date" className="form-control" value={mainForm.date} onChange={e => setMainForm({ ...mainForm, date: e.target.value })} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">巡檢時間點</label>
                                        <input type="text" className="form-control" placeholder="例如：14:00" value={mainForm.time} onChange={e => setMainForm({ ...mainForm, time: e.target.value })} required />
                                    </div>
                                    
                                    <div className="col-md-6 position-relative">
                                        <label className="form-label small fw-bold d-flex justify-content-between">
                                            工單號碼 (輸入自動補全)
                                            <i className="bi bi-plus-square-fill text-success cursor-pointer" title="維護工單庫" onClick={() => setSubModalConfig({ tableName: 'order_list', title: '工單號碼庫 (order_list)' })}></i>
                                        </label>
                                        <input type="text" className="form-control" placeholder="鍵入工單關鍵字觸發補全..." value={mainForm.order_number || ''} onChange={e => handleOrderInputEvent(e.target.value)} required />
                                        {orderSuggestions.length > 0 && (
                                            <ul className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 1050, maxHeight: '180px', overflowY: 'auto' }}>
                                                {orderSuggestions.map(o => (
                                                    <li key={o.id} className="list-group-item list-group-item-action cursor-pointer small py-2" onClick={() => selectOrderAndCascadeInject(o)}>
                                                        ⚙️ <strong>{o.order_number}</strong> | {o.product_name}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold d-flex justify-content-between">
                                            產品規格 (連動帶入)
                                            <i className="bi bi-plus-square-fill text-success cursor-pointer" title="維護規格庫" onClick={() => setSubModalConfig({ tableName: 'spec_list', title: '產品規格與圖面庫 (spec_list)' })}></i>
                                        </label>
                                        <input type="text" className="form-control bg-light text-secondary" value={mainForm.spec || ''} placeholder="隨工單關聯自動載入" readOnly />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold">品號 (自動帶入)</label>
                                        <input type="text" className="form-control bg-light" value={mainForm.product_number || ''} readOnly />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold">品名 (自動帶入)</label>
                                        <input type="text" className="form-control bg-light" value={mainForm.product_name || ''} readOnly />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold">工單派產數量 (自動帶入)</label>
                                        <input type="number" className="form-control bg-light" value={mainForm.quantity || 0} readOnly />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">圖面版本 (自動帶入)</label>
                                        <input type="text" className="form-control bg-light" value={mainForm.draw_ver || ''} readOnly />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold d-flex justify-content-between">
                                            現場操作員
                                            <i className="bi bi-plus-square-fill text-success cursor-pointer" title="維護操作員名冊" onClick={() => setSubModalConfig({ tableName: 'operator_list', title: '現場操作人員名冊 (operator_list)' })}></i>
                                        </label>
                                        <select className="form-select" value={mainForm.operator || ''} onChange={e => setMainForm({ ...mainForm, operator: e.target.value })} required>
                                            <option value="">-- 選取現場負責人員 --</option>
                                            {operators.map((op) => <option key={op.id} value={op.name}>{op.name} ({op.department || '現場班組'})</option>)}
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold d-flex justify-content-between">
                                            不良分類
                                            <i className="bi bi-plus-square-fill text-success cursor-pointer" title="維護不良定義庫" onClick={() => setSubModalConfig({ tableName: 'defect_list', title: '異常及不良分類型態庫 (defect_list)' })}></i>
                                        </label>
                                        <select className="form-select" value={mainForm.defect_classification || ''} onChange={e => setMainForm({ ...mainForm, defect_classification: e.target.value })}>
                                            <option value="">-- 無不良狀況 (品項良品) --</option>
                                            {defects.map((df) => <option key={df.id} value={df.defect_type}>{df.defect_type}</option>)}
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">實際檢驗員 (Inspector)</label>
                                        <input type="text" className="form-control" placeholder="請填寫稽核工程師姓名" value={mainForm.inspector || ''} onChange={e => setMainForm({ ...mainForm, inspector: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">現況不良具體狀態</label>
                                        <input type="text" className="form-control" placeholder="如：表面刮傷 2mm" value={mainForm.defect_status || ''} onChange={e => setMainForm({ ...mainForm, defect_status: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">現場即時處置措施</label>
                                        <input type="text" className="form-control" placeholder="如：現場停機隔離" value={mainForm.handling_measures || ''} onChange={e => setMainForm({ ...mainForm, handling_measures: e.target.value })} />
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label small fw-bold">備註說明</label>
                                        <textarea className="form-control" rows="2" placeholder="詳細描述現況其餘製程輔助參數..." value={mainForm.remark || ''} onChange={e => setMainForm({ ...mainForm, remark: e.target.value })}></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light py-2">
                                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowMainModal(false)}>取消返回</button>
                                    <button type="submit" className="btn btn-sm btn-primary px-4">儲存並送出</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {subModalConfig && (
                <SubTableManagerModal 
                    tableName={subModalConfig.tableName}
                    title={subModalConfig.title}
                    onClose={() => setSubModalConfig(null)}
                    onRefreshOptions={() => { loadAllReferences(); fetchMainRecords(); }}
                />
            )}
            
            <style>{`.cursor-pointer { cursor: pointer; } .cursor-pointer:hover { opacity: 0.8; } .text-truncate-custom { border-bottom: 1px dotted #6c757d; color: #0d6efd; }`}</style>
        </div>
    );
}

window.IpqcPage = IpqcPage;