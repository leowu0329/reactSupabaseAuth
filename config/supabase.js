// 初始化一個 Promise，確保全域在變數載入完成前不會搶先呼叫
window.supabaseInitialized = (async function initSupabase() {
    let url = "";
    let key = "";

    try {
        // 1. 嘗試讀取本地的 env.json
        const response = await fetch('./env.json');
        if (response.ok) {
            const env = await response.json();
            url = env.SUPABASE_URL;
            key = env.SUPABASE_ANON_KEY;
        } else {
            // 2. 如果讀不到（代表在 Vercel 環境中），嘗試從 Vercel 產生的全域變數或 window 中讀取
            // Vercel 部署 HTML 時，若有設定 Environment Variables，可透過系統底層或以下標準全域變數對接
            url = window.process?.env?.SUPABASE_URL || "";
            key = window.process?.env?.SUPABASE_ANON_KEY || "";
        }
    } catch (e) {
        console.log("本地 env.json 不存在，切換至雲端生產環境變數");
    }

    // 如果上面都抓不到，最後防線（相容 Vercel 注入的最佳實踐：由 Vercel Edge Server 或是環境替換）
    // 這裡我們直接建立 Supabase Client
    const { createClient } = window.supabase;
    
    if (!url || !key) {
        // 警告：如果都沒有，代表尚未在 Vercel 後台設定變數
        console.error("錯誤：找不到 SUPABASE_URL 或 SUPABASE_ANON_KEY，請確認 Vercel 後台設定！");
    }

    const supabase = createClient(url, key);
    window.supabaseClient = supabase;
    return supabase;
})();