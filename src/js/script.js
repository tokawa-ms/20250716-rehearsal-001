// 株主対話エージェント - メインJavaScript

// グローバル変数
let azureConfig = {
    endpoint: '',
    apiKey: '',
    deployment: '',
    apiVersion: '',
    connected: false
};

let uploadedFiles = [];
let selectedFile = null;
let currentPdfDoc = null; // 現在のPDFドキュメント
let currentPage = 1; // 現在のページ番号
let totalPages = 0; // 総ページ数
let dialogHistory = [];
let dialogCount = 0;
const MAX_DIALOG_COUNT = 5;

// PDF.js の設定
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    console.log('PDF.js worker configured');
} else {
    console.warn('PDF.js not loaded yet, will configure later');
}

// DOM要素の取得
const elements = {
    azureEndpoint: document.getElementById('azureEndpoint'),
    azureApiKey: document.getElementById('azureApiKey'),
    azureDeployment: document.getElementById('azureDeployment'),
    azureApiVersion: document.getElementById('azureApiVersion'),
    connectBtn: document.getElementById('connectBtn'),
    connectionStatus: document.getElementById('connectionStatus'),
    pdfUpload: document.getElementById('pdfUpload'),
    loadSampleBtn: document.getElementById('loadSampleBtn'),
    fileList: document.getElementById('fileList'),
    pdfPreview: document.getElementById('pdfPreview'),
    pdfNavigation: document.getElementById('pdfNavigation'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),
    pageInfo: document.getElementById('pageInfo'),
    startDialogBtn: document.getElementById('startDialogBtn'),
    dialogArea: document.getElementById('dialogArea'),
    dialogStatus: document.getElementById('dialogStatus'),
    dialogProgress: document.getElementById('dialogProgress')
};

// ローカルストレージ管理
function saveAzureSettings() {
    const settings = {
        endpoint: elements.azureEndpoint.value,
        apiKey: elements.azureApiKey.value,
        deployment: elements.azureDeployment.value,
        apiVersion: elements.azureApiVersion.value
    };
    localStorage.setItem('azureOpenAISettings', JSON.stringify(settings));
}

function loadAzureSettings() {
    try {
        const saved = localStorage.getItem('azureOpenAISettings');
        if (saved) {
            const settings = JSON.parse(saved);
            elements.azureEndpoint.value = settings.endpoint || '';
            elements.azureApiKey.value = settings.apiKey || '';
            elements.azureDeployment.value = settings.deployment || 'gpt-4-turbo';
            elements.azureApiVersion.value = settings.apiVersion || '2025-01-01-preview';
        }
    } catch (error) {
        console.warn('Failed to load Azure settings from localStorage:', error);
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // 要素の存在確認
    console.log('loadSampleBtn element:', document.getElementById('loadSampleBtn'));
    console.log('connectBtn element:', document.getElementById('connectBtn'));
    
    // PDF.jsの最終確認
    if (typeof pdfjsLib === 'undefined') {
        console.warn('PDF.js not available, retrying in 1 second...');
        setTimeout(() => {
            if (typeof pdfjsLib !== 'undefined') {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                console.log('PDF.js worker configured (delayed)');
            }
        }, 1000);
    }
    
    console.log('Elements:', elements);
    loadAzureSettings(); // 保存された設定を読み込み
    setupEventListeners();
    updateUI();
});

