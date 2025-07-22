// JavaScript codes are written here.

// 1. Get necessary HTML elements into JavaScript variables.
const todoInput = document.getElementById('todoInput'); // Todo input field
const addTodoBtn = document.getElementById('addTodoBtn'); // 'Add' button
const todoList = document.getElementById('todoList'); // ul element to hold the todo list
const inputSection = document.querySelector('.input-section'); // 입력 섹션 요소 가져오기
const todoAppContent = document.querySelector('.todo-app-content'); // 할 일 앱 콘텐츠 컨테이너
let draggedItem = null; // 현재 드래그 중인 아이템을 저장할 변수

// 크기 조절을 위한 변수
let isResizing = false;
let currentResizableItem = null;
let initialX, initialY, initialWidth, initialHeight;
const MIN_WIDTH = 150; // 포스트잇 최소 너비
const MIN_HEIGHT = 150; // 포스트잇 최소 높이

// 9가지 포스트잇 색상 정의
const POSTIT_COLORS = [
    '#fffacd', // 연한 노랑 (기존)
    '#a0c4ff', // 연한 파랑
    '#caffbf', // 연한 초록
    '#ffadad', // 연한 분홍
    '#bdb2ff', // 연한 보라
    '#ffd6a5', // 연한 주황
    '#e0e0e0', // 연한 회색
    '#ade8f4', // 연한 하늘색
    '#ffc8dd'  // 연한 복숭아색
];


// 2. Function to load todo list from local storage when the app loads.
function loadTasks() {
    // Get data stored in local storage under the name 'tasks'.
    // If there's no data, use an empty array as default.
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // For each loaded task, call the createTodoItem function to display it on the screen.
    tasks.forEach(task => createTodoItem(task.title, task.content, task.completed, task.rotation, task.width, task.minHeight, task.color, task.date, task.time));
    updateAddButtonState(); // 페이지 로드 시 버튼 상태 초기화
}

// 3. Function to save the current todo list to local storage.
function saveTasks() {
    const tasks = [];
    // Iterate through all child elements (li) of todoList.
    todoList.querySelectorAll('.todo-item').forEach(item => {
        tasks.push({
            title: item.querySelector('.todo-title').textContent, // Todo title
            content: item.querySelector('.todo-content').textContent, // Todo content
            // Check if 'completed' class exists to save the completion status.
            completed: item.querySelector('.todo-title').classList.contains('completed'),
            // Save the rotation angle of the post-it.
            rotation: item.style.getPropertyValue('--rotation') || '0deg',
            // Save the current width and minHeight of the post-it.
            width: item.style.width || '220px', // 기본값 220px
            minHeight: item.style.minHeight || '220px', // 기본값 220px
            // Save the background color of the post-it.
            color: item.style.backgroundColor || POSTIT_COLORS[0], // 기본값은 첫 번째 색상
            // Save date and time
            date: item.querySelector('.todo-date-input').value,
            time: item.querySelector('.todo-time-input').value
        });
    });
    // Convert the task array to a JSON string and save it to local storage.
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Helper function to get current date in YYYY-MM-DD format
function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper function to get current time in HH:MM format
function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}


