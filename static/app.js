// Global presets list for Ingest Simulator
const presets = {
    tech: "Artificial Intelligence and machine learning are revolutionizing software development. Companies like Google, Microsoft, and OpenAI are launching new LLM products from Silicon Valley.",
    sports: "In an incredible finals match, Virat Kohli guided the team to a historic victory, lifting the World Cup trophy in London. Fans celebrated throughout the stadium.",
    politics: "The senate passed a sweeping climate change bill today targeting carbon emissions and tax credits. Protesters gathered in Washington to debate the budget policies.",
    spam: "Earn easy cash fast! Click here to download our free gift card! Double your money overnight in our online casino slot machines! Use promo code Slots.",
    hate: "I hate this group of scum people. They are trash and should be killed. We must bomb their offices and attack them."
};

// Global DB Console Logs helpers
function addConsoleLine(text, type = "muted") {
    const body = document.getElementById("console-body");
    if (!body) return;
    const timestamp = new Date().toISOString().slice(11, 19);
    const line = document.createElement("div");
    line.className = `console-line ${type}`;
    line.innerText = `[${timestamp}] ${text}`;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
}

function clearConsoleLogs() {
    const body = document.getElementById("console-body");
    if (body) {
        body.innerHTML = `<div class="console-line system">[System] Logger console cleared.</div>`;
    }
}

// Router and Initializer
document.addEventListener("DOMContentLoaded", () => {
    // 1. Session Authentication Lock Gating
    const path = window.location.pathname.toLowerCase();
    const token = sessionStorage.getItem("tagsense_token");
    if (!token && !path.includes("login")) {
        window.location.href = "/login";
        return;
    }

    // 2. Persistent Theme Toggler
    const savedTheme = localStorage.getItem("tagsense_theme") || "dark";
    if (savedTheme === "light") {
        document.documentElement.classList.add("light-theme");
    } else {
        document.documentElement.classList.remove("light-theme");
    }

    const themeToggleBtn = document.getElementById("theme-toggle");
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const isLight = document.documentElement.classList.toggle("light-theme");
            localStorage.setItem("tagsense_theme", isLight ? "light" : "dark");
        });
    }

    // Fluctuating Sidebar resource stats
    setInterval(() => {
        const cpuFill = document.getElementById("cpu-fill");
        const cpuLabel = document.getElementById("cpu-label-val");
        if (cpuFill && cpuLabel) {
            const val = Math.floor(20 + Math.random() * 8);
            cpuFill.style.width = `${val}%`;
            cpuLabel.innerText = `${val}%`;
        }
    }, 4000);

    // Page-specific initializers
    if (path.includes("upload") || path.endsWith("/upload")) {
        initUploadPage();
    } else if (path.includes("classification") || path.endsWith("/classification")) {
        initClassificationPage();
    } else if (path.includes("moderation") || path.endsWith("/moderation")) {
        initModerationPage();
    } else if (path.includes("analytics") || path.endsWith("/analytics")) {
        initAnalyticsPage();
    } else if (path.includes("architecture") || path.endsWith("/architecture")) {
        // Architecture initialization
    } else if (path.includes("admin") || path.endsWith("/admin")) {
        initAdminPage();
    } else {
        // Default to Dashboard
        initDashboardPage();
    }
});

