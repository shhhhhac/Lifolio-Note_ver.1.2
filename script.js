/* ==========================================
   Lifolio Note
   script.js
========================================== */


/* ==========================================
   Storage
========================================== */

const STORAGE_KEY = "lifolio_note_data";

const OLD_STORAGE_KEY = "project_aibou_data";


/* ==========================================
   Default Categories
========================================== */

const DEFAULT_CATEGORIES = [

    {
        id: "study",
        emoji: "📖",
        name: "勉強"
    },

    {
        id: "english",
        emoji: "🗣️",
        name: "英会話"
    },

    {
        id: "housework",
        emoji: "🧹",
        name: "家事"
    },

    {
        id: "meal",
        emoji: "🍚",
        name: "食事"
    },

    {
        id: "sleep",
        emoji: "🛏️",
        name: "睡眠"
    },

    {
        id: "hobby",
        emoji: "🎮",
        name: "趣味"
    },

    {
        id: "other",
        emoji: "➕",
        name: "その他"
    }

];


/* ==========================================
   State
========================================== */

let appData = {

    categories: DEFAULT_CATEGORIES,

    timeline: [],

    currentActivity: null,

    selectedDate: getDateKey(new Date()),

    deletedBackup: null

};


let editingRecordId = null;

let editingCategoryId = null;


/* ==========================================
   DOM
========================================== */

const dateLabel =
    document.getElementById("dateLabel");

const dateText =
    document.getElementById("dateText");

const prevDate =
    document.getElementById("prevDate");

const nextDate =
    document.getElementById("nextDate");

const todayButton =
    document.getElementById("todayButton");

const totalTime =
    document.getElementById("totalTime");

const recordCount =
    document.getElementById("recordCount");

const chartTotal =
    document.getElementById("chartTotal");

const chart =
    document.getElementById("timeChart");

const chartLegend =
    document.getElementById("chartLegend");

const timeline =
    document.getElementById("timeline");

const timelineCount =
    document.getElementById("timelineCount");

const weeklyRecord =
    document.getElementById("weeklyRecord");

const monthlyCalendar =
    document.getElementById("monthlyCalendar");


const monthlyRanking =
    document.getElementById("monthlyRanking");

const categorySelect =
    document.getElementById("categorySelect");

const startButton =
    document.getElementById("startButton");

const stopButton =
    document.getElementById("stopButton");

const currentEmpty =
    document.getElementById("currentEmpty");

const currentRunning =
    document.getElementById("currentRunning");

const currentEmoji =
    document.getElementById("currentEmoji");

const currentName =
    document.getElementById("currentName");

const currentStatus =
    document.getElementById("currentStatus");

const startTime =
    document.getElementById("startTime");

const elapsedTime =
    document.getElementById("elapsedTime");

const undoButton =
    document.getElementById("undoButton");


/* ==========================================
   Modal DOM
========================================== */

const categoryModal =
    document.getElementById("categoryModal");

const categoryList =
    document.getElementById("categoryList");

const editModal =
    document.getElementById("editModal");

const categoryEditModal =
    document.getElementById("categoryEditModal");

const editCategory =
    document.getElementById("editCategory");

const editStart =
    document.getElementById("editStart");

const editEnd =
    document.getElementById("editEnd");

const categoryEmoji =
    document.getElementById("categoryEmoji");

const categoryName =
    document.getElementById("categoryName");

const categoryEditTitle =
    document.getElementById("categoryEditTitle");

const deleteCategoryButton =
    document.getElementById("deleteCategoryButton");


/* ==========================================
   Date Helpers
========================================== */

