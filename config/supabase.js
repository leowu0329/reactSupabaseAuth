window.supabaseInitialized = (async function initSupabase() {
    let url = "";
    let key = "";

    try {
        // 1. 先嘗試讀取本地開發環境的 env.json
        const response = await fetch('./env.json');
        if (response.ok) {
            const env = await response.json();
            url = env.SUPABASE_URL;
            key = env.SUPABASE_ANON_KEY;
            console.log("成功動態載入本地環境變數 (env.json)");
        } else {
            // 2. 如果讀不到（代表在 Vercel 雲端環境），改向 Vercel 後端 API 請求環境變數
            const vResponse = await fetch('/api/env');
            if (vResponse.ok) {
                const vEnv = await vResponse.json();
                url = vEnv.SUPABASE_URL;
                key = vEnv.SUPABASE_ANON_KEY;
                console.log("成功動態載入 Vercel 雲端環境變數");
            }
        }
    } catch (e) {
        console.warn("環境變數載入過程中發生異常，嘗試切換備用路由...", e);
    }

    // 初始化 Supabase 客戶端
    const { createClient } = window.supabase;
    
    if (!url || !key) {
        console.error("錯誤：無法取得有效的 SUPABASE_URL 或 SUPABASE_ANON_KEY，請確認環境設定！");
    }

    const supabase = createClient(url, key);
    window.supabaseClient = supabase;
    return supabase;
})();