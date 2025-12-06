document.addEventListener('DOMContentLoaded', () => {
    const csvFilePath = 'hintdata.csv';
    const container = document.getElementById('hint-container');

    // CSVファイルを読み込む関数
    async function loadHints() {
        try {
            const response = await fetch(csvFilePath);
            const csvText = await response.text();
            
            const hints = parseCSV(csvText);
            
            // ヒントをステップごとにグループ化
            const groupedHints = hints.reduce((acc, hint) => {
                const stepKey = `ステップ ${hint.Step}`;
                if (!acc[stepKey]) {
                    acc[stepKey] = [];
                }
                acc[stepKey].push(hint);
                return acc;
            }, {});

            // HTMLにレンダリング
            renderHints(groupedHints, container);
            
            // イベントリスナーを設定
            setupToggleListeners();

        } catch (error) {
            console.error('ヒントデータの読み込み中にエラーが発生しました:', error);
            container.innerHTML = '<p style="color: red;">ヒントデータを読み込めませんでした。</p>';
        }
    }

    // CSVパースの簡易実装 (変更なし)
    function parseCSV(text) {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',');
        
        return lines.slice(1).map(line => {
            const values = line.split(',');
            let obj = {};
            headers.forEach((header, i) => {
                obj[header.trim()] = values[i].trim();
            });
            return obj;
        });
    }

    // HTMLのレンダリング (ステップトグルボタンの追加)
    function renderHints(groupedHints, container) {
        for (const stepKey in groupedHints) {
            const stepData = groupedHints[stepKey];
            
            // ステップコンテナの作成
            const stepDiv = document.createElement('div');
            stepDiv.className = 'hint-step';
            
            // === ステップヘッダー (トグル機能付き) の作成 ===
            const stepHeader = document.createElement('div');
            stepHeader.className = 'step-header';
            
            // ステップタイトル
            const stepTitle = document.createElement('h2');
            stepTitle.textContent = stepKey;
            stepHeader.appendChild(stepTitle);

            // 「すべて表示/非表示」ボタン
            const toggleAllButton = document.createElement('button');
            toggleAllButton.textContent = 'すべて表示';
            toggleAllButton.className = 'toggle-all-button';
            toggleAllButton.dataset.targetStep = stepKey; // ステップを識別するキー
            stepHeader.appendChild(toggleAllButton);

            stepDiv.appendChild(stepHeader);
            // ===============================================

            // 各ヒントの要素を作成
            stepData.forEach(hint => {
                // ヒントのタイトルボタン
                const titleButton = document.createElement('button');
                titleButton.className = 'hint-title';
                titleButton.textContent = hint.Title;
                titleButton.dataset.target = `content-s${hint.Step}-h${hint.HintID}`;
                titleButton.setAttribute('aria-expanded', 'false');
                stepDiv.appendChild(titleButton);

                // ヒントの内容エリア
                const contentDiv = document.createElement('div');
                contentDiv.id = `content-s${hint.Step}-h${hint.HintID}`;
                contentDiv.className = 'hint-content';
                contentDiv.innerHTML = `<p>${hint.Content}</p>`;
                contentDiv.setAttribute('aria-hidden', 'true');
                stepDiv.appendChild(contentDiv);
            });

            container.appendChild(stepDiv);
        }
    }

    // クリックイベントの設定 (ステップトグルイベントの追加)
    function setupToggleListeners() {
        // 1. 個別ヒントのトグル処理 (前回のロジックを維持)
        document.querySelectorAll('.hint-title').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.target;
                const targetContent = document.getElementById(targetId);

                if (targetContent) {
                    const isExpanded = targetContent.classList.contains('active');
                    
                    // 個別ヒントを開くときは、他の開いているヒントをすべて閉じる
                    document.querySelectorAll('.hint-content.active').forEach(openContent => {
                        openContent.classList.remove('active');
                        document.querySelector(`[data-target="${openContent.id}"]`).setAttribute('aria-expanded', 'false');
                        openContent.setAttribute('aria-hidden', 'true');
                    });

                    if (!isExpanded) {
                        // 選択したヒントを開く
                        targetContent.classList.add('active');
                        e.currentTarget.setAttribute('aria-expanded', 'true');
                        targetContent.setAttribute('aria-hidden', 'false');
                    }

                    // 個別のヒントが開閉した際、親ステップのトグルボタンの状態を「すべて表示」に戻す
                    const stepDiv = e.currentTarget.closest('.hint-step');
                    const toggleAllButton = stepDiv.querySelector('.toggle-all-button');
                    if (toggleAllButton) {
                        toggleAllButton.textContent = 'すべて表示';
                    }
                }
            });
        });

        // 2. ステップ全体トグルイベントリスナー
        document.querySelectorAll('.toggle-all-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const stepDiv = e.currentTarget.closest('.hint-step');
                
                // 現在のボタンのテキストを確認して、開くか閉じるかを決定
                const isClosing = e.currentTarget.textContent === 'すべて非表示';

                stepDiv.querySelectorAll('.hint-title').forEach(titleButton => {
                    const targetId = titleButton.dataset.target;
                    const targetContent = document.getElementById(targetId);

                    if (targetContent) {
                        if (isClosing) {
                            // すべて閉じる
                            targetContent.classList.remove('active');
                            titleButton.setAttribute('aria-expanded', 'false');
                            targetContent.setAttribute('aria-hidden', 'true');
                        } else {
                            // すべて開く
                            targetContent.classList.add('active');
                            titleButton.setAttribute('aria-expanded', 'true');
                            targetContent.setAttribute('aria-hidden', 'false');
                        }
                    }
                });
                
                // ボタンのテキストを切り替える
                e.currentTarget.textContent = isClosing ? 'すべて表示' : 'すべて非表示';
            });
        });
    }

    loadHints();
});