function getDateKey(date) {

    const d = new Date(date);

    const year =
        d.getFullYear();

    const month =
        String(d.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(d.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function dateFromKey(key) {

    const [year, month, day] =
        key.split("-").map(Number);

    return new Date(
        year,
        month - 1,
        day
    );

}


function changeDate(amount) {

    const date =
        dateFromKey(appData.selectedDate);

    date.setDate(
        date.getDate() + amount
    );

    appData.selectedDate =
        getDateKey(date);

    renderAll();

}


/* ==========================================
   Format
========================================== */

function formatDate(date) {

    return new Intl.DateTimeFormat(
        "ja-JP",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "short"
        }
    ).format(date);

}


function formatTime(dateString) {

    return new Date(dateString)
        .toLocaleTimeString(
            "ja-JP",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


function formatDuration(ms) {

    if (!ms || ms < 0)
        return "00:00:00";

    const total =
        Math.floor(ms / 1000);

    const hours =
        Math.floor(total / 3600);

    const minutes =
        Math.floor(
            (total % 3600) / 60
        );

    const seconds =
        total % 60;

    return [

        String(hours).padStart(2, "0"),

        String(minutes).padStart(2, "0"),

        String(seconds).padStart(2, "0")

    ].join(":");

}


function formatShortDuration(ms) {

    if (!ms || ms < 0)
        return "0分";

    const minutes =
        Math.floor(ms / 60000);

    if (minutes < 60)
        return `${minutes}分`;

    const hours =
        Math.floor(minutes / 60);

    const remaining =
        minutes % 60;

    if (remaining === 0)
        return `${hours}時間`;

    return `${hours}時間${remaining}分`;

}


/* ==========================================
   Storage
========================================== */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );

}


function loadData() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (saved) {

        try {

            const parsed =
                JSON.parse(saved);

            appData = {

                categories:
                    parsed.categories ||
                    DEFAULT_CATEGORIES,

                timeline:
                    parsed.timeline || [],

                currentActivity:
                    parsed.currentActivity ||
                    null,

                selectedDate:
                    parsed.selectedDate ||
                    getDateKey(new Date()),

                deletedBackup:
                    parsed.deletedBackup ||
                    null

            };

            return;

        } catch (error) {

            console.error(
                "データ読み込みエラー",
                error
            );

        }

    }


    /* ----------------------------------
       旧Project相棒データから移行
    ---------------------------------- */

    const oldSaved =
        localStorage.getItem(
            OLD_STORAGE_KEY
        );


    if (oldSaved) {

        try {

            const old =
                JSON.parse(oldSaved);

            const migratedTimeline =
                (old.timeline || [])
                    .map(item => {

                        const parts =
                            String(item.name || "その他")
                                .trim()
                                .split(" ");

                        const emoji =
                            parts.length > 1
                                ? parts[0]
                                : "➕";

                        const name =
                            parts.length > 1
                                ? parts.slice(1).join(" ")
                                : parts[0];

                        return {

                            id:
                                crypto.randomUUID(),

                            categoryId:
                                "other",

                            name:
                                name || "その他",

                            emoji:
                                emoji || "➕",

                            start:
                                item.start,

                            end:
                                item.end

                        };

                    });


            appData.timeline =
                migratedTimeline;

            appData.currentActivity =
                old.currentActivity || null;

            saveData();

        } catch (error) {

            console.error(
                "旧データ移行エラー",
                error
            );

        }

    }

}


/* ==========================================
   Category
========================================== */

function getCategory(id) {

    return appData.categories.find(
        category =>
            category.id === id
    );

}


function renderCategorySelect() {

    categorySelect.innerHTML = "";

    appData.categories.forEach(
        category => {

            const option =
                document.createElement("option");

            option.value =
                category.id;

            option.textContent =
                `${category.emoji} ${category.name}`;

            categorySelect.appendChild(
                option
            );

        }
    );


    editCategory.innerHTML = "";

    appData.categories.forEach(
        category => {

            const option =
                document.createElement("option");

            option.value =
                category.id;

            option.textContent =
                `${category.emoji} ${category.name}`;

            editCategory.appendChild(
                option
            );

        }
    );

}


function openCategoryModal() {

    renderCategoryList();

    categoryModal.classList.remove(
        "hidden"
    );

}


function closeCategoryModal() {

    categoryModal.classList.add(
        "hidden"
    );

}


function renderCategoryList() {

    categoryList.innerHTML = "";

    appData.categories.forEach(
        category => {

            const item =
                document.createElement("div");

            item.className =
                "category-item";


            const info =
                document.createElement("div");

            info.className =
                "category-info";


            const emoji =
                document.createElement("span");

            emoji.className =
                "emoji";

            emoji.textContent =
                category.emoji;


            const name =
                document.createElement("strong");

            name.textContent =
                category.name;


            info.append(
                emoji,
                name
            );


            const actions =
                document.createElement("div");

            actions.className =
                "category-actions";


            const edit =
                document.createElement("button");

            edit.className =
                "category-action";

            edit.textContent =
                "✏️";

            edit.addEventListener(
                "click",
                () =>
                    openCategoryEditor(
                        category.id
                    )
            );


            const del =
                document.createElement("button");

            del.className =
                "category-action";

            del.textContent =
                "🗑️";

            del.addEventListener(
                "click",
                () =>
                    deleteCategory(
                        category.id
                    )
            );


            actions.append(
                edit,
                del
            );


            item.append(
                info,
                actions
            );


            categoryList.appendChild(
                item
            );

        }
    );

}


function openCategoryEditor(id = null) {

    editingCategoryId = id;

    if (id) {

        const category =
            getCategory(id);

        categoryEditTitle.textContent =
            "カテゴリを編集";

        categoryEmoji.value =
            category.emoji;

        categoryName.value =
            category.name;

        deleteCategoryButton.classList
            .remove("hidden");

    } else {

        categoryEditTitle.textContent =
            "カテゴリを追加";

        categoryEmoji.value =
            "";

        categoryName.value =
            "";

        deleteCategoryButton.classList
            .add("hidden");

    }


    categoryEditModal.classList.remove(
        "hidden"
    );

}


function closeCategoryEditor() {

    categoryEditModal.classList.add(
        "hidden"
    );

    editingCategoryId = null;

}


function saveCategory() {

    const emoji =
        categoryEmoji.value.trim() || "➕";

    const name =
        categoryName.value.trim();


    if (!name) {

        alert(
            "カテゴリ名を入力してください。"
        );

        return;

    }


    if (editingCategoryId) {

        const category =
            getCategory(
                editingCategoryId
            );

        category.emoji =
            emoji;

        category.name =
            name;


        /* 過去の記録にも反映 */

        appData.timeline.forEach(
            item => {

                if (
                    item.categoryId ===
                    editingCategoryId
                ) {

                    item.emoji =
                        emoji;

                    item.name =
                        name;

                }

            }
        );


    } else {

        appData.categories.push({

            id:
                "category_" +
                Date.now(),

            emoji,

            name

        });

    }


    saveData();

    renderAll();

    closeCategoryEditor();

    renderCategoryList();

}


function deleteCategory(id) {

    if (
        appData.categories.length <= 1
    ) {

        alert(
            "カテゴリは最低1つ必要です。"
        );

        return;

    }


    const category =
        getCategory(id);


    const hasRecords =
        appData.timeline.some(
            item =>
                item.categoryId === id
        );


    let message =
        `「${category.name}」を削除しますか？`;


    if (hasRecords) {

        message +=
            "\nこのカテゴリの過去の記録は「その他」として残ります。";

    }


    if (!confirm(message))
        return;


    appData.timeline.forEach(
        item => {

            if (
                item.categoryId === id
            ) {

                const fallback =
                    appData.categories.find(
                        c => c.id !== id
                    );

                item.categoryId =
                    fallback.id;

                item.name =
                    fallback.name;

                item.emoji =
                    fallback.emoji;

            }

        }
    );


    appData.categories =
        appData.categories.filter(
            category =>
                category.id !== id
        );


    saveData();

    renderAll();

    renderCategoryList();

}


/* ==========================================
   Timeline
========================================== */

function getSelectedItems() {

    return appData.timeline
        .filter(item =>
            getDateKey(item.start) ===
            appData.selectedDate
        )
        .sort(
            (a, b) =>
                new Date(a.start) -
                new Date(b.start)
        );

}


function getDurationForItem(item) {

    if (!item.end)
        return 0;

    return (
        new Date(item.end) -
        new Date(item.start)
    );

}


function renderTimeline() {

    timeline.innerHTML = "";

    const items =
        getSelectedItems();


    timelineCount.textContent =
        `${items.length}件`;

    recordCount.textContent =
        items.length;


    if (!items.length) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty";

        empty.textContent =
            "この日の記録はまだありません。";

        timeline.appendChild(
            empty
        );

        return;

    }


    items.forEach(
        item => {

            const element =
                document.createElement("div");

            element.className =
                "timeline-item";


            const dot =
                document.createElement("div");

            dot.className =
                "timeline-dot";


            const top =
                document.createElement("div");

            top.className =
                "timeline-top";


            const category =
                document.createElement("div");

            category.className =
                "timeline-category";


            const emoji =
                document.createElement("span");

            emoji.textContent =
                item.emoji;


            const name =
                document.createElement("strong");

            name.textContent =
                item.name;


            category.append(
                emoji,
                name
            );


            const edit =
                document.createElement("button");

            edit.className =
                "timeline-edit";

            edit.textContent =
                "✏️";

            edit.addEventListener(
                "click",
                () =>
                    openEditModal(item.id)
            );


            top.append(
                category,
                edit
            );


            const time =
                document.createElement("div");

            time.className =
                "timeline-time";


            if (item.end) {

                time.textContent =
                    `${formatTime(item.start)} 〜 ${formatTime(item.end)}`;

            } else {

                time.textContent =
                    `${formatTime(item.start)} 〜 記録中`;

            }


            const duration =
                document.createElement("span");

            duration.className =
                "timeline-duration";

            duration.textContent =
                item.end
                    ? formatShortDuration(
                        getDurationForItem(item)
                    )
                    : "進行中";


            element.append(
                dot,
                top,
                time,
                duration
            );


            timeline.appendChild(
                element
            );

        }
    );

}


