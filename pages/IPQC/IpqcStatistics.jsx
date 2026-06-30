// =========================================================================
// 廠務高階管理元件：近半年工單類別品質交叉統計表 (修正：移除非法 mo_no 欄位版)
// =========================================================================
function IpqcStatistics() {
    const [loading, setLoading] = React.useState(true);
    const [statsData, setStatsData] = React.useState({});

    // 1. 定義製令工單識別碼與工作中心的對照表
    const categoryConfig = [
        { code: '5341', name: '泵浦' },
        { code: '5346', name: '機械' },
        { code: '5348', name: '射加' },
        { code: '5347', name: '射出' },
        { code: '5345', name: '燒崁' }
    ];

    const categories = ['泵浦', '機械', '射加', '射出', '燒崁'];
    const targetMonths = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
    const metrics = ['檢驗總數', '良品數', '不良總數', '不良率'];

    React.useEffect(() => {
        const fetchAndCalculateStatistics = async () => {
            try {
                setLoading(true);

                // 修正點：移除不存在的 mo_no, item_no 欄位，精確要求專案現有的真實欄位
                const { data, error } = await window.supabaseClient
                    .from('ipqc_list')
                    .select('date, order_number, product_number, product_name, spec, defect_classification, defect_status')
                    .gte('date', '2026-01-01')
                    .lte('date', '2026-06-30');

                if (error) throw error;

                // 初始化統計矩陣結構
                const matrix = {};
                categories.forEach(cat => {
                    matrix[cat] = {
                        months: { '2026-01': 0, '2026-02': 0, '2026-03': 0, '2026-04': 0, '2026-05': 0, '2026-06': 0 },
                        totalCheck: 0,
                        totalDefect: 0
                    };
                });

                if (data) {
                    data.forEach(rec => {
                        if (!rec.date) return;
                        
                        // 讀取專案真實存在的工單欄位 order_number
                        const orderStr = String(rec.order_number || '').trim();
                        const prodStr = String(rec.product_number || '').trim();
                        const nameStr = String(rec.product_name || '').trim();
                        const specStr = String(rec.spec || '').trim();
                        
                        const normMonth = rec.date.substring(0, 7);

                        if (!orderStr && !prodStr) return;

                        // 核心多維度匹配邏輯：全網掃描 5347 / 5348 等編號是否存在
                        const matchedCat = categoryConfig.find(cfg => 
                            orderStr.startsWith(cfg.code) || 
                            prodStr.includes(cfg.code) ||
                            nameStr.includes(cfg.code) ||
                            specStr.includes(cfg.code)
                        );

                        if (matchedCat && matrix[matchedCat.name] && matrix[matchedCat.name].months[normMonth] !== undefined) {
                            const catName = matchedCat.name;

                            // 判斷是否為有效異常不良品 (排除空值、"—" 與 "合格")
                            let rawType = rec.defect_classification || rec.defect_status;
                            const isDefect = rawType && rawType.trim() !== '' && rawType !== '—' && rawType !== '合格';

                            // 累加該月份的筆數趟次
                            matrix[catName].months[normMonth] += 1;
                            
                            // 累加總檢驗筆數 (分母)
                            matrix[catName].totalCheck += 1;

                            // 如果是不良，則累加總不良筆數 (分子)
                            if (isDefect) {
                                matrix[catName].totalDefect += 1;
                            }
                        }
                    });
                }

                setStatsData(matrix);
            } catch (err) {
                console.error("工單交叉統計計算失敗:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAndCalculateStatistics();
    }, []);

    if (loading) {
        return (
            <div className="text-center p-4">
                <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                <span className="small text-muted">工單大數據精準對齊中...</span>
            </div>
        );
    }

    return (
        <div className="table-responsive border rounded shadow-sm bg-white mt-4">
            <table className="table table-sm table-bordered text-center align-middle mb-0 small" style={{ minWidth: '700px' }}>
                <thead className="table-dark text-white">
                    <tr>
                        <th style={{ width: '16%', textAlign: 'left', paddingLeft: '12px' }} className="bg-dark fw-bold">
                            <i className="bi bi-calculator me-1"></i> 工單統計指標
                        </th>
                        {categories.map(cat => (
                            <th key={cat} style={{ width: '16.8%' }} className="fw-bold">
                                {cat} <span className="badge bg-secondary ms-1" style={{ fontSize: '10px' }}>
                                    {cat === '泵浦' ? '5341' : cat === '機械' ? '5346' : cat === '射加' ? '5348' : cat === '射出' ? '5347' : '5345'}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {targetMonths.map(month => (
                        <tr key={month} className="hover:bg-light">
                            <td style={{ textAlign: 'left', paddingLeft: '12px' }} className="fw-bold text-secondary bg-light">
                                {month}
                            </td>
                            {categories.map(cat => {
                                const count = statsData[cat]?.months[month] || 0;
                                return (
                                    <td key={cat} className={count > 0 ? "fw-bold text-dark" : "text-muted opacity-50"}>
                                        {count} 筆
                                    </td>
                                );
                            })}
                        </tr>
                    ))}

                    <tr style={{ borderWidth: '2px 0 0 0', borderColor: '#495057' }}></tr>

                    {metrics.map(metric => {
                        let rowStyle = "hover:bg-light";
                        let labelStyle = "fw-bold text-start ps-3 ";
                        
                        if (metric === '檢驗總數') { labelStyle += "text-primary bg-primary bg-opacity-10"; }
                        else if (metric === '良品數') { labelStyle += "text-success bg-success bg-opacity-10"; }
                        else if (metric === '不良總數') { labelStyle += "text-danger bg-danger bg-opacity-10"; }
                        else if (metric === '不良率') { labelStyle += "text-dark bg-warning bg-opacity-25 fw-bolder"; rowStyle = "table-warning bg-opacity-10"; }

                        return (
                            <tr key={metric} className={rowStyle}>
                                <td style={{ textAlign: 'left' }} className={labelStyle}>
                                    {metric === '檢驗總數' && <i className="bi bi-file-earmark-check me-1"></i>}
                                    {metric === '良品數' && <i className="bi bi-emoji-smile me-1"></i>}
                                    {metric === '不良總數' && <i className="bi bi-exclamation-triangle me-1"></i>}
                                    {metric === '不良率' && <i className="bi bi-percent me-1"></i>}
                                    {metric}
                                </td>
                                {categories.map(cat => {
                                    const check = statsData[cat]?.totalCheck || 0;
                                    const defect = statsData[cat]?.totalDefect || 0;
                                    const good = check - defect;
                                    const rate = check > 0 ? ((defect / check) * 100).toFixed(2) : "0.00";

                                    if (metric === '檢驗總數') return <td key={cat} className="fw-bold text-primary">{check} 筆</td>;
                                    if (metric === '良品數') return <td key={cat} className="fw-semibold text-success">{good} 筆</td>;
                                    if (metric === '不良總數') return <td key={cat} className={`fw-bold ${defect > 0 ? 'text-danger' : 'text-muted'}`}>{defect} 筆</td>;
                                    if (metric === '不良率') return <td key={cat} className={`fw-bolder ${parseFloat(rate) > 0 ? 'text-danger' : 'text-muted'}`}>{rate}%</td>;
                                    return <td key={cat}>-</td>;
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

window.IpqcStatistics = IpqcStatistics;