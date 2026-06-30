// ==========================================
// 數據中心視覺化圖表元件：不良分類分佈圖 (優化：單一長條圖代表當月不良總個數版)
// ==========================================
function IpqcChat() {
    const canvasRef = React.useRef(null);
    const chartInstanceRef = React.useRef(null);
    const [loading, setLoading] = React.useState(true);
    
    const [chartMonths, setChartMonths] = React.useState([]);
    const [defectTypes, setDefectTypes] = React.useState([]);
    const [matrixData, setMatrixData] = React.useState({}); 

    // 動態取得近 3 個月的 YYYY/MM 陣列，並推算 Supabase 篩選的起始日期
    const getRecentThreeMonthsConfig = () => {
        const months = [];
        const d = new Date();
        
        for (let i = 2; i >= 0; i--) {
            const targetDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
            const yyyy = targetDate.getFullYear();
            const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
            months.push(`${yyyy}/${mm}`);
        }

        const startDateObj = new Date(d.getFullYear(), d.getMonth() - 2, 1);
        const startYYYY = startDateObj.getFullYear();
        const startMM = String(startDateObj.getMonth() + 1).padStart(2, '0');
        const startRangeDate = `${startYYYY}-${startMM}-01`;

        return { months, startRangeDate };
    };

    const processChartData = (records, months) => {
        setChartMonths(months);
        
        const monthlyStats = {};
        months.forEach(m => {
            monthlyStats[m] = {
                totalQty: 0,        // 檢驗數：當月巡檢紀錄總筆數
                totalDefects: 0,    // 不良數：當月有異常的不良總個數 (長條圖數據來源)
                defectTypes: {}     // 各別不良分類細項的個數 (表格矩陣數據來源)
            };
        });

        const allDefectTypes = new Set();

        records.forEach(rec => {
            if (!rec.date) return;
            const normMonth = rec.date.replace(/-/g, '/').substring(0, 7);
            
            if (monthlyStats[normMonth]) {
                // 累加該月份巡檢的「總紀錄筆數」(分母)
                monthlyStats[normMonth].totalQty += 1;

                // 分析不良分類與細項狀態
                let rawType = rec.defect_classification || rec.defect_status;
                
                if (rawType && rawType.trim() !== '' && rawType !== '—' && rawType !== '合格') {
                    const dfType = rawType.trim();
                    allDefectTypes.add(dfType);
                    
                    // 關鍵修改：直接累加當月的不良總個數
                    monthlyStats[normMonth].totalDefects += 1;
                    // 同步計算當月該不良分類細項的個數
                    monthlyStats[normMonth].defectTypes[dfType] = (monthlyStats[normMonth].defectTypes[dfType] || 0) + 1;
                }
            }
        });

        const defectTypeList = Array.from(allDefectTypes);
        setDefectTypes(defectTypeList);

        const tableMatrix = {};
        months.forEach(m => {
            tableMatrix[m] = { ...monthlyStats[m].defectTypes };
        });
        setMatrixData(tableMatrix);

        // 構建 Chart.js 所需的數據集
        const datasets = [];

        // 1. 主座標 Y 軸 (左側)：只有唯一一組 Dataset，直接代表「當月不良總個數」
        const totalDefectPoints = months.map(m => monthlyStats[m].totalDefects);
        datasets.push({
            type: 'bar',
            label: '當月不良總個數',
            data: totalDefectPoints,
            backgroundColor: 'rgba(54, 162, 235, 0.8)', // 經典質感藍
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            barPercentage: 0.5, // 適度縮放長條圖寬度，使其看起來飽滿專業
            yAxisID: 'yLeft',
            order: 2
        });

        // 2. 副座標 Y 軸 (右側)：折線圖展示當月總不良率
        const rateDataPoints = months.map(m => {
            const stats = monthlyStats[m];
            if (stats.totalQty === 0) return 0;
            const rate = stats.totalDefects / stats.totalQty;
            return parseFloat((rate * 100).toFixed(2)); // 例如 2/3 筆 = 66.67%
        });

        datasets.push({
            type: 'line',
            label: '當月不良率 (%)',
            data: rateDataPoints,
            borderColor: '#e63946', // 警示紅
            backgroundColor: '#e63946',
            borderWidth: 3,
            pointBackgroundColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            tension: 0.1,
            yAxisID: 'yRight',
            order: 1
        });

        return { labels: months, datasets };
    };

    const renderChart = (chartData) => {
        if (!canvasRef.current) return;
        
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        
        chartInstanceRef.current = new Chart(ctx, {
            data: {
                labels: chartData.labels,
                datasets: chartData.datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '不良分類分佈圖',
                        font: { size: 16, weight: 'bold', family: 'Noto Sans TC' },
                        padding: { top: 5, bottom: 15 }
                    },
                    legend: {
                        position: 'top',
                        labels: { font: { family: 'Noto Sans TC', size: 12 } }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.dataset.yAxisID === 'yRight') {
                                    label += context.raw + '%';
                                } else {
                                    label += context.raw + ' 個';
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Noto Sans TC', weight: 'bold' } }
                    },
                    // 主座標 Y 軸：計算當月的不良分類總個數 (0-10 固定分為 10 等分)
                    yLeft: {
                        type: 'linear',
                        position: 'left',
                        min: 0,
                        max: 10,
                        title: {
                            display: true,
                            text: '當月不良總個數 (個)',
                            font: { weight: 'bold', family: 'Noto Sans TC' }
                        },
                        ticks: {
                            stepSize: 1, // 固定步長 1 
                            font: { family: 'Noto Sans TC' }
                        }
                    },
                    // 副座標 Y 軸：不良率 (0%-100% 固定分為 10 等分)
                    yRight: {
                        type: 'linear',
                        position: 'right',
                        min: 0,
                        max: 100,
                        title: {
                            display: true,
                            text: '不良率 (%)',
                            font: { weight: 'bold', family: 'Noto Sans TC' }
                        },
                        grid: {
                            drawOnChartArea: false 
                        },
                        ticks: {
                            stepSize: 10, // 固定步長 10%
                            callback: function(value) { return value + '%'; },
                            font: { family: 'Noto Sans TC' }
                        }
                    }
                }
            }
        });
    };

    React.useEffect(() => {
        const fetchChartRecords = async () => {
            try {
                setLoading(true);
                const { months, startRangeDate } = getRecentThreeMonthsConfig();

                const { data, error } = await window.supabaseClient
                    .from('ipqc_list')
                    .select('*')
                    .gte('date', startRangeDate);
                    
                if (error) throw error;

                if (data) {
                    const processed = processChartData(data, months);
                    renderChart(processed);
                }
            } catch (err) {
                console.error("圖表數據載入失敗:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchChartRecords();

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, []);

    return (
        <div className="card shadow-sm border-0 p-3 h-100" style={{ minHeight: '520px', position: 'relative' }}>
            {loading && (
                <div className="d-flex justify-content-center align-items-center h-100 position-absolute w-100 top-0 start-0 bg-white bg-opacity-75" style={{ zIndex: 10 }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">品質看板載入中...</span>
                    </div>
                </div>
            )}
            
            {/* 上方雙座標圖表 */}
            <div style={{ position: 'relative', height: '320px', width: '100%' }}>
                <canvas ref={canvasRef}></canvas>
            </div>

            {/* 下方動態數據矩陣對照表：依然精準保留各分類細項 */}
            {!loading && defectTypes.length > 0 && (
                <div className="table-responsive mt-3 border rounded shadow-sm bg-white">
                    <table className="table table-sm table-bordered text-center align-middle mb-0 small">
                        <thead className="table-light text-secondary fw-bold">
                            <tr>
                                <th style={{ width: '40%', textAlign: 'left', paddingLeft: '12px' }} className="bg-light">
                                    <i className="bi bi-grid-3x3-gap-fill me-1 text-primary"></i> 不良分類細項
                                </th>
                                {chartMonths.map(m => (
                                    <th key={m} style={{ width: '20%' }}>{m}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {defectTypes.map(dfType => (
                                <tr key={dfType} className="hover:bg-light">
                                    <td style={{ textAlign: 'left', paddingLeft: '12px' }} className="fw-semibold text-dark">
                                        {dfType}
                                    </td>
                                    {chartMonths.map(m => {
                                        const count = matrixData[m]?.[dfType] || 0;
                                        return (
                                            <td key={m} className={count > 0 ? "fw-bold text-danger bg-danger bg-opacity-10" : "text-muted"}>
                                                {count} 個
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {!loading && defectTypes.length === 0 && (
                <div className="text-center text-muted small mt-4 p-2 border border-dashed rounded">
                    💡 近三個月內無任何巡檢異常不良紀錄，製程良率表現優良。
                </div>
            )}
        </div>
    );
}

window.IpqcChat = IpqcChat;