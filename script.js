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
   App State
========================================== */

let appData = {

    categories: DEFAULT_CATEGORIES,

    timeline: [],

    currentActivity: null,

    selectedDate:
        getDateKey(new Date()),

    deletedBackup: null

};


let editingRecordId = null;

let editingCategoryId = null;


/* ==========================================
   DOM Elements
========================================== */


// Date

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


// Summary

const totalTime =
    document.getElementById("totalTime");

const recordCount =
    document.getElementById("recordCount");

const chartTotal =
    document.getElementById("chartTotal");


// Chart

const chart =
    document.getElementById("timeChart");

const chartLegend =
    document.getElementById("chartLegend");


// Timeline

const timeline =
    document.getElementById("timeline");

const timelineCount =
    document.getElementById("timelineCount");


// Monthly

const monthlyCalendar =
    document.getElementById("monthlyCalendar");

const monthlyRanking =
    document.getElementById("monthlyRanking");


// Weekly

const weeklyRecord =
    document.getElementById("weeklyRecord");


// Timer

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


// Undo

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

    const d =
        new Date(date);


    const year =
        d.getFullYear();


    const month =
        String(
            d.getMonth() + 1
        )
        .padStart(2,"0");


    const day =
        String(
            d.getDate()
        )
        .padStart(2,"0");


    return `${year}-${month}-${day}`;

}



function dateFromKey(key) {

    const [
        year,
        month,
        day
    ] =
        key
        .split("-")
        .map(Number);


    return new Date(
        year,
        month - 1,
        day
    );

}



function changeDate(amount) {

    const date =
        dateFromKey(
            appData.selectedDate
        );


    date.setDate(
        date.getDate() + amount
    );


    appData.selectedDate =
        getDateKey(date);


    renderAll();

}



/* ==========================================
   Format Helpers
========================================== */


function formatDate(date) {

    return new Intl.DateTimeFormat(
        "ja-JP",
        {
            year:"numeric",
            month:"long",
            day:"numeric",
            weekday:"short"
        }
    )
    .format(date);

}



function formatTime(dateString) {

    return new Date(dateString)
        .toLocaleTimeString(
            "ja-JP",
            {
                hour:"2-digit",
                minute:"2-digit"
            }
        );

}



function formatDuration(ms) {

    if(!ms || ms < 0)
        return "00:00:00";


    const total =
        Math.floor(
            ms / 1000
        );


    const hours =
        Math.floor(
            total / 3600
        );


    const minutes =
        Math.floor(
            (total % 3600) / 60
        );


    const seconds =
        total % 60;


    return [

        String(hours).padStart(2,"0"),

        String(minutes).padStart(2,"0"),

        String(seconds).padStart(2,"0")

    ]
    .join(":");

}



function formatShortDuration(ms){

    if(!ms || ms < 0)
        return "0分";


    const minutes =
        Math.floor(
            ms / 60000
        );


    if(minutes < 60){

        return `${minutes}分`;

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    const remaining =
        minutes % 60;


    if(remaining === 0){

        return `${hours}時間`;

    }


    return `${hours}時間${remaining}分`;

}



/* ==========================================
   Data Helpers
   (MONTH準備)
========================================== */


function getSelectedItems(){

    return appData.timeline
        .filter(item =>
            getDateKey(item.start)
            === appData.selectedDate
        );

}



function getMonthItems(year, month){

    return appData.timeline.filter(item=>{

        const date =
            new Date(item.start);


        return (
            date.getFullYear()
            === year
            &&
            date.getMonth()
            === month
        );

    });

}



function getDurationForItem(item){

    if(!item.end)
        return 0;


    return (
        new Date(item.end)
        -
        new Date(item.start)
    );

}



function getDayTotal(dateKey){

    return appData.timeline
        .filter(item=>
            getDateKey(item.start)
            === dateKey
            &&
            item.end
        )
        .reduce(
            (total,item)=>
                total +
                getDurationForItem(item),
            0
        );

}
/* ==========================================
   Storage
========================================== */


function saveData(){

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );

}



function loadData(){

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );


    if(saved){

        try{

            const parsed =
                JSON.parse(saved);


            appData = {

                categories:
                    parsed.categories ||
                    DEFAULT_CATEGORIES,

                timeline:
                    parsed.timeline ||
                    [],

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


        }catch(error){

            console.error(
                "データ読み込みエラー",
                error
            );

        }

    }


    /* 旧Project相棒データ移行 */

    const oldSaved =
        localStorage.getItem(
            OLD_STORAGE_KEY
        );


    if(oldSaved){

        try{

            const old =
                JSON.parse(oldSaved);


            appData.timeline =
                (old.timeline || [])
                .map(item=>({

                    id:
                        crypto.randomUUID(),

                    categoryId:
                        "other",

                    name:
                        item.name || "その他",

                    emoji:
                        "➕",

                    start:
                        item.start,

                    end:
                        item.end

                }));


            appData.currentActivity =
                old.currentActivity ||
                null;


            saveData();


        }catch(error){

            console.error(
                "移行エラー",
                error
            );

        }

    }

}




/* ==========================================
   Category
========================================== */


function getCategory(id){

    return appData.categories.find(
        category =>
            category.id === id
    );

}



function renderCategorySelect(){

    categorySelect.innerHTML = "";


    appData.categories.forEach(category=>{

        const option =
            document.createElement("option");


        option.value =
            category.id;


        option.textContent =
            `${category.emoji} ${category.name}`;


        categorySelect.appendChild(option);

    });


    editCategory.innerHTML = "";


    appData.categories.forEach(category=>{

        const option =
            document.createElement("option");


        option.value =
            category.id;


        option.textContent =
            `${category.emoji} ${category.name}`;


        editCategory.appendChild(option);

    });

}