// ==========================================
// 1. DASHBOARD PAGE LOGIC
// ==========================================
function initDashboardPage() {
    const ctx = document.getElementById("dashboardLoadChart");
    if (!ctx) return;
    
    // Render real-time workload graph (CPU vs GPU load)
    new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30'],
            datasets: [
                {
                    label: 'GPU Cluster Load (%)',
                    data: [45, 52, 60, 48, 55, 68, 52],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.04)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'CPU Ingestion Ingress (%)',
                    data: [22, 25, 29, 24, 26, 31, 25],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.04)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#64748b', font: { family: 'Outfit' } } }
            },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b' } },
                y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b' } }
            }
        }
    });

    const pieCtx = document.getElementById("categoryPieChart");
    if (!pieCtx) return;

    new Chart(pieCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Technology', 'Sports', 'Politics', 'Entertainment', 'Health'],
            datasets: [{
                data: [38, 22, 15, 17, 8],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.6)',  // Technology - Blue
                    'rgba(6, 182, 212, 0.6)',   // Sports - Cyan
                    'rgba(239, 68, 68, 0.6)',   // Politics - Red
                    'rgba(139, 92, 246, 0.6)',  // Entertainment - Purple
                    'rgba(16, 185, 129, 0.6)'   // Health - Green
                ],
                borderColor: [
                    '#3b82f6',
                    '#06b6d4',
                    '#ef4444',
                    '#8b5cf6',
                    '#10b981'
                ],
                borderWidth: 1.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#64748b',
                        font: { family: 'Outfit', size: 11 }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

// ==========================================
// 2. CONTENT UPLOAD / INGESTION LOGIC
// ==========================================
function initUploadPage() {
    let lastVerificationData = null;
    const txtInput = document.getElementById("upload-text-input");
    const checkBtn = document.getElementById("btn-upload-check");
    const checkTxt = document.getElementById("btn-check-text");
    const checkSpinner = document.getElementById("btn-check-spinner");
    const submitBtn = document.getElementById("btn-upload-submit");
    const submitTxt = document.getElementById("btn-upload-text");
    const submitSpinner = document.getElementById("btn-upload-spinner");

    window.loadPresetTemplate = function(key) {
        if (txtInput && presets[key]) {
            txtInput.value = presets[key];
            if (submitBtn) submitBtn.disabled = true;
            lastVerificationData = null;
        }
    };
    
    if (txtInput) {
        txtInput.addEventListener("input", () => {
            if (submitBtn) submitBtn.disabled = true;
            lastVerificationData = null;
        });
    }

    if (checkBtn) {
        checkBtn.addEventListener("click", async () => {
            const text = txtInput.value;
            if (!text || text.trim().length === 0) {
                alert("Please input some text before checking.");
                return;
            }

            checkBtn.disabled = true;
            if (checkTxt) checkTxt.style.display = "none";
            if (checkSpinner) checkSpinner.style.display = "block";

            addConsoleLine(`[Verification] Triggering AI inference models evaluation...`, "system");

            try {
                const response = await fetch("/api/classify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text })
                });

                if (!response.ok) throw new Error("API call failed.");
                const data = await response.json();

                lastVerificationData = data;
                displayUploadResults(data);

                addConsoleLine(`[Verification] AI models check passed. category: ${data.category} (${Math.round(data.confidence * 100)}% conf)`, "success");
                if (submitBtn) submitBtn.disabled = false;
            } catch (err) {
                addConsoleLine(`[Fallback] Offline static processing model initialized.`, "system");
                
                // Construct fallback metrics
                let category = "Technology";
                let isSafe = true;
                let severity = "LOW";
                let action = "NONE";
                let keywords = ["AI", "algorithm", "platform"];
                let persons = [], locations = [], orgs = [];
                
                const cleanText = text.toLowerCase();
                if (cleanText.includes("cricket") || cleanText.includes("cup") || cleanText.includes("win")) {
                    category = "Sports";
                    keywords = ["victory", "finals", "match"];
                } else if (cleanText.includes("senate") || cleanText.includes("vote") || cleanText.includes("bill")) {
                    category = "Politics";
                    keywords = ["policy", "bill", "protests"];
                } else if (cleanText.includes("followers") || cleanText.includes("click here") || cleanText.includes("cash")) {
                    category = "Entertainment";
                    isSafe = false;
                    severity = "HIGH";
                    action = "REMOVE";
                    keywords = ["followers", "offer", "promo"];
                } else if (cleanText.includes("kill") || cleanText.includes("bomb") || cleanText.includes("hate")) {
                    category = "Politics";
                    isSafe = false;
                    severity = "CRITICAL";
                    action = "REMOVE";
                    keywords = ["bomb", "attack", "violence"];
                }
                
                if (cleanText.includes("virat kohli")) persons.push("Virat Kohli");
                if (cleanText.includes("google")) orgs.push("Google");
                if (cleanText.includes("microsoft")) orgs.push("Microsoft");
                if (cleanText.includes("london")) locations.push("London");
                if (cleanText.includes("silicon valley")) locations.push("Silicon Valley");
                if (cleanText.includes("washington")) locations.push("Washington");
                
                const content_id = uuidv4();
                const mockData = {
                    content_id,
                    category,
                    confidence: 0.85,
                    language: "en",
                    processing_time_ms: 12,
                    moderation: { is_safe: isSafe, severity, action },
                    tags: keywords.map(w => ({ name: w, type: "topic", score: 0.85 })),
                    entities: { persons, locations, organizations: orgs },
                    sql_statements: [
                        `INSERT INTO content_metadata (content_id, uploader_id, content_type, language_detected, processing_status) VALUES ('${content_id}', '${uuidv4()}', 'TEXT', 'en', 'COMPLETED');`,
                        `INSERT INTO classification_labels (content_id, category, confidence_score, model_version, is_human_verified) VALUES ('${content_id}', '${category}', 0.850, 'v1.0.0-mock', FALSE);`,
                        `INSERT INTO moderation_results (content_id, is_flagged, flag_reason, severity_level, action_taken, auto_moderated) VALUES ('${content_id}', ${!isSafe}, '${!isSafe ? 'Flags matched' : 'None'}', '${severity}', '${action}', TRUE);`
                    ]
                };
                
                lastVerificationData = mockData;
                displayUploadResults(mockData);
                if (submitBtn) submitBtn.disabled = false;
            } finally {
                checkBtn.disabled = false;
                if (checkTxt) checkTxt.style.display = "block";
                if (checkSpinner) checkSpinner.style.display = "none";
            }
        });
    }

    const form = document.getElementById("upload-ingress-form");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!lastVerificationData) return;

            submitBtn.disabled = true;
            if (submitTxt) submitTxt.style.display = "none";
            if (submitSpinner) submitSpinner.style.display = "block";

            addConsoleLine(`[Ingestion] Publishing payload details to Kafka event stream partitions...`, "system");

            // Simulate database commit transaction
            setTimeout(() => {
                addConsoleLine(`[Kafka] Message offset partition committed. Status: Ingress OK`, "success");
                if (lastVerificationData.sql_statements) {
                    lastVerificationData.sql_statements.forEach(sql => {
                        addConsoleLine(`[PostgreSQL DB] ${sql}`, "sql");
                    });
                }
                
                submitBtn.disabled = true;
                if (submitTxt) submitTxt.style.display = "block";
                if (submitSpinner) submitSpinner.style.display = "none";
                lastVerificationData = null;
                
                alert("Ingestion transaction successfully committed to the database!");
            }, 800);
        });
    }
}