/* ==========================================
   Total Time
========================================== */

function getDayTotal(dateKey) {

    const items =
        appData.timeline.filter(
            item =>
                getDateKey(item.start) ===
                dateKey &&
                item.end
        );


    return items.reduce(
        (total, item) =>
            total +
            getDurationForItem(item),
        0
    );

}


function getDisplayTotal() {

    let total =
        getDayTotal(
            appData.selectedDate
        );


    /* 今日なら進行中も加える */

    if (
        appData.selectedDate ===
        getDateKey(new Date()) &&
        appData.currentActivity
    ) {

        total +=
            Date.now() -
            new Date(
                appData.currentActivity.start
            );

    }


    return total;

}


function renderSummary() {

    const total =
        getDisplayTotal();


    totalTime.textContent =
        formatShortDuration(total);

    chartTotal.textContent =
        formatShortDuration(total);

}


/* ==========================================
   Current Activity
========================================== */

function updateCurrentActivity() {

    if (!appData.currentActivity) {

        currentEmpty.classList
            .remove("hidden");

        currentRunning.classList
            .add("hidden");

        currentStatus.textContent =
            "待機中";

        currentStatus.classList
            .remove("active");

        return;

    }


    currentEmpty.classList
        .add("hidden");

    currentRunning.classList
        .remove("hidden");


    currentStatus.textContent =
        "記録中";

    currentStatus.classList
        .add("active");


    currentEmoji.textContent =
        appData.currentActivity.emoji;

    currentName.textContent =
        appData.currentActivity.name;

    startTime.textContent =
        formatTime(
            appData.currentActivity.start
        );


    updateElapsed();

}