// イベントリスナーの設定
function setupEventListeners() {
    console.log('Setting up event listeners');
    
    try {
        // Azure OpenAI 接続
        if (elements.connectBtn) {
            elements.connectBtn.addEventListener('click', testAzureConnection);
            console.log('Connect button listener added');
        } else {
            console.error('Connect button not found');
        }
        
        // PDFアップロード
        if (elements.pdfUpload) {
            elements.pdfUpload.addEventListener('change', handleFileUpload);
            console.log('PDF upload listener added');
        }
        
        // サンプルデータ読み込み
        if (elements.loadSampleBtn) {
            elements.loadSampleBtn.addEventListener('click', loadSampleData);
            console.log('Sample data button listener added');
        } else {
            console.error('Sample data button not found');
        }
        
        // ドラッグ&ドロップ
        if (elements.pdfUpload && elements.pdfUpload.parentElement) {
            const uploadArea = elements.pdfUpload.parentElement;
            uploadArea.addEventListener('dragover', handleDragOver);
            uploadArea.addEventListener('dragleave', handleDragLeave);
            uploadArea.addEventListener('drop', handleFileDrop);
            console.log('Drag and drop listeners added');
        }
        
        // 対話開始
        if (elements.startDialogBtn) {
            elements.startDialogBtn.addEventListener('click', startDialog);
            console.log('Start dialog button listener added');
        }
        
        // PDF ページナビゲーション
        if (elements.prevPageBtn) {
            elements.prevPageBtn.addEventListener('click', () => showPDFPage(currentPage - 1));
            console.log('Previous page button listener added');
        }
        
        if (elements.nextPageBtn) {
            elements.nextPageBtn.addEventListener('click', () => showPDFPage(currentPage + 1));
            console.log('Next page button listener added');
        }
        
        console.log('All event listeners set up successfully');
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// Azure OpenAI 接続テスト
async function testAzureConnection() {
    console.log('testAzureConnection called');
    
    const endpoint = elements.azureEndpoint.value.trim();
    const apiKey = elements.azureApiKey.value.trim();
    const deployment = elements.azureDeployment.value.trim() || 'gpt-4-turbo';
    const apiVersion = elements.azureApiVersion.value.trim() || '2025-01-01-preview';
    
    console.log('Endpoint:', endpoint, 'API Key:', apiKey ? '***' : 'empty', 'Deployment:', deployment, 'API Version:', apiVersion);
    
    if (!endpoint || !apiKey) {
        showConnectionStatus('エンドポイントとAPIキーを入力してください', 'error');
        return;
    }
    
    try {
        elements.connectBtn.disabled = true;
        elements.connectBtn.textContent = '接続中...';
        
        // デモモードの処理
        if (endpoint === 'demo' && apiKey === 'demo') {
            console.log('デモモードで接続中...');
            await sleep(1500); // 接続をシミュレート
            azureConfig = { endpoint, apiKey, deployment, apiVersion, connected: true };
            saveAzureSettings(); // 設定を保存
            showConnectionStatus('デモモードで接続されました（実際のAPIは使用されません）', 'success');
            console.log('デモモード接続完了:', azureConfig);
            updateUI();
            return;
        }
        
        // 実際のAzure OpenAI接続テスト
        const testUrl = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
        
        const response = await fetch(testUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify({
                messages: [
                    { role: 'user', content: 'test' }
                ],
                max_tokens: 1
            })
        });
        
        if (response.ok || response.status === 400) { // 400でもAPI接続は成功
            azureConfig = { endpoint, apiKey, deployment, apiVersion, connected: true };
            saveAzureSettings(); // 設定を保存
            showConnectionStatus('Azure OpenAI に正常に接続されました', 'success');
            updateUI();
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('接続エラー:', error);
        showConnectionStatus(`接続エラー: ${error.message}`, 'error');
        azureConfig.connected = false;
    } finally {
        elements.connectBtn.disabled = false;
        elements.connectBtn.textContent = '接続テスト';
        updateUI();
    }
}

// 接続状態の表示
function showConnectionStatus(message, type) {
    elements.connectionStatus.textContent = message;
    elements.connectionStatus.className = `mt-3 text-sm ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
    elements.connectionStatus.classList.remove('hidden');
}

// サンプルデータ読み込み（デモ用）
function loadSampleData() {
    const sampleText = `
株式会社テストカンパニー 第45期決算短信

【業績概要】
当期（2024年3月期）の業績は以下の通りです：
・売上高：1,200億円（前年同期比 +5.2%）
・営業利益：95億円（前年同期比 -2.1%）
・経常利益：102億円（前年同期比 +1.8%）
・当期純利益：68億円（前年同期比 -8.5%）

【事業セグメント別状況】
■主力事業
売上高：800億円（前年同期比 +3.1%）
デジタル化の進展により受注が堅調に推移しました。

■新規事業
売上高：400億円（前年同期比 +9.8%）
AI・IoT関連サービスの拡大により大幅な成長を達成しました。

【来期見通し】
2025年3月期の業績予想：
・売上高：1,280億円（前年同期比 +6.7%）
・営業利益：105億円（前年同期比 +10.5%）
・経常利益：112億円（前年同期比 +9.8%）
・当期純利益：75億円（前年同期比 +10.3%）

【重要な課題と取り組み】
■収益性の改善
原材料費の高騰に対応するため、業務効率化と価格適正化を推進します。

■DXの推進
業務プロセスの自動化により、生産性向上を図ります。

■ESG経営
環境負荷軽減と社会貢献活動を通じて、持続可能な成長を目指します。

【株主還元】
配当予定：1株当たり25円（前年同期：23円）
株主優待制度の拡充も検討しております。
    `;
    
    const fileData = {
        id: Date.now(),
        name: 'サンプル決算短信.pdf',
        text: sampleText.trim(),
        uploaded: new Date(),
        isSample: true
    };
    
    uploadedFiles.push(fileData);
    updateFileList();
    
    // サンプルプレビューを表示
    elements.pdfPreview.innerHTML = `
        <div class="p-4 bg-white rounded border text-left overflow-y-auto h-full">
            <h3 class="text-lg font-bold mb-4 text-blue-600">サンプル決算短信（デモ用）</h3>
            <div class="whitespace-pre-line text-sm text-gray-700">${sampleText}</div>
        </div>
    `;
    
    // 自動選択
    selectedFile = fileData;
    updateUI();
}
function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    processFiles(files);
}

// ドラッグオーバー処理
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

// ドラッグリーブ処理
function handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
}

// ファイルドロップ処理
function handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const files = Array.from(event.dataTransfer.files).filter(file => file.type === 'application/pdf');
    processFiles(files);
}

// ファイル処理
async function processFiles(files) {
    for (const file of files) {
        if (file.type === 'application/pdf') {
            try {
                const text = await extractTextFromPDF(file);
                const fileData = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    file: file,
                    text: text,
                    uploaded: new Date()
                };
                uploadedFiles.push(fileData);
                updateFileList();
            } catch (error) {
                console.error('PDFの処理に失敗しました:', error);
                alert(`${file.name} の処理に失敗しました: ${error.message}`);
            }
        }
    }
}

// PDFからテキストを抽出
async function extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const typedarray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n';
                }
                
                resolve(fullText);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
        reader.readAsArrayBuffer(file);
    });
}

// ファイルリストの更新
function updateFileList() {
    elements.fileList.innerHTML = '';
    
    uploadedFiles.forEach((fileData, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <span class="font-medium text-gray-800">${fileData.name}</span>
                    <div class="text-sm text-gray-500">
                        ${new Date(fileData.uploaded).toLocaleString()}
                    </div>
                </div>
                <button class="text-red-600 hover:text-red-800" onclick="removeFile(${index})">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;
        
        fileItem.addEventListener('click', () => selectFile(fileData));
        elements.fileList.appendChild(fileItem);
    });
    
    updateUI();
}

// ファイル選択
async function selectFile(fileData) {
    selectedFile = fileData;
    
    // 選択状態の更新
    document.querySelectorAll('.file-item').forEach(item => item.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
    // プレビューの表示
    await showPDFPreview(fileData.file);
    updateUI();
}

// PDFプレビューの表示
async function showPDFPreview(file) {
    try {
        elements.pdfPreview.innerHTML = '<div class="loading-spinner"></div>読み込み中...';
        
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const typedarray = new Uint8Array(e.target.result);
                currentPdfDoc = await pdfjsLib.getDocument(typedarray).promise;
                totalPages = currentPdfDoc.numPages;
                currentPage = 1;
                
                await showPDFPage(1);
                updatePDFNavigation();
            } catch (error) {
                elements.pdfPreview.innerHTML = `<p class="text-red-500">プレビューの表示に失敗しました: ${error.message}</p>`;
            }
        };
        reader.readAsArrayBuffer(file);
    } catch (error) {
        elements.pdfPreview.innerHTML = `<p class="text-red-500">プレビューの表示に失敗しました: ${error.message}</p>`;
    }
}

// PDFページの表示
async function showPDFPage(pageNum) {
    if (!currentPdfDoc || pageNum < 1 || pageNum > totalPages) {
        return;
    }
    
    try {
        currentPage = pageNum;
        const page = await currentPdfDoc.getPage(pageNum);
        const scale = 1.2;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-canvas mx-auto';
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport }).promise;
        
        elements.pdfPreview.innerHTML = '';
        elements.pdfPreview.appendChild(canvas);
        
        updatePDFNavigation();
    } catch (error) {
        elements.pdfPreview.innerHTML = `<p class="text-red-500">ページの表示に失敗しました: ${error.message}</p>`;
    }
}

// PDFナビゲーションUIの更新
function updatePDFNavigation() {
    if (totalPages > 1) {
        elements.pdfNavigation.classList.remove('hidden');
        elements.pageInfo.textContent = `${currentPage} / ${totalPages}`;
        elements.prevPageBtn.disabled = currentPage <= 1;
        elements.nextPageBtn.disabled = currentPage >= totalPages;
    } else {
        elements.pdfNavigation.classList.add('hidden');
    }
}

// ファイル削除
function removeFile(index) {
    uploadedFiles.splice(index, 1);
    updateFileList();
    
    if (selectedFile && uploadedFiles.length === 0) {
        selectedFile = null;
        elements.pdfPreview.innerHTML = '<p class="text-gray-500">PDFファイルを選択してください</p>';
    }
    
    updateUI();
}

// 対話開始
async function startDialog() {
    if (!azureConfig.connected || !selectedFile) {
        return;
    }
    
    dialogHistory = [];
    dialogCount = 0;
    elements.dialogArea.innerHTML = '';
    elements.startDialogBtn.disabled = true;
    
    showDialogStatus('対話を開始しています...');
    
    try {
        await conductDialog();
    } catch (error) {
        console.error('対話エラー:', error);
        addDialogMessage('system', 'エラーが発生しました: ' + error.message);
    } finally {
        elements.startDialogBtn.disabled = false;
        hideDialogStatus();
    }
}

// 対話の実行
async function conductDialog() {
    const context = selectedFile.text.substring(0, 8000); // APIの制限を考慮してテキストを制限
    
    for (let i = 0; i < MAX_DIALOG_COUNT; i++) {
        dialogCount = i + 1;
        showDialogStatus(`対話 ${dialogCount}/${MAX_DIALOG_COUNT} 進行中...`);
        
        try {
            // 株主の質問を生成
            showDialogStatus(`対話 ${dialogCount}/${MAX_DIALOG_COUNT} - 株主の質問を生成中...`);
            const shareholderQuestion = await generateShareholderQuestion(context, dialogHistory);
            addDialogMessage('shareholder', shareholderQuestion);
            dialogHistory.push({ role: 'shareholder', content: shareholderQuestion });
            
            await sleep(1000); // 少し間を空ける
            
            // 取締役の回答を生成
            showDialogStatus(`対話 ${dialogCount}/${MAX_DIALOG_COUNT} - 取締役の回答を生成中...`);
            const directorAnswer = await generateDirectorAnswer(context, dialogHistory);
            addDialogMessage('director', directorAnswer);
            dialogHistory.push({ role: 'director', content: directorAnswer });
            
            await sleep(1000);
        } catch (error) {
            console.error(`Dialog ${dialogCount} failed:`, error);
            addDialogMessage('system', `対話 ${dialogCount} でエラーが発生しました: ${error.message}`);
            // エラーが発生しても次の対話に進む
        }
    }
    
    // 対話の要約を生成
    try {
        showDialogStatus('対話の要約を生成中...');
        const summary = await generateDialogSummary(dialogHistory);
        addDialogMessage('summary', summary);
    } catch (error) {
        console.error('Summary generation failed:', error);
        addDialogMessage('summary', '対話の要約生成中にエラーが発生しました。');
    }
}

// 株主の質問生成
async function generateShareholderQuestion(context, history) {
    const historyText = history.map(h => `${h.role}: ${h.content}`).join('\n');
    
    const prompt = `
あなたは株主として、以下の資料を読んで取締役に質問をします。
過去の対話履歴も参考にして、重要で具体的な質問をしてください。

資料内容:
${context}

過去の対話履歴:
${historyText}

株主として、決算や経営に関する鋭い質問を1つ作成してください。質問は簡潔で具体的にしてください。
`;
    
    return await callAzureOpenAI(prompt, 150);
}

// 取締役の回答生成
async function generateDirectorAnswer(context, history) {
    const lastQuestion = history[history.length - 1].content;
    const historyText = history.map(h => `${h.role}: ${h.content}`).join('\n');
    
    const prompt = `
あなたは取締役として、株主からの質問に回答します。
以下の資料に基づいて、誠実で具体的な回答をしてください。

資料内容:
${context}

株主の質問:
${lastQuestion}

過去の対話履歴:
${historyText}

取締役として、資料に基づいた丁寧で具体的な回答をしてください。
`;
    
    return await callAzureOpenAI(prompt, 200);
}

// 対話要約生成
async function generateDialogSummary(history) {
    const historyText = history.map(h => `${h.role}: ${h.content}`).join('\n\n');
    
    const prompt = `
以下の株主と取締役の対話を要約してください。
主要なポイントと結論を簡潔にまとめてください。

対話内容:
${historyText}

要約は200文字程度で作成してください。
`;
    
    return await callAzureOpenAI(prompt, 150);
}

// Azure OpenAI API呼び出し
async function callAzureOpenAI(prompt, maxTokens = 150) {
    try {
        // デモモード：エンドポイントが "demo" の場合はモックレスポンスを返す
        if (azureConfig.endpoint === 'demo') {
            await sleep(1000 + Math.random() * 2000); // 1-3秒のランダムな遅延
            const response = generateMockResponse(prompt);
            
            // レスポンスが空でないことを確認
            if (!response || response.trim().length === 0) {
                throw new Error('空のレスポンスが生成されました');
            }
            
            return response;
        }
        
        const url = `${azureConfig.endpoint}/openai/deployments/${azureConfig.deployment}/chat/completions?api-version=${azureConfig.apiVersion}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': azureConfig.apiKey
            },
            body: JSON.stringify({
                messages: [
                    { role: 'user', content: prompt }
                ],
                max_tokens: maxTokens,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`API エラー: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        // レスポンスが空でないことを確認
        if (!content || content.length === 0) {
            throw new Error('空のレスポンスが返されました');
        }
        
        return content;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// モックレスポンス生成（デモ用）
function generateMockResponse(prompt) {
    const mockResponses = {
        shareholder: [
            "今期の売上高が前年比で減少していますが、**来期の業績見通し**はいかがでしょうか？",
            "営業利益率の改善策について*具体的な取り組み*を教えてください。",
            "新規事業への投資計画と期待される**収益性**についてお聞かせください。",
            "競合他社との`差別化戦略`について詳しく説明していただけますか？",
            "株主還元政策の見直しについて検討されていることはありますか？"
        ],
        director: [
            "ご質問ありがとうございます。来期については、**新商品の投入**と既存事業の効率化により、売上高の回復を見込んでおります。",
            "営業利益率につきましては、`DXの推進`による業務効率化と原価削減により、*段階的な改善*を図ってまいります。",
            "新規事業への投資は慎重に検討しており、**ROI15%以上**を目標として進めております。",
            "当社の強みである*サービス品質*と`技術力`を活かし、顧客満足度の向上に努めております。",
            "株主の皆様への還元につきましては、**業績向上と財務健全性**のバランスを考慮して検討してまいります。"
        ],
        summary: [
            "本日の対話では、**業績向上への取り組み**、*新規事業への投資方針*、競合戦略について活発な議論が行われました。取締役からは具体的な改善策と今後の方向性が示され、株主の懸念に対して誠実な回答がなされました。"
        ]
    };
    
    if (prompt.includes('株主として')) {
        return mockResponses.shareholder[Math.floor(Math.random() * mockResponses.shareholder.length)];
    } else if (prompt.includes('取締役として')) {
        return mockResponses.director[Math.floor(Math.random() * mockResponses.director.length)];
    } else if (prompt.includes('要約')) {
        return mockResponses.summary[0];
    }
    
    return "申し訳ございませんが、適切な回答を生成できませんでした。";
}

// 対話メッセージの追加
function addDialogMessage(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start space-x-3 mb-4';
    
    const iconDiv = document.createElement('div');
    iconDiv.className = `dialog-icon ${type}`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = `dialog-bubble ${type}`;
    bubbleDiv.innerHTML = renderMarkdown(content); // マークダウンをレンダリング
    
    // アイコンの設定
    switch (type) {
        case 'shareholder':
            iconDiv.textContent = '株';
            messageDiv.className += ' justify-end';
            break;
        case 'director':
            iconDiv.textContent = '役';
            messageDiv.className += ' justify-start';
            break;
        case 'summary':
            iconDiv.textContent = '要';
            messageDiv.className += ' justify-center';
            bubbleDiv.className += ' w-full max-w-none';
            break;
    }
    
    if (type === 'shareholder') {
        messageDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(iconDiv);
    } else {
        messageDiv.appendChild(iconDiv);
        messageDiv.appendChild(bubbleDiv);
    }
    
    elements.dialogArea.appendChild(messageDiv);
    elements.dialogArea.scrollTop = elements.dialogArea.scrollHeight;
}

// 対話状態の表示
function showDialogStatus(message) {
    elements.dialogProgress.textContent = message;
    elements.dialogStatus.classList.remove('hidden');
}

// 対話状態の非表示
function hideDialogStatus() {
    elements.dialogStatus.classList.add('hidden');
}

// UI状態の更新
function updateUI() {
    const canStartDialog = azureConfig.connected && selectedFile;
    elements.startDialogBtn.disabled = !canStartDialog;
    
    if (!azureConfig.connected) {
        elements.startDialogBtn.title = 'Azure OpenAIに接続してください';
    } else if (!selectedFile) {
        elements.startDialogBtn.title = 'PDFファイルを選択してください';
    } else {
        elements.startDialogBtn.title = '';
    }
}

// 簡単なマークダウンレンダラー
function renderMarkdown(text) {
    return text
        // 太字
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // イタリック
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // インラインコード
        .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1 rounded">$1</code>')
        // 改行を保持
        .replace(/\n/g, '<br>');
}

// ユーティリティ関数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}