function displayUploadResults(data) {
    const idle = document.getElementById("upload-idle");
    const view = document.getElementById("upload-results");
    if (idle) idle.classList.add("hidden");
    if (view) view.classList.remove("hidden");
    
    document.getElementById("res-category").innerText = data.category;
    const confPercent = Math.round(data.confidence * 100);
    document.getElementById("res-confidence").innerText = `${confPercent}%`;
    document.getElementById("res-conf-fill").style.width = `${confPercent}%`;
    document.getElementById("res-lang").innerText = data.language.toUpperCase();
    document.getElementById("res-latency").innerText = `${data.processing_time_ms} ms`;
    
    // Moderation
    const modBox = document.getElementById("res-mod-box");
    const modBadge = document.getElementById("res-mod-badge");
    const modTitle = document.getElementById("res-mod-title");
    
    modBox.className = "moderation-card";
    
    if (data.moderation.is_safe) {
        modBox.classList.add("moderation-card-safe");
        modBadge.className = "status-badge sb-success";
        modBadge.innerText = "SAFE";
        modTitle.innerText = "Content Cleared Safety Rules";
    } else {
        modBox.classList.add("moderation-card-flagged");
        modBadge.className = "status-badge sb-danger";
        modBadge.innerText = "VIOLATION";
        modTitle.innerText = "Policy Outlier Detected";
    }
    
    document.getElementById("res-mod-severity").innerText = data.moderation.severity;
    document.getElementById("res-mod-action").innerText = data.moderation.action;
    
    // Tags
    const tagsBox = document.getElementById("res-tags-list");
    tagsBox.innerHTML = "";
    data.tags.forEach(t => {
        const item = document.createElement("span");
        item.className = "tag-item";
        item.innerHTML = `${t.name} <span class="tag-score">${t.score.toFixed(2)}</span>`;
        tagsBox.appendChild(item);
    });
    
    // Entities
    document.getElementById("res-ent-persons").innerText = data.entities.persons.length > 0 ? data.entities.persons.join(", ") : "None";
    document.getElementById("res-ent-locations").innerText = data.entities.locations.length > 0 ? data.entities.locations.join(", ") : "None";
    document.getElementById("res-ent-orgs").innerText = data.entities.organizations.length > 0 ? data.entities.organizations.join(", ") : "None";
}