// 4. Function to create a new todo item (li) and add it to the screen.
function createTodoItem(titleText, contentText = '내용을 입력하세요...', completed = false, rotation = null, width = '220px', minHeight = '220px', color = null, dateText = null, timeText = null) {
    const listItem = document.createElement('li'); // Create a new <li> element
    listItem.className = 'todo-item'; // Apply CSS class
    listItem.draggable = true; // 이 요소를 드래그 가능하게 설정

    // Set width and minHeight for the list item
    listItem.style.width = width;
    listItem.style.minHeight = minHeight;

    // Set random rotation angle for post-it (if it's a new todo).
    if (rotation === null) {
        const randomRotation = (Math.random() * 6 - 3); // Between -3 and +3 degrees
        listItem.style.setProperty('--rotation', `${randomRotation}deg`);
    } else {
        listItem.style.setProperty('--rotation', rotation); // Use saved angle
    }

    // Set post-it color
    if (color === null) {
        const randomColor = POSTIT_COLORS[Math.floor(Math.random() * POSTIT_COLORS.length)];
        listItem.style.backgroundColor = randomColor;
    } else {
        listItem.style.backgroundColor = color; // Use saved color
    }


    // Create a span for the todo title (not editable)
    const todoTitleSpan = document.createElement('span'); // Create a <span> to hold the todo title
    todoTitleSpan.textContent = titleText; // Set title text
    todoTitleSpan.className = 'todo-title'; // Apply CSS class for title
    // todoTitleSpan.contentEditable = false; // Explicitly set to false, though default is false

    // If the todo is completed, add the 'completed' class to the title.
    if (completed) {
        todoTitleSpan.classList.add('completed');
    }

    // Event listener to toggle completed/uncompleted status when todo title is clicked.
    todoTitleSpan.addEventListener('click', () => {
        todoTitleSpan.classList.toggle('completed'); // Add/remove 'completed' class
        saveTasks(); // Save to local storage after status change
    });

    // --- Date and Time Inputs ---
    const dateTimeContainer = document.createElement('div');
    dateTimeContainer.className = 'date-time-container';

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.className = 'todo-date-input';
    dateInput.value = dateText === null ? getCurrentDate() : dateText; // Set value or current date

    const timeInput = document.createElement('input');
    timeInput.type = 'time';
    timeInput.className = 'todo-time-input';
    timeInput.value = timeText === null ? '' : timeText; // Set value or empty string

    // Add event listeners to save tasks when date or time changes
    dateInput.addEventListener('change', saveTasks);
    timeInput.addEventListener('change', saveTasks);

    dateTimeContainer.appendChild(dateInput);
    dateTimeContainer.appendChild(timeInput);


    // Create a span for the todo content (editable)
    const todoContentSpan = document.createElement('span'); // Create a <span> to hold the todo content
    todoContentSpan.textContent = contentText; // Set content text
    todoContentSpan.className = 'todo-content'; // Apply CSS class for content
    todoContentSpan.contentEditable = true; // Make the span content editable!

    // Event listener to save tasks when the user clicks outside the editable area (blur).
    todoContentSpan.addEventListener('blur', () => {
        // Ensure text is not empty after editing
        if (todoContentSpan.textContent.trim() === '') {
            todoContentSpan.textContent = '내용을 입력하세요...'; // Default text if empty
        }
        saveTasks(); // Save to local storage after text is edited
    });

    // Event listener to save tasks and remove focus when Enter key is pressed.
    todoContentSpan.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent new line from being added
            todoContentSpan.blur(); // Remove focus from the span, triggering blur event
        }
    });

    const deleteBtn = document.createElement('button'); // Create delete button
    deleteBtn.textContent = '삭제'; // Button text
    deleteBtn.className = 'delete-btn'; // Apply CSS class

    // Event listener to delete the todo item when the delete button is clicked.
    deleteBtn.addEventListener('click', () => {
        todoList.removeChild(listItem); // Remove the listItem from todoList
        saveTasks(); // Save to local storage after deletion
    });

    // Create resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';

    // Resize event listeners for the handle
    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        currentResizableItem = listItem;
        initialX = e.clientX;
        initialY = e.clientY;
        initialWidth = listItem.offsetWidth;
        initialHeight = listItem.offsetHeight;

        // Prevent text selection during drag
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'se-resize';

        // Add mouse move and up events to document to track outside handle area
        document.addEventListener('mousemove', resizeItem);
        document.addEventListener('mouseup', stopResizing);
    });

    // Append the created title, date/time, content, delete button, and resize handle to the <li>.
    listItem.appendChild(todoTitleSpan);
    listItem.appendChild(dateTimeContainer); // 날짜/시간 컨테이너 추가
    listItem.appendChild(todoContentSpan);
    listItem.appendChild(deleteBtn);
    listItem.appendChild(resizeHandle); // Add resize handle

    // Append the completed <li> to the todo list (todoList).
    todoList.appendChild(listItem);

    // --- Drag and Drop Event Listeners for each todo item ---
    listItem.addEventListener('dragstart', (e) => {
        // Prevent drag if currently resizing
        if (isResizing) {
            e.preventDefault();
            return;
        }
        draggedItem = listItem;
        // Add 'dragging' class to the item being dragged (visual effect)
        // Use setTimeout to ensure the class is applied at the start of the drag, not immediately
        setTimeout(() => {
            listItem.classList.add('dragging');
        }, 0);
    });

    listItem.addEventListener('dragend', () => {
        // Remove 'dragging' class when drag ends
        listItem.classList.remove('dragging');
        draggedItem = null; // Reset dragged item
        // Remove drop target indicator from all items
        todoList.querySelectorAll('.todo-item').forEach(item => {
            item.classList.remove('drop-target-indicator');
        });
    });
}