function updateElapsed() {

    if (!appData.currentActivity) {

        elapsedTime.textContent =
            "00:00:00";

        return;

    }


    const elapsed =
        Date.now() -
        new Date(
            appData.currentActivity.start
        );


    elapsedTime.textContent =
        formatDuration(elapsed);

    renderSummary();

    renderChart();

}


/* ==========================================
   Start / Stop
========================================== */

function startActivity() {

    const category =
        getCategory(
            categorySelect.value
        );


    if (!category)
        return;


    /* 既に記録中なら終了 */

    if (appData.currentActivity) {

        endCurrentActivity();

    }


    appData.currentActivity = {

        id:
            crypto.randomUUID(),

        categoryId:
            category.id,

        name:
            category.name,

        emoji:
            category.emoji,

        start:
            new Date().toISOString(),

        end:
            null

    };


    saveData();

    updateCurrentActivity();

}


function endCurrentActivity() {

    if (!appData.currentActivity)
        return;


    const activity =
        appData.currentActivity;


    activity.end =
        new Date().toISOString();


    appData.timeline.push(
        activity
    );


    appData.currentActivity =
        null;


    saveData();

    renderAll();

}


/* ==========================================
   Edit Record
========================================== */

function openEditModal(id) {

    const item =
        appData.timeline.find(
            record =>
                record.id === id
        );


    if (!item)
        return;


    editingRecordId =
        id;


    renderCategorySelect();


    editCategory.value =
        item.categoryId;


    const start =
        new Date(item.start);


    const end =
        item.end
            ? new Date(item.end)
            : new Date();


    editStart.value =
        timeForInput(start);


    editEnd.value =
        timeForInput(end);


    editModal.classList.remove(
        "hidden"
    );

}