/* ==========================================
   Timeline
========================================== */


function renderTimeline(){

    timeline.innerHTML="";


    const items =
        getSelectedItems();


    timelineCount.textContent =
        `${items.length}件`;


    recordCount.textContent =
        items.length;



    if(!items.length){

        const empty =
            document.createElement("div");


        empty.className =
            "empty";


        empty.textContent =
            "この日の記録はまだありません。";


        timeline.appendChild(empty);

        return;

    }



    items.forEach(item=>{


        const element =
            document.createElement("div");


        element.className =
            "timeline-item";



        const title =
            document.createElement("div");


        title.textContent =
            `${item.emoji} ${item.name}`;



        const time =
            document.createElement("div");


        time.textContent =
            item.end
            ?
            `${formatTime(item.start)}〜${formatTime(item.end)}`
            :
            "記録中";



        const duration =
            document.createElement("span");


        duration.textContent =
            item.end
            ?
            formatShortDuration(
                getDurationForItem(item)
            )
            :
            "進行中";



        element.append(
            title,
            time,
            duration
        );


        timeline.appendChild(element);


    });


}





/* ==========================================
   Summary
========================================== */


function getDisplayTotal(){

    let total =
        getDayTotal(
            appData.selectedDate
        );


    if(
        appData.selectedDate
        ===
        getDateKey(new Date())
        &&
        appData.currentActivity
    ){

        total +=
            Date.now()
            -
            new Date(
                appData.currentActivity.start
            );

    }


    return total;

}



function renderSummary(){

    const total =
        getDisplayTotal();


    totalTime.textContent =
        formatShortDuration(total);


    chartTotal.textContent =
        formatShortDuration(total);

}





/* ==========================================
   Timer
========================================== */


function updateCurrentActivity(){

    if(!appData.currentActivity){

        currentEmpty.classList.remove("hidden");

        currentRunning.classList.add("hidden");

        currentStatus.textContent =
            "待機中";

        return;

    }



    currentEmpty.classList.add("hidden");

    currentRunning.classList.remove("hidden");


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




function updateElapsed(){

    if(!appData.currentActivity){

        elapsedTime.textContent =
            "00:00:00";

        return;

    }


    const elapsed =
        Date.now()
        -
        new Date(
            appData.currentActivity.start
        );


    elapsedTime.textContent =
        formatDuration(elapsed);


    renderSummary();

}






function startActivity(){

    const category =
        getCategory(
            categorySelect.value
        );


    if(!category)
        return;



    if(appData.currentActivity){

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

        end:null

    };


    saveData();

    updateCurrentActivity();

}





function endCurrentActivity(){

    if(!appData.currentActivity)
        return;


    const activity =
        appData.currentActivity;


    activity.end =
        new Date().toISOString();


    appData.timeline.push(activity);


    appData.currentActivity =
        null;


    saveData();

    renderAll();

}





/* ==========================================
   Monthly Base
========================================== */


function renderMonthlyCalendar(){

    if(!monthlyCalendar)
        return;


    monthlyCalendar.innerHTML="";


    const date =
        dateFromKey(
            appData.selectedDate
        );


    const year =
        date.getFullYear();


    const month =
        date.getMonth();



    const title =
        document.createElement("h3");


    title.textContent =
        `${year}年${month+1}月`;


    monthlyCalendar.appendChild(title);



    const grid =
        document.createElement("div");


    grid.className =
        "monthly-grid";



    const days =
        new Date(
            year,
            month+1,
            0
        )
        .getDate();



    for(let i=1;i<=days;i++){

        const cell =
            document.createElement("div");


        cell.textContent =
            i;


        grid.appendChild(cell);

    }


    monthlyCalendar.appendChild(grid);

}






/* ==========================================
   Render All
========================================== */


function renderAll(){

    renderDate();

    renderCategorySelect();

    renderSummary();

    updateCurrentActivity();

    renderTimeline();

    renderWeekly();

    renderMonthlyCalendar();

    renderUndoButton();

    saveData();

}





/* ==========================================
   Date UI
========================================== */


function renderDate(){

    const date =
        dateFromKey(
            appData.selectedDate
        );


    dateText.textContent =
        formatDate(date);

}




/* ==========================================
   Undo
========================================== */


function renderUndoButton(){

    if(!undoButton)
        return;


    undoButton.classList.toggle(
        "hidden",
        !appData.deletedBackup
    );

}





/* ==========================================
   Events
========================================== */


prevDate.addEventListener(
    "click",
    ()=>changeDate(-1)
);


nextDate.addEventListener(
    "click",
    ()=>changeDate(1)
);


todayButton.addEventListener(
    "click",
    ()=>{

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




/* ==========================================
   Hamburger
========================================== */


const menuButton =
    document.getElementById("menuButton");


const sideMenu =
    document.getElementById("sideMenu");


const menuOverlay =
    document.getElementById("menuOverlay");



function toggleMenu(){

    sideMenu.classList.toggle("open");

    menuOverlay.classList.toggle("open");

}



menuButton.addEventListener(
    "click",
    toggleMenu
);



menuOverlay.addEventListener(
    "click",
    ()=>{

        sideMenu.classList.remove("open");

        menuOverlay.classList.remove("open");

    }
);





/* ==========================================
   Initialize
========================================== */


function initialize(){

    loadData();

    renderAll();

}



setInterval(
    updateElapsed,
    1000
);



initialize();





/* ==========================================
   Service Worker
========================================== */


if(
    "serviceWorker"
    in navigator
){

    navigator.serviceWorker.register(
        "sw.js"
    );

}