function simulateOfflineFallback(text) {
    addConsoleLine(`[Fallback] Offline static processing model initialized.`, "system");
    
    let category = "Technology";
    let isSafe = true;
    let severity = "LOW";
    let action = "NONE";
    let keywords = ["AI", "algorithm", "platform"];
    let persons = [], locations = [], orgs = [];
    
    const cleanText = text.toLowerCase();
    if (cleanText.includes("cricket") || cleanText.includes("cup") || cleanText.includes("win")) {
        category = "Sports";
        keywords = ["victory", "finals", "match"];
    } else if (cleanText.includes("senate") || cleanText.includes("vote") || cleanText.includes("bill")) {
        category = "Politics";
        keywords = ["policy", "bill", "protests"];
    } else if (cleanText.includes("followers") || cleanText.includes("click here") || cleanText.includes("cash")) {
        category = "Entertainment";
        isSafe = false;
        severity = "HIGH";
        action = "REMOVE";
        keywords = ["followers", "offer", "promo"];
    } else if (cleanText.includes("kill") || cleanText.includes("bomb") || cleanText.includes("hate")) {
        category = "Politics";
        isSafe = false;
        severity = "CRITICAL";
        action = "REMOVE";
        keywords = ["bomb", "attack", "violence"];
    }
    
    // Extract static entities matches for fallback
    if (cleanText.includes("virat kohli")) persons.push("Virat Kohli");
    if (cleanText.includes("google")) orgs.push("Google");
    if (cleanText.includes("microsoft")) orgs.push("Microsoft");
    if (cleanText.includes("london")) locations.push("London");
    if (cleanText.includes("silicon valley")) locations.push("Silicon Valley");
    if (cleanText.includes("washington")) locations.push("Washington");
    
    const mockData = {
        category,
        confidence: 0.85,
        language: "en",
        processing_time_ms: 12,
        moderation: { is_safe: isSafe, severity, action },
        tags: keywords.map(w => ({ name: w, type: "topic", score: 0.85 })),
        entities: { persons, locations, organizations: orgs }
    };
    
    displayUploadResults(mockData);
    
    const content_id = uuidv4();
    addConsoleLine(`[PostgreSQL DB-Mock] INSERT INTO content_metadata (content_id, uploader_id, content_type, language_detected, processing_status) VALUES ('${content_id}', '${uuidv4()}', 'TEXT', 'en', 'COMPLETED');`, "sql");
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ==========================================
// 3. CLASSIFICATION CENTER LOGIC
// ==========================================
function initClassificationPage() {
    window.filterClassification = function() {
        const typeFilter = document.getElementById("filter-type").value;
        const categoryFilter = document.getElementById("filter-category").value;
        const rows = document.querySelectorAll("#classification-table-body tr");
        
        rows.forEach(row => {
            const format = row.getAttribute("data-format");
            const cat = row.getAttribute("data-category");
            
            const matchFormat = (typeFilter === "ALL" || format === typeFilter);
            const matchCategory = (categoryFilter === "ALL" || cat === categoryFilter);
            
            if (matchFormat && matchCategory) {
                row.classList.remove("hidden");
            } else {
                row.classList.add("hidden");
            }
        });
    };
}

// ==========================================
// 4. MODERATION CENTER LOGIC
// ==========================================
function initModerationPage() {
    let activeAuditRow = null;
    
    // Bind click events to clickable rows
    const rows = document.querySelectorAll("#moderation-queue-table .clickable-row");
    rows.forEach(row => {
        row.addEventListener("click", () => {
            // Remove previous selections
            rows.forEach(r => r.classList.remove("row-selected"));
            
            // Set active selection
            row.classList.add("row-selected");
            activeAuditRow = row;
            
            // Read data attributes
            const id = row.getAttribute("data-id");
            const format = row.getAttribute("data-format");
            const reason = row.getAttribute("data-reason");
            const score = row.getAttribute("data-score");
            const text = row.getAttribute("data-text");
            
            // Toggle placeholder vs contents
            const placeholder = document.getElementById("analyst-placeholder");
            const content = document.getElementById("analyst-content");
            if (placeholder) placeholder.classList.add("hidden");
            if (content) content.classList.remove("hidden");
            
            // Populate details
            document.getElementById("audit-id").innerText = id;
            document.getElementById("audit-format-badge").innerHTML = `<span class="format-badge fmt-${format.toLowerCase()}">${format}</span>`;
            
            // Highlight flagged key terms in the text container
            let highlighted = text;
            const flags = ["kill", "murder", "shoot", "bomb", "terrorist", "attack", "assault", "scum", "trash", "hate", "scandal", "casino", "slots", "cash", "click here", "free gift", "promo code"];
            flags.forEach(flag => {
                const regex = new RegExp("\\b(" + flag + ")\\b", "gi");
                highlighted = highlighted.replace(regex, `<span style="color: var(--danger); font-weight: 700; text-decoration: underline;">$1</span>`);
            });
            document.getElementById("audit-text-container").innerHTML = highlighted;
            
            // Populate scores
            document.getElementById("audit-score-val").innerText = score;
            const scoreNum = parseFloat(score) || 0;
            const scoreValEl = document.getElementById("audit-score-val");
            
            if (scoreNum >= 0.75) {
                scoreValEl.style.color = "var(--danger)";
            } else if (scoreNum >= 0.40) {
                scoreValEl.style.color = "var(--warning)";
            } else {
                scoreValEl.style.color = "var(--success)";
            }
            
            // Suggested action
            let actionText = "Ingress Passed";
            let actionColor = "var(--success)";
            if (scoreNum >= 0.75) {
                actionText = "Policy Block / Remove";
                actionColor = "var(--danger)";
            } else if (scoreNum >= 0.40) {
                actionText = "Review Flag / Warning";
                actionColor = "var(--warning)";
            }
            const actionEl = document.getElementById("audit-action-val");
            actionEl.innerText = actionText;
            actionEl.style.color = actionColor;
        });
    });
    
    // Bind click handlers for auditor submit actions
    window.submitAnalystAudit = function(approve) {
        if (!activeAuditRow) return;
        
        const contentId = activeAuditRow.getAttribute("data-id");
        const statusSpan = document.getElementById(`status-${contentId}`);
        
        if (approve) {
            if (statusSpan) {
                statusSpan.className = "status-badge sb-success";
                statusSpan.innerText = "SAFE";
            }
            addConsoleLine(`[Auditing] Row '${contentId}' manually APPROVED by analyst review.`, "success");
            addConsoleLine(`[PostgreSQL DB] UPDATE moderation_results SET is_flagged = FALSE, action_taken = 'NONE', reviewed_by = 'usr-reviewer' WHERE content_id = '${contentId}';`, "sql");
        } else {
            if (statusSpan) {
                statusSpan.className = "status-badge sb-danger";
                statusSpan.innerText = "REJECTED";
            }
            addConsoleLine(`[Auditing] Row '${contentId}' manually REJECTED. Removed from public indices.`, "error");
            addConsoleLine(`[PostgreSQL DB] UPDATE moderation_results SET action_taken = 'REMOVE', reviewed_by = 'usr-reviewer' WHERE content_id = '${contentId}';`, "sql");
        }
        
        // Remove row selection indicators and disable active audits row
        activeAuditRow.style.opacity = "0.55";
        activeAuditRow.classList.remove("row-selected");
        activeAuditRow.style.pointerEvents = "none";
        
        // Reset Viewport
        document.getElementById("analyst-content").classList.add("hidden");
        document.getElementById("analyst-placeholder").classList.remove("hidden");
        activeAuditRow = null;
        
        // Reduce count metrics
        const badge = document.getElementById("queue-count-badge");
        const cardVal = document.getElementById("metric-queue-size");
        if (badge) {
            let current = parseInt(badge.innerText) || 0;
            if (current > 0) {
                badge.innerText = current - 1;
            }
        }
        if (cardVal) {
            let current = parseInt(cardVal.innerText) || 0;
            if (current > 0) {
                cardVal.innerText = current - 1;
            }
        }
    };
}

// ==========================================
// 5. ANALYTICS LOGIC
// ==========================================
function initAnalyticsPage() {
    const volumeCtx = document.getElementById("volumeChart");
    const latencyCtx = document.getElementById("latencyChart");
    
    if (volumeCtx) {
        new Chart(volumeCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Video', 'Image', 'Audio', 'Text'],
                datasets: [{
                    label: 'Volume (Thousands / Day)',
                    data: [4500, 3200, 1500, 800],
                    backgroundColor: [
                        'rgba(217, 70, 239, 0.4)', // Pink
                        'rgba(168, 85, 247, 0.4)', // Purple
                        'rgba(6, 182, 212, 0.4)',  // Info
                        'rgba(59, 130, 246, 0.4)'   // Blue
                    ],
                    borderColor: [
                        '#d946ef', '#a855f7', '#06b6d4', '#3b82f6'
                    ],
                    borderWidth: 1.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b' } },
                    y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b' } }
                }
            }
        });
    }
    
    if (latencyCtx) {
        new Chart(latencyCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
                datasets: [
                    {
                        label: 'P99 Latency (ms)',
                        data: [280, 310, 420, 290, 320, 480, 310],
                        borderColor: '#ef4444',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.3
                    },
                    {
                        label: 'P95 Latency (ms)',
                        data: [115, 120, 145, 110, 122, 135, 124],
                        borderColor: '#f59e0b',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.3
                    },
                    {
                        label: 'P50 Latency (ms)',
                        data: [42, 45, 50, 41, 44, 48, 43],
                        borderColor: '#10b981',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#64748b', font: { family: 'Outfit' } } }
                },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b' } },
                    y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b' } }
                }
            }
        });
    }
}