function closeEditModal() {

    editModal.classList.add(
        "hidden"
    );

    editingRecordId = null;

}


function timeForInput(date) {

    return [

        String(
            date.getHours()
        ).padStart(2, "0"),

        String(
            date.getMinutes()
        ).padStart(2, "0")

    ].join(":");

}


function saveEditedRecord() {

    const item =
        appData.timeline.find(
            record =>
                record.id ===
                editingRecordId
        );


    if (!item)
        return;


    const category =
        getCategory(
            editCategory.value
        );


    const date =
        dateFromKey(
            appData.selectedDate
        );


    const [startHour, startMinute] =
        editStart.value
            .split(":")
            .map(Number);


    const [endHour, endMinute] =
        editEnd.value
            .split(":")
            .map(Number);


    if (!editStart.value ||
        !editEnd.value) {

        alert(
            "開始と終了の時刻を入力してください。"
        );

        return;

    }


    const startDate =
        new Date(date);

    startDate.setHours(
        startHour,
        startMinute,
        0,
        0
    );


    const endDate =
        new Date(date);

    endDate.setHours(
        endHour,
        endMinute,
        0,
        0
    );


    if (endDate <= startDate) {

        alert(
            "終了時刻は開始時刻より後にしてください。"
        );

        return;

    }


    item.categoryId =
        category.id;

    item.name =
        category.name;

    item.emoji =
        category.emoji;

    item.start =
        startDate.toISOString();

    item.end =
        endDate.toISOString();


    saveData();

    closeEditModal();

    renderAll();

}


/* ==========================================
   Delete Record
========================================== */

function deleteRecord(id) {

    const index =
        appData.timeline.findIndex(
            item =>
                item.id === id
        );


    if (index === -1)
        return;


    const item =
        appData.timeline[index];


    appData.deletedBackup = {

        item:
            structuredClone(item),

        index

    };


    appData.timeline.splice(
        index,
        1
    );


    saveData();

    closeEditModal();

    renderAll();

}