// Function to update the 'Add' button's style based on input field content
function updateAddButtonState() {
    if (todoInput.value.trim() === '') {
        addTodoBtn.classList.remove('active');
        addTodoBtn.classList.add('inactive');
        addTodoBtn.disabled = true; // Disable button click when inactive
    } else {
        addTodoBtn.classList.remove('inactive');
        addTodoBtn.classList.add('active');
        addTodoBtn.disabled = false; // Enable button click when active
    }
}

// 5. Function to add a todo when 'Add' button is clicked or Enter key is pressed.
function addTodo() {
    const todoText = todoInput.value.trim(); // Get text from input field and remove leading/trailing spaces.

    // If the input text is empty, start the game
    if (todoText === '') {
        startGame(); // 미니 게임 시작
        return; // 할 일 추가 로직은 건너뜀
    }

    // When adding a new todo, the input text becomes the title. Content starts as default.
    createTodoItem(todoText, '내용을 입력하세요...', false, null, '220px', '220px', null, null, null);
    saveTasks(); // Save to local storage after adding todo
    todoInput.value = ''; // Clear the input field.
    todoInput.focus(); // Give focus back to the input field.
    updateAddButtonState(); // Update button state after adding todo
}

// --- Drag and Drop Logic for the todoList container ---

// Helper function to find the element after which the dragged item should be dropped
function getDragAfterElement(container, y) {
    // Get all draggable elements except the one currently being dragged
    const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        // Midpoint of the item (vertical)
        const offset = y - box.top - box.height / 2;

        // If the mouse pointer is above the midpoint of the item, and it's closer
        // than the closest item found so far, return this item
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: -Infinity }).element; // Initialize with an empty object with -Infinity offset
}

todoList.addEventListener('dragover', (e) => {
    e.preventDefault(); // Prevent default behavior to allow dropping
    if (!draggedItem || isResizing) return; // Do nothing if no item is being dragged or resizing

    // Remove drop target indicator from all items
    todoList.querySelectorAll('.todo-item').forEach(item => {
        item.classList.remove('drop-target-indicator');
    });

    const afterElement = getDragAfterElement(todoList, e.clientY);

    if (afterElement == null) {
        // If there's no drop target (dropping at the very end)
        // If todoList has children and draggedItem is not the last child, indicate last child
        if (todoList.lastElementChild && draggedItem !== todoList.lastElementChild) {
            todoList.lastElementChild.classList.add('drop-target-indicator');
        }
    } else {
        // If there's a drop target, indicate that element
        afterElement.classList.add('drop-target-indicator');
    }
});