// ==========================================
// 6. ADMIN CONSOLE LOGIC
// ==========================================
function initAdminPage() {
    const form = document.getElementById("admin-config-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Retrieve toggle values
        const bert = document.getElementById("toggle-bert")?.checked;
        const spacy = document.getElementById("toggle-spacy")?.checked;
        const tox = document.getElementById("toggle-tox")?.checked;
        const drift = document.getElementById("toggle-drift")?.checked;

        // Retrieve range inputs
        const minConf = document.getElementById("min-conf")?.value;
        const toxLimit = document.getElementById("tox-limit")?.value;

        // Retrieve bounds
        const minPods = document.getElementById("replicas-min")?.value;
        const maxPods = document.getElementById("replicas-max")?.value;
        const cpuTrigger = document.getElementById("cpu-trigger")?.value;

        addConsoleLine("[System] Initiating configuration transaction commit...", "system");

        // Simulate database updates
        setTimeout(() => {
            addConsoleLine(`[PostgreSQL DB] UPDATE pipeline_configurations SET active = ${bert ? 'TRUE' : 'FALSE'}, last_modified = NOW() WHERE pipeline_name = 'BERT_CLASSIFICATION';`, "sql");
            addConsoleLine(`[PostgreSQL DB] UPDATE pipeline_configurations SET active = ${spacy ? 'TRUE' : 'FALSE'}, last_modified = NOW() WHERE pipeline_name = 'SPACY_ENTITY_EXTRACTION';`, "sql");
            addConsoleLine(`[PostgreSQL DB] UPDATE pipeline_configurations SET active = ${tox ? 'TRUE' : 'FALSE'}, last_modified = NOW() WHERE pipeline_name = 'CONTENT_TOXICITY_SCANNER';`, "sql");
            addConsoleLine(`[PostgreSQL DB] UPDATE pipeline_configurations SET active = ${drift ? 'TRUE' : 'FALSE'}, last_modified = NOW() WHERE pipeline_name = 'CONCEPT_DRIFT_EVALUATION';`, "sql");
            
            const confVal = (minConf / 100).toFixed(2);
            addConsoleLine(`[PostgreSQL DB] UPDATE pipeline_rules SET threshold = ${confVal}, last_modified = NOW() WHERE rule_name = 'MIN_CLASSIFICATION_CONFIDENCE';`, "sql");
            
            const toxVal = (toxLimit / 100).toFixed(2);
            addConsoleLine(`[PostgreSQL DB] UPDATE pipeline_rules SET threshold = ${toxVal}, last_modified = NOW() WHERE rule_name = 'TOXICITY_ALARM_LIMIT';`, "sql");
            
            addConsoleLine(`[PostgreSQL DB] UPDATE cluster_autoscaling_limits SET min_pods = ${minPods}, max_pods = ${maxPods}, cpu_threshold_percentage = ${cpuTrigger}, last_modified = NOW() WHERE cluster_id = 'k8s-us-east-prod';`, "sql");

            addConsoleLine("[System] Configuration transaction committed and hot-reloaded successfully.", "success");

            alert("Configurations committed successfully!");
        }, 500);
    });
}