function undoDelete() {

    if (!appData.deletedBackup)
        return;


    const backup =
        appData.deletedBackup;


    appData.timeline.splice(
        backup.index,
        0,
        backup.item
    );


    appData.deletedBackup =
        null;


    saveData();

    renderAll();

}


function renderUndoButton() {

    if (appData.deletedBackup) {

        undoButton.classList
            .remove("hidden");

    } else {

        undoButton.classList
            .add("hidden");

    }

}


/* ==========================================
   Chart
========================================== */

const CHART_COLORS = [

    "#63c7eb",
    "#8bd8ef",
    "#46afd8",
    "#a7e4f4",
    "#3c9fc7",
    "#bdebf7",
    "#79bdd6",
    "#d2f2fa"

];


function renderChart() {

    const canvas =
        chart;

    const ctx =
        canvas.getContext("2d");


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    const items =
        getSelectedItems();


    const categoryTotals = {};


    items.forEach(
        item => {

            const duration =
                getDurationForItem(item);


            if (!categoryTotals[item.categoryId]) {

                categoryTotals[item.categoryId] =
                    0;

            }


            categoryTotals[item.categoryId] +=
                duration;

        }
    );


    const entries =
        Object.entries(
            categoryTotals
        ).filter(
            ([, value]) =>
                value > 0
        );


    const total =
        entries.reduce(
            (sum, [, value]) =>
                sum + value,
            0
        );


    const centerX = 110;
    const centerY = 110;

    const radius = 84;
    const lineWidth = 26;


    if (!entries.length) {

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            radius,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "#eaf3f6";

        ctx.lineWidth =
            lineWidth;

        ctx.stroke();

        renderChartLegend([]);

        return;

    }


    let angle =
        -Math.PI / 2;


    entries.forEach(
        ([categoryId, value], index) => {

            const category =
                getCategory(categoryId);


            const slice =
                (value / total) *
                Math.PI *
                2;


            ctx.beginPath();

            ctx.arc(
                centerX,
                centerY,
                radius,
                angle,
                angle + slice
            );

            ctx.strokeStyle =
                CHART_COLORS[
                    index %
                    CHART_COLORS.length
                ];

            ctx.lineWidth =
                lineWidth;

            ctx.lineCap =
                "round";

            ctx.stroke();


            angle += slice;

        }
    );


    renderChartLegend(entries);

}


function renderChartLegend(entries) {

    chartLegend.innerHTML = "";


    if (!entries.length) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty";

        empty.style.padding =
            "5px";

        empty.textContent =
            "まだ記録がありません";

        chartLegend.appendChild(
            empty
        );

        return;

    }


    const total =
        entries.reduce(
            (sum, [, value]) =>
                sum + value,
            0
        );


    entries
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .forEach(
            ([categoryId, value], index) => {

                const category =
                    getCategory(categoryId);


                const item =
                    document.createElement("div");

                item.className =
                    "legend-item";


                const left =
                    document.createElement("div");

                left.className =
                    "legend-left";


                const dot =
                    document.createElement("span");

                dot.className =
                    "legend-dot";

                dot.style.background =
                    CHART_COLORS[
                        index %
                        CHART_COLORS.length
                    ];


                const name =
                    document.createElement("span");

                name.className =
                    "legend-name";

                name.textContent =
                    `${category?.emoji || "➕"} ${category?.name || "その他"}`;


                const percent =
                    Math.round(
                        (value / total) *
                        100
                    );


                const valueEl =
                    document.createElement("span");

                valueEl.className =
                    "legend-value";

                valueEl.textContent =
                    `${percent}%`;


                left.append(
                    dot,
                    name
                );


                item.append(
                    left,
                    valueEl
                );


                chartLegend.appendChild(
                    item
                );

            }
        );

}


/* ==========================================
   Weekly
========================================== */