todoList.addEventListener('drop', (e) => {
    e.preventDefault(); // Prevent default behavior on drop
    if (!draggedItem || isResizing) return; // Do nothing if no item is being dragged or resizing

    // Remove drop target indicator
    todoList.querySelectorAll('.todo-item').forEach(item => {
        item.classList.remove('drop-target-indicator');
    });

    const afterElement = getDragAfterElement(todoList, e.clientY);

    if (afterElement == null) {
        // If there's no drop target (dropping at the very end)
        todoList.appendChild(draggedItem);
    } else {
        // If there's a drop target, insert before that element
        todoList.insertBefore(draggedItem, afterElement);
    }
    saveTasks(); // Save to local storage after order change
});

// --- Resize Logic Functions ---
function resizeItem(e) {
    if (!isResizing || !currentResizableItem) return;

    const newWidth = Math.max(MIN_WIDTH, initialWidth + (e.clientX - initialX));
    const newHeight = Math.max(MIN_HEIGHT, initialHeight + (e.clientY - initialY));

    currentResizableItem.style.width = `${newWidth}px`;
    currentResizableItem.style.minHeight = `${newHeight}px`;
}

function stopResizing() {
    isResizing = false;
    currentResizableItem = null;
    document.body.style.userSelect = ''; // Allow text selection again
    document.body.style.cursor = ''; // Reset cursor to default
    document.removeEventListener('mousemove', resizeItem);
    document.removeEventListener('mouseup', stopResizing);
    saveTasks(); // Save to local storage after size change
}


// 6. Set up event listeners: Start the app's operations.
addTodoBtn.addEventListener('click', addTodo); // Execute addTodo function when 'Add' button is clicked

// Allow adding todo when Enter key is pressed in the input field.
todoInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTodo();
    }
});

// Update button state whenever input field content changes
todoInput.addEventListener('input', updateAddButtonState);

// 7. Load saved todo list and display it on the screen when the page loads.
document.addEventListener('DOMContentLoaded', loadTasks);


/* --- 미니 공룡 게임 로직 시작 --- */

// 게임 관련 HTML 요소 가져오기
const dinoGameContainer = document.querySelector('.dino-game-container');
const dinoCanvas = document.getElementById('dinoCanvas');
const ctx = dinoCanvas.getContext('2d');
const startGameBtn = document.getElementById('startGameBtn');
const backToTodoBtn = document.getElementById('backToTodoBtn');
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverMessage = document.getElementById('gameOverMessage');
const difficultySelect = document.getElementById('difficultySelect'); // 난이도 선택 드롭다운 가져오기

// 게임 변수
let gameActive = false;
let score = 0;
let animationFrameId;
let currentObstacleInterval; // 초기화 시 난이도에 따라 설정
let OBSTACLE_SPEED; // 초기화 시 난이도에 따라 설정
const MIN_OBSTACLE_INTERVAL = 500; // 최소 장애물 생성 간격 (0.5초)
let lastSpeedIncreaseScore = 0; // 마지막으로 속도가 증가한 점수 (블록 생성 간격용)
let lastObstacleSpeedIncreaseScore = 0; // 마지막으로 장애물 이동 속도가 증가한 점수 (새로 추가)
let isBackgroundWhite = true; // 현재 배경색이 흰색인지 추적하는 변수
let isDinoWhite = false; // 현재 공룡 색상이 흰색인지 추적하는 변수 (기본: 검은색)

// 게임 난이도 설정 객체
const GAME_MODES = {
    easy: {
        initialInterval: 1500, // 1.5초
        intervalDecrease: 25,  // 0.025초 감소
        obstacleSpeed: 5 // 쉬움 모드 장애물 속도 5
    },
    hard: {
        initialInterval: 900, // 0.90초
        intervalDecrease: 40,  // 0.04초 감소
        obstacleSpeed: 6 // 어려움 모드 장애물 속도 6
    }
};


// 공룡 설정
const dino = {
    x: 50,
    y: dinoCanvas.height - 30,
    width: 20,
    height: 30,
    velocityY: 0,
    gravity: 0.6,
    isJumping: false
};