function renderWeekly() {

    weeklyRecord.innerHTML = "";


    const selected =
        dateFromKey(
            appData.selectedDate
        );


    const start =
        new Date(selected);

    const day =
        start.getDay();

    const diff =
        day === 0
            ? -6
            : 1 - day;


    start.setDate(
        start.getDate() + diff
    );


    const days = [];


    for (let i = 0; i < 7; i++) {

        const date =
            new Date(start);

        date.setDate(
            start.getDate() + i
        );

        days.push(date);

    }


    const totals =
        days.map(
            date =>
                getDayTotal(
                    getDateKey(date)
                )
        );


    const max =
        Math.max(
            ...totals,
            1
        );


    const weekNames =
        [
            "月",
            "火",
            "水",
            "木",
            "金",
            "土",
            "日"
        ];


    days.forEach(
        (date, index) => {

            const key =
                getDateKey(date);


            const total =
                totals[index];


            const item =
                document.createElement("div");

            item.className =
                "week-day";


            if (
                key ===
                appData.selectedDate
            ) {

                item.classList.add(
                    "selected"
                );

            }


            item.addEventListener(
                "click",
                () => {

                    appData.selectedDate =
                        key;

                    renderAll();

                }
            );


            const name =
                document.createElement("div");

            name.className =
                "week-day-name";

            name.textContent =
                weekNames[index];


            const number =
                document.createElement("div");

            number.className =
                "week-day-number";

            number.textContent =
                date.getDate();


            const bar =
                document.createElement("div");

            bar.className =
                "week-bar";


            const barInner =
                document.createElement("div");

            barInner.className =
                "week-bar-inner";

            barInner.style.width =
                `${Math.round(
                    (total / max) * 100
                )}%`;


            bar.appendChild(
                barInner
            );


            const duration =
                document.createElement("div");

            duration.className =
                "week-duration";

            duration.textContent =
                formatShortDuration(
                    total
                );


            item.append(
                name,
                number,
                bar,
                duration
            );


            weeklyRecord.appendChild(
                item
            );

        }
    );

}
function renderMonthlyCalendar(){

    monthlyCalendar.innerHTML = "";


    const selected =
        dateFromKey(
            appData.selectedDate
        );


    const year =
        selected.getFullYear();


    const month =
        selected.getMonth();


    const title =
        document.createElement("h3");

    title.textContent =
        `${year}年${month + 1}月`;


    monthlyCalendar.appendChild(title);



    const grid =
        document.createElement("div");


    grid.style.display =
        "grid";

    grid.style.gridTemplateColumns =
        "repeat(7,1fr)";

    grid.style.gap =
        "6px";



    const first =
        new Date(
            year,
            month,
            1
        );


    const last =
        new Date(
            year,
            month + 1,
            0
        );


    // 月初まで空白
    for(
        let i = 0;
        i < first.getDay();
        i++
    ){

        grid.appendChild(
            document.createElement("div")
        );

    }



    for(
        let day = 1;
        day <= last.getDate();
        day++
    ){

        const cell =
            document.createElement("div");


        cell.textContent =
            day;


        cell.style.textAlign =
            "center";

        cell.style.padding =
            "10px";


        const key =
            getDateKey(
                new Date(
                    year,
                    month,
                    day
                )
            );


        const hasRecord =
            appData.timeline.some(item =>
                getDateKey(item.start)
                === key
            );


        if(hasRecord){

            cell.style.background =
                "var(--primary-light)";

            cell.style.borderRadius =
                "50%";

        }


        grid.appendChild(cell);

    }


    monthlyCalendar.appendChild(grid);

}

/* ==========================================
   Date UI
========================================== */

function renderDate() {

    const selected =
        dateFromKey(
            appData.selectedDate
        );


    const todayKey =
        getDateKey(
            new Date()
        );


    if (
        appData.selectedDate ===
        todayKey
    ) {

        dateLabel.textContent =
            "TODAY";

    } else {

        dateLabel.textContent =
            formatDate(selected)
                .split(" ")
                .pop();

    }


    dateText.textContent =
        formatDate(selected);

}