// 장애물 설정 (이제 상수 대신 최소/최대값 정의)
const MIN_OBSTACLE_DIMENSION = 15; // 장애물 최소 너비/높이
const MAX_OBSTACLE_DIMENSION = 40; // 장애물 최대 너비/높이
let obstacles = []; // 장애물 배열
let obstacleSpawnInterval; // 장애물 생성 인터벌 ID

// 게임 초기화
function initGame() {
    score = 0;
    scoreDisplay.textContent = score;
    gameOverMessage.style.display = 'none';
    dino.y = dinoCanvas.height - dino.height;
    dino.velocityY = 0;
    dino.isJumping = false;
    obstacles = [];

    // 선택된 난이도에 따라 게임 파라미터 설정
    const selectedMode = difficultySelect.value;
    currentObstacleInterval = GAME_MODES[selectedMode].initialInterval;
    OBSTACLE_SPEED = GAME_MODES[selectedMode].obstacleSpeed;

    lastSpeedIncreaseScore = 0; // 속도 증가 점수도 초기화 (블록 생성 간격용)
    lastObstacleSpeedIncreaseScore = 0; // 장애물 이동 속도 증가 점수도 초기화 (새로 추가)
    isBackgroundWhite = true; // 게임 초기화 시 배경색을 흰색으로 설정
    dinoCanvas.style.backgroundColor = '#ffffff'; // 캔버스 배경색을 흰색으로 설정
    isDinoWhite = false; // 공룡 색상 초기화 (검은색)
    if (obstacleSpawnInterval) {
        clearInterval(obstacleSpawnInterval);
    }
}

// 공룡 그리기
function drawDino() {
    ctx.fillStyle = isDinoWhite ? '#ffffff' : '#333333'; // 공룡 색상 (흰색 또는 검은색)
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
}

// 장애물 그리기
function drawObstacles() {
    ctx.fillStyle = '#ff4d4d'; // 장애물 색상
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// 모든 것 그리기
function draw() {
    ctx.clearRect(0, 0, dinoCanvas.width, dinoCanvas.height); // 캔버스 지우기
    drawDino();
    drawObstacles();
}

// 게임 업데이트 로직
function update() {
    if (!gameActive) return;

    // 공룡 점프 로직
    if (dino.isJumping) {
        dino.y += dino.velocityY;
        dino.velocityY += dino.gravity;

        if (dino.y >= dinoCanvas.height - dino.height) {
            dino.y = dinoCanvas.height - dino.height;
            dino.isJumping = false;
            dino.velocityY = 0;
        }
    }

    // 장애물 이동 및 생성
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= OBSTACLE_SPEED;

        // 장애물이 화면 밖으로 나가면 제거하고 점수 증가
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score++;
            scoreDisplay.textContent = score;

            const selectedMode = difficultySelect.value;

            // 5점마다 블록 생성 속도 증가
            const intervalDecreaseAmount = GAME_MODES[selectedMode].intervalDecrease;
            if (score > 0 && score % 5 === 0 && score !== lastSpeedIncreaseScore) {
                currentObstacleInterval = Math.max(MIN_OBSTACLE_INTERVAL, currentObstacleInterval - intervalDecreaseAmount);
                clearInterval(obstacleSpawnInterval); // 기존 인터벌 중지
                obstacleSpawnInterval = setInterval(spawnObstacle, currentObstacleInterval); // 새 속도로 인터벌 재설정
                lastSpeedIncreaseScore = score; // 속도 증가가 적용된 점수 기록
            }

            // 하드 모드에서 10점마다 장애물 이동 속도 증가
            if (selectedMode === 'hard' && score > 0 && score % 10 === 0 && score !== lastObstacleSpeedIncreaseScore) {
                OBSTACLE_SPEED += 0.1; // 0.1씩 증가
                lastObstacleSpeedIncreaseScore = score; // 속도 증가가 적용된 점수 기록
            }

            // 50점마다 배경색 토글 및 공룡 색상 토글
            if (score > 0 && score % 50 === 0) {
                toggleCanvasBackgroundColor();
                toggleDinoColor();
            }
        }

        // 충돌 감지
        if (
            dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y
        ) {
            endGame(); // 충돌 시 게임 종료
        }
    });

    draw(); // 다시 그리기
    animationFrameId = requestAnimationFrame(update); // 다음 프레임 요청
}