/* ==========================================
   Render All
========================================== */

function renderAll() {

    renderDate();

    renderCategorySelect();

    renderSummary();

    updateCurrentActivity();

    renderTimeline();

    renderChart();

    renderWeekly();

    renderMonthly();

    renderUndoButton();

    saveData();

}


/* ==========================================
   Events
========================================== */

prevDate.addEventListener(
    "click",
    () =>
        changeDate(-1)
);


nextDate.addEventListener(
    "click",
    () =>
        changeDate(1)
);


todayButton.addEventListener(
    "click",
    () => {

        appData.selectedDate =
            getDateKey(
                new Date()
            );

        renderAll();

    }
);


startButton.addEventListener(
    "click",
    startActivity
);


stopButton.addEventListener(
    "click",
    endCurrentActivity
);


undoButton.addEventListener(
    "click",
    undoDelete
);


document
    .getElementById("manageCategoryButton")
    .addEventListener(
        "click",
        openCategoryModal
    );


document
    .getElementById("closeCategoryModal")
    .addEventListener(
        "click",
        closeCategoryModal
    );


document
    .getElementById("modalOverlay")
    .addEventListener(
        "click",
        closeCategoryModal
    );


document
    .getElementById("addCategoryButton")
    .addEventListener(
        "click",
        () =>
            openCategoryEditor()
    );


document
    .getElementById("closeCategoryEditModal")
    .addEventListener(
        "click",
        closeCategoryEditor
    );


document
    .getElementById("categoryEditOverlay")
    .addEventListener(
        "click",
        closeCategoryEditor
    );


document
    .getElementById("saveCategoryButton")
    .addEventListener(
        "click",
        saveCategory
    );


deleteCategoryButton.addEventListener(
    "click",
    () => {

        if (editingCategoryId) {

            deleteCategory(
                editingCategoryId
            );

            closeCategoryEditor();

        }

    }
);


document
    .getElementById("closeEditModal")
    .addEventListener(
        "click",
        closeEditModal
    );


document
    .getElementById("editOverlay")
    .addEventListener(
        "click",
        closeEditModal
    );


document
    .getElementById("saveEditButton")
    .addEventListener(
        "click",
        saveEditedRecord
    );


document
    .getElementById("deleteEditButton")
    .addEventListener(
        "click",
        () => {

            if (!editingRecordId)
                return;


            if (
                confirm(
                    "この記録を削除しますか？"
                )
            ) {

                deleteRecord(
                    editingRecordId
                );

            }

        }
    );


/* ==========================================
   Timer
================================		========== */

setInterval(
    () => {

        updateElapsed();

    },
    1000
);



/* ==========================================
   Initialize
========================================== */

function initialize() {

    loadData();

    renderAll();

}

/* ==========================================
   Hamburger Menu
========================================== */

const menuButton =
    document.getElementById("menuButton");

const sideMenu =
    document.getElementById("sideMenu");

const menuOverlay =
    document.getElementById("menuOverlay");


function toggleMenu() {

    sideMenu.classList.toggle("open");

    menuOverlay.classList.toggle("open");

    if (sideMenu.classList.contains("open")) {

        menuButton.textContent = "×";

    } else {

        menuButton.textContent = "☰";

    }

}


function closeMenu() {

    sideMenu.classList.remove("open");

    menuOverlay.classList.remove("open");

    menuButton.textContent = "☰";

}


/* Menu button */

menuButton.addEventListener(
    "click",
    toggleMenu
);


/* Overlay */

menuOverlay.addEventListener(
    "click",
    closeMenu
);


/* Menu links */

document
    .querySelectorAll(".side-menu a")
    .forEach(link => {

        link.addEventListener(
            "click",
            closeMenu
        );

    });


/* ==========================================
   Initialize
========================================== */

initialize();


/* ==========================================
   Service Worker
========================================== */

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("sw.js");

}