// 장애물 생성 함수
function spawnObstacle() {
    if (!gameActive) return;

    // 랜덤 너비와 높이 생성
    const randomWidth = Math.random() * (MAX_OBSTACLE_DIMENSION - MIN_OBSTACLE_DIMENSION) + MIN_OBSTACLE_DIMENSION;
    const randomHeight = Math.random() * (MAX_OBSTACLE_DIMENSION - MIN_OBSTACLE_DIMENSION) + MIN_OBSTACLE_DIMENSION;

    const x = dinoCanvas.width;
    const y = dinoCanvas.height - randomHeight; // 높이에 따라 y 위치 조정
    obstacles.push({ x, y, width: randomWidth, height: randomHeight });
}

// 캔버스 배경색을 토글하는 함수
function toggleCanvasBackgroundColor() {
    if (isBackgroundWhite) {
        dinoCanvas.style.backgroundColor = '#333333'; // 검은색으로 변경
        isBackgroundWhite = false;
    } else {
        dinoCanvas.style.backgroundColor = '#ffffff'; // 흰색으로 변경
        isBackgroundWhite = true;
    }
}

// 공룡 색상을 토글하는 함수
function toggleDinoColor() {
    isDinoWhite = !isDinoWhite; // 색상 상태 반전
    // drawDino() 함수에서 이 변수를 사용하여 색상을 그립니다.
    // draw() 함수가 매 프레임마다 호출되므로 별도로 그릴 필요는 없습니다.
}

// 게임 시작
function startGame() {
    // 할 일 앱 숨기고 게임 화면 표시
    todoAppContent.style.display = 'none';
    dinoGameContainer.style.display = 'flex';

    initGame(); // 게임 초기화
    gameActive = true;
    animationFrameId = requestAnimationFrame(update); // 게임 루프 시작

    // 장애물 생성 간격 설정 (현재 설정된 간격 사용)
    obstacleSpawnInterval = setInterval(spawnObstacle, currentObstacleInterval);
}

// 게임 종료
function endGame() {
    gameActive = false;
    cancelAnimationFrame(animationFrameId); // 게임 루프 중지
    clearInterval(obstacleSpawnInterval); // 장애물 생성 중지
    gameOverMessage.style.display = 'block'; // 게임 오버 메시지 표시
}

// 할 일 목록으로 돌아가기
function backToTodo() {
    dinoGameContainer.style.display = 'none';
    todoAppContent.style.display = 'flex'; // 할 일 앱 다시 표시
    initGame(); // 게임 상태 초기화 (다음 게임을 위해)
}

// 공룡 점프 이벤트 리스너
document.addEventListener('keydown', (e) => {
    if (gameActive && e.code === 'Space' && !dino.isJumping) {
        dino.isJumping = true;
        dino.velocityY = -10; // 점프 높이
    }
});

// 캔버스 클릭 시 점프 (모바일 터치 대응)
dinoCanvas.addEventListener('click', () => {
    if (gameActive && !dino.isJumping) {
        dino.isJumping = true;
        dino.velocityY = -10;
    }
});

// 게임 시작 버튼 이벤트
startGameBtn.addEventListener('click', startGame);

// 할 일 목록으로 돌아가기 버튼 이벤트
backToTodoBtn.addEventListener('click', backToTodo);

/* --- 미니 공룡 게임 로직 끝 --- */
