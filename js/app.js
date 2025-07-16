/**
 * 메인 애플리케이션 클래스
 * 전체 애플리케이션의 상태와 UI 상호작용을 관리합니다.
 */
class ClassroomLotteryApp {
  constructor() {
    this.storageManager = new StorageManager();
    this.studentManager = new StudentManager(this.storageManager);
    this.seatManager = new SeatManager(this.storageManager);
    this.lotteryEngine = new LotteryEngine();
    this.currentStep = 1;
    this.currentAssignment = null;
    this.showSeatNumbers = true; // 좌석 번호 표시 여부
    
    // DOM 요소 참조
    this.elements = {
      // 입력 방식 선택
      inputMethodRadios: document.querySelectorAll('input[name="input-method"]'),
      nameInputSection: document.getElementById('name-input-section'),
      numberInputSection: document.getElementById('number-input-section'),
      
      // 학생 입력 요소
      studentNameInput: document.getElementById('student-name-input'),
      addStudentBtn: document.getElementById('add-student-btn'),
      studentCountInput: document.getElementById('student-count-input'),
      generateStudentsBtn: document.getElementById('generate-students-btn'),
      
      // 학생 목록 표시
      studentList: document.getElementById('student-list'),
      studentCount: document.getElementById('student-count'),
      nextToSeatsBtn: document.getElementById('next-to-seats-btn'),
      
      // 학생 관리 도구
      sortStudentsBtn: document.getElementById('sort-students-btn'),
      exportStudentsBtn: document.getElementById('export-students-btn'),
      clearAllBtn: document.getElementById('clear-all-btn'),
      
      // 좌석 배치 요소
      rowsInput: document.getElementById('rows-input'),
      colsInput: document.getElementById('cols-input'),
      createLayoutBtn: document.getElementById('create-layout-btn'),
      availableSeats: document.getElementById('available-seats'),
      seatLayout: document.getElementById('seat-layout'),
      seatStudentComparison: document.getElementById('seat-student-comparison'),
      activateAllBtn: document.getElementById('activate-all-btn'),
      deactivateAllBtn: document.getElementById('deactivate-all-btn'),
      
      nextToLotteryBtn: document.getElementById('next-to-lottery-btn'),
      backToStudentsBtn: document.getElementById('back-to-students-btn'),

      // 자리 뽑기 요소
      lotterySection: document.getElementById('lottery-section'),
      startLotteryBtn: document.getElementById('start-lottery-btn'),
      restartLotteryBtn: document.getElementById('restart-lottery-btn'),
      assignmentResult: document.getElementById('assignment-result'),
      resultPlaceholder: document.getElementById('result-placeholder'),
      resultDisplay: document.getElementById('result-display'),
      resultActions: document.getElementById('result-actions'),
      backToSeatsBtn: document.getElementById('back-to-seats-btn'),
      newAssignmentBtn: document.getElementById('new-assignment-btn'),
      
      // 오류 모달
      errorModal: document.getElementById('error-modal'),
      errorMessage: document.getElementById('error-message'),
      closeModalBtns: document.querySelectorAll('.close-modal'),
      historyModal: document.getElementById('history-modal'),
      
      // 결과 관리 버튼
      saveResultBtn: document.getElementById('save-result-btn'),
      exportResultBtn: document.getElementById('export-result-btn'),
      viewHistoryBtn: document.getElementById('view-history-btn'),
      printResultBtn: document.getElementById('print-result-btn'),
    };
    
    this.init();
  }

  /**
   * 애플리케이션 초기화
   */
  init() {
    this.bindEvents();
    this.updateStudentDisplay();
    this.updateNextButton();
    this.updateSeatLayoutDisplay();
    this.updateSeatInfo();
  }

  /**
   * 이벤트 리스너 바인딩
   */
  bindEvents() {
    // 입력 방식 선택 이벤트
    if (this.elements.inputMethodRadios) {
      this.elements.inputMethodRadios.forEach(radio => {
        radio.addEventListener('change', (e) => this.handleInputMethodChange(e));
      });
    }

    // 학생 추가 이벤트
    if (this.elements.addStudentBtn) {
      this.elements.addStudentBtn.addEventListener('click', () => this.handleAddStudent());
    }
    if (this.elements.studentNameInput) {
      this.elements.studentNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleAddStudent();
        }
      });
    }

    // 번호 기반 학생 생성 이벤트
    if (this.elements.generateStudentsBtn) {
      this.elements.generateStudentsBtn.addEventListener('click', () => this.handleGenerateStudents());
    }
    if (this.elements.studentCountInput) {
      this.elements.studentCountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleGenerateStudents();
        }
      });
    }

    // 모달 닫기 이벤트
    if (this.elements.closeModalBtns) {
      this.elements.closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.hideErrorModal();
          this.hideHistoryModal();
        });
      });
    }

    // 모달 배경 클릭으로 닫기
    if (this.elements.errorModal) {
      this.elements.errorModal.addEventListener('click', (e) => {
        if (e.target === this.elements.errorModal) {
          this.hideErrorModal();
        }
      });
    }
    if (this.elements.historyModal) {
      this.elements.historyModal.addEventListener('click', (e) => {
        if (e.target === this.elements.historyModal) {
          this.hideHistoryModal();
        }
      });
    }

    // 학생 관리 도구 이벤트
    if (this.elements.sortStudentsBtn) {
      this.elements.sortStudentsBtn.addEventListener('click', () => this.handleSortStudents());
    }
    if (this.elements.exportStudentsBtn) {
      this.elements.exportStudentsBtn.addEventListener('click', () => this.exportStudentList());
    }
    if (this.elements.clearAllBtn) {
      this.elements.clearAllBtn.addEventListener('click', () => this.clearAllStudents());
    }

    // 좌석 배치 이벤트
    if (this.elements.createLayoutBtn) {
      this.elements.createLayoutBtn.addEventListener('click', () => this.handleCreateLayout());
    }
    if (this.elements.rowsInput) {
      this.elements.rowsInput.addEventListener('input', () => this.validateLayoutInputs());
    }
    if (this.elements.colsInput) {
      this.elements.colsInput.addEventListener('input', () => this.validateLayoutInputs());
    }
    if (this.elements.rowsInput) {
      this.elements.rowsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleCreateLayout();
        }
      });
    }
    if (this.elements.colsInput) {
      this.elements.colsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleCreateLayout();
        }
      });
    }
    
    // 좌석 제어 버튼 이벤트
    if (this.elements.activateAllBtn) {
      this.elements.activateAllBtn.addEventListener('click', () => this.handleActivateAllSeats());
    }
    if (this.elements.deactivateAllBtn) {
      this.elements.deactivateAllBtn.addEventListener('click', () => this.handleDeactivateAllSeats());
    }
    

    // 네비게이션 버튼 이벤트
    if (this.elements.nextToSeatsBtn) {
      this.elements.nextToSeatsBtn.addEventListener('click', () => this.goToStep(2));
    }
    if (this.elements.nextToLotteryBtn) {
      this.elements.nextToLotteryBtn.addEventListener('click', () => this.goToStep(3));
    }
    if (this.elements.backToStudentsBtn) {
      this.elements.backToStudentsBtn.addEventListener('click', () => this.goToStep(1));
    }
    if (this.elements.backToSeatsBtn) {
      this.elements.backToSeatsBtn.addEventListener('click', () => this.goToStep(2));
    }

    // 자리 뽑기 이벤트
    if (this.elements.startLotteryBtn) {
      this.elements.startLotteryBtn.addEventListener('click', () => this.handleStartLottery());
    }
    if (this.elements.restartLotteryBtn) {
      this.elements.restartLotteryBtn.addEventListener('click', () => this.handleStartLottery());
    }

    // 결과 관리 이벤트
    if (this.elements.saveResultBtn) {
      this.elements.saveResultBtn.addEventListener('click', () => this.handleSaveResult());
    }
    if (this.elements.exportResultBtn) {
      this.elements.exportResultBtn.addEventListener('click', () => this.handleExportResult());
    }
    if (this.elements.viewHistoryBtn) {
      this.elements.viewHistoryBtn.addEventListener('click', () => this.handleViewHistory());
    }
    if (this.elements.printResultBtn) {
      this.elements.printResultBtn.addEventListener('click', () => this.handlePrintResult());
    }
  }

  /**
   * 입력 방식 변경 처리
   * @param {Event} event - 변경 이벤트
   */
  handleInputMethodChange(event) {
    const selectedMethod = event.target.value;
    const currentStudentCount = this.studentManager.getStudentCount();
    
    // 기존 학생이 있는 경우 방식 변경에 대한 확인 요청
    if (currentStudentCount > 0) {
      const currentStudents = this.studentManager.getStudents();
      const hasNameBased = currentStudents.some(s => !s.isNumberBased);
      const hasNumberBased = currentStudents.some(s => s.isNumberBased);
      
      let warningMessage = '';
      if (selectedMethod === 'name' && hasNumberBased) {
        warningMessage = '현재 번호로 생성된 학생들이 있습니다.\n이름 입력 방식으로 변경하시겠습니까?\n\n혼재된 방식보다는 하나의 방식으로 통일하는 것을 권장합니다.';
      } else if (selectedMethod === 'number' && hasNameBased) {
        warningMessage = '현재 이름으로 입력된 학생들이 있습니다.\n번호 생성 방식으로 변경하시겠습니까?\n\n혼재된 방식보다는 하나의 방식으로 통일하는 것을 권장합니다.';
      }
      
      if (warningMessage && !confirm(warningMessage)) {
        // 사용자가 취소한 경우 이전 선택으로 되돌리기
        const previousMethod = selectedMethod === 'name' ? 'number' : 'name';
        const previousRadio = document.querySelector(`input[name="input-method"][value="${previousMethod}"]`);
        if (previousRadio) {
          previousRadio.checked = true;
        }
        return;
      }
    }
    
    // 입력 방식에 따라 UI 전환
    if (selectedMethod === 'name') {
      this.elements.nameInputSection.classList.remove('hidden');
      this.elements.numberInputSection.classList.add('hidden');
      this.elements.studentNameInput.focus();
      this.showInputMethodInfo('이름 입력 방식이 선택되었습니다. 학생 이름을 직접 입력하여 추가하세요.');
    } else if (selectedMethod === 'number') {
      this.elements.nameInputSection.classList.add('hidden');
      this.elements.numberInputSection.classList.remove('hidden');
      this.elements.studentCountInput.focus();
      this.showInputMethodInfo('번호 생성 방식이 선택되었습니다. 생성할 학생 수를 입력하세요.');
    }
  }

  /**
   * 학생 추가 처리
   */
  handleAddStudent() {
    const name = this.elements.studentNameInput.value.trim();
    
    if (!name) {
      this.showError('학생 이름을 입력해주세요.');
      return;
    }

    const result = this.studentManager.addStudent(name);
    
    if (result.success) {
      this.elements.studentNameInput.value = '';
      this.elements.studentNameInput.focus();
      this.updateStudentDisplay();
      this.updateNextButton();
      this.updateSeatInfo();
      this.updateNextToLotteryButton();
      this.showSuccess(`${result.student.name} 학생이 추가되었습니다.`);
    } else {
      this.showError(result.error);
    }
  }

  /**
   * 번호 기반 학생 생성 처리
   */
  handleGenerateStudents() {
    const count = parseInt(this.elements.studentCountInput.value);
    
    if (!count || count <= 0) {
      this.showError('올바른 학생 수를 입력해주세요.');
      return;
    }

    if (count > 50) {
      this.showError('한 번에 최대 50명까지만 생성할 수 있습니다.');
      return;
    }

    const result = this.studentManager.generateStudentsByNumber(count);
    
    if (result.success) {
      this.elements.studentCountInput.value = '';
      this.updateStudentDisplay();
      this.updateNextButton();
      this.updateSeatInfo();
      this.updateNextToLotteryButton();
      this.showSuccess(`${result.students.length}명의 학생이 생성되었습니다.`);
    } else {
      this.showError(result.error);
    }
  }

  /**
   * 학생 삭제 처리
   * @param {string} studentId - 삭제할 학생 ID
   */
  handleRemoveStudent(studentId) {
    const student = this.studentManager.getStudent(studentId);
    if (!student) {
      this.showError('학생을 찾을 수 없습니다.');
      return;
    }

    if (confirm(`${student.name} 학생을 삭제하시겠습니까?`)) {
      const result = this.studentManager.removeStudent(studentId);
      
      if (result.success) {
        this.updateStudentDisplay();
        this.updateNextButton();
        this.updateSeatInfo();
        this.updateNextToLotteryButton();
        this.showSuccess(`${student.name} 학생이 삭제되었습니다.`);
      } else {
        this.showError(result.error);
      }
    }
  }

  /**
   * 학생 이름 수정 처리
   * @param {string} studentId - 수정할 학생 ID
   */
  handleEditStudent(studentId) {
    const student = this.studentManager.getStudent(studentId);
    if (!student) {
      this.showError('학생을 찾을 수 없습니다.');
      return;
    }

    const newName = prompt(`학생 이름을 수정하세요:`, student.name);
    if (newName === null) {
      return; // 취소
    }

    if (!newName.trim()) {
      this.showError('학생 이름을 입력해주세요.');
      return;
    }

    const result = this.studentManager.updateStudent(studentId, newName.trim());
    
    if (result.success) {
      this.updateStudentDisplay();
      this.showSuccess(`학생 이름이 ${result.student.name}으로 수정되었습니다.`);
    } else {
      this.showError(result.error);
    }
  }

  /**
   * 학생 목록 표시 업데이트
   */
  updateStudentDisplay() {
    const students = this.studentManager.getStudents();
    const studentCount = students.length;
    
    // 학생 수 표시 업데이트
    this.elements.studentCount.textContent = studentCount;
    
    // 학생 목록 초기화
    this.elements.studentList.innerHTML = '';
    
    if (studentCount === 0) {
      const emptyMessage = document.createElement('li');
      emptyMessage.className = 'student-item empty-message';
      emptyMessage.innerHTML = '<span class="text-secondary">등록된 학생이 없습니다.</span>';
      this.elements.studentList.appendChild(emptyMessage);
      return;
    }

    // 학생 목록 생성
    students.forEach((student, index) => {
      const listItem = this.createStudentListItem(student, index + 1);
      this.elements.studentList.appendChild(listItem);
    });
  }

  /**
   * 학생 목록 아이템 생성
   * @param {Student} student - 학생 객체
   * @param {number} index - 순서 번호
   * @returns {HTMLElement} 학생 목록 아이템 요소
   */
  createStudentListItem(student, index) {
    const listItem = document.createElement('li');
    listItem.className = 'student-item';
    listItem.dataset.studentId = student.id;

    const studentInfo = document.createElement('div');
    studentInfo.className = 'student-info';
    
    const studentNumber = document.createElement('span');
    studentNumber.className = 'student-number';
    studentNumber.textContent = `${index}.`;
    
    const studentName = document.createElement('span');
    studentName.className = 'student-name';
    studentName.textContent = student.name;
    
    const studentType = document.createElement('span');
    studentType.className = 'student-type';
    studentType.textContent = student.isNumberBased ? '[번호]' : '[이름]';
    
    studentInfo.appendChild(studentNumber);
    studentInfo.appendChild(studentName);
    studentInfo.appendChild(studentType);

    const studentActions = document.createElement('div');
    studentActions.className = 'student-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-small btn-secondary';
    editBtn.textContent = '수정';
    editBtn.addEventListener('click', () => this.handleEditStudent(student.id));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-small text-error';
    deleteBtn.textContent = '삭제';
    deleteBtn.style.background = 'transparent';
    deleteBtn.style.border = '1px solid var(--error-color)';
    deleteBtn.style.color = 'var(--error-color)';
    deleteBtn.addEventListener('click', () => this.handleRemoveStudent(student.id));
    
    studentActions.appendChild(editBtn);
    studentActions.appendChild(deleteBtn);

    listItem.appendChild(studentInfo);
    listItem.appendChild(studentActions);

    return listItem;
  }

  /**
   * 다음 단계 버튼 상태 업데이트
   */
  updateNextButton() {
    const studentCount = this.studentManager.getStudentCount();
    this.elements.nextToSeatsBtn.disabled = studentCount === 0;
    
    if (studentCount > 0) {
      this.elements.nextToSeatsBtn.textContent = `다음: 좌석 배치 (${studentCount}명)`;
    } else {
      this.elements.nextToSeatsBtn.textContent = '다음: 좌석 배치';
    }
  }

  /**
   * 오류 메시지 표시
   * @param {string} message - 오류 메시지
   */
  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorModal.classList.remove('hidden');
  }

  /**
   * 성공 메시지 표시 (간단한 알림)
   * @param {string} message - 성공 메시지
   */
  showSuccess(message) {
    // 간단한 성공 알림 (추후 토스트 메시지로 개선 가능)
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--success-color);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-lg);
      z-index: 1001;
      animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    // 3초 후 자동 제거
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  /**
   * 오류 모달 숨기기
   */
  hideErrorModal() {
    this.elements.errorModal.classList.add('hidden');
  }

  /**
   * 입력 방식 정보 표시
   * @param {string} message - 정보 메시지
   */
  showInputMethodInfo(message) {
    // 간단한 정보 알림
    const notification = document.createElement('div');
    notification.className = 'info-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--primary-color);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-lg);
      z-index: 1001;
      animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    // 2초 후 자동 제거
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }

  /**
   * 정렬 버튼 클릭 처리
   */
  handleSortStudents() {
    const studentCount = this.studentManager.getStudentCount();
    
    if (studentCount === 0) {
      this.showError('정렬할 학생이 없습니다.');
      return;
    }

    // 정렬 옵션 선택 모달 표시
    this.showSortOptionsModal();
  }

  /**
   * 정렬 옵션 모달 표시
   */
  showSortOptionsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h3>정렬 방식 선택</h3>
        <div style="margin: 1.5rem 0;">
          <button id="sort-by-name" class="btn-primary" style="width: 100%; margin-bottom: 0.5rem;">이름순 정렬</button>
          <button id="sort-by-type" class="btn-secondary" style="width: 100%;">번호 우선 정렬</button>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          • 이름순 정렬: 모든 학생을 이름 순서로 정렬<br>
          • 번호 우선 정렬: 번호 학생을 먼저, 그 다음 이름 학생을 정렬
        </p>
      </div>
    `;

    document.body.appendChild(modal);

    // 이벤트 리스너
    const closeBtn = modal.querySelector('.close-modal');
    const sortByNameBtn = modal.querySelector('#sort-by-name');
    const sortByTypeBtn = modal.querySelector('#sort-by-type');

    const closeModal = () => {
      document.body.removeChild(modal);
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    sortByNameBtn.addEventListener('click', () => {
      this.sortStudents('name');
      closeModal();
    });

    sortByTypeBtn.addEventListener('click', () => {
      this.sortStudents('number');
      closeModal();
    });
  }

  /**
   * 학생 목록 정렬
   * @param {string} sortType - 정렬 타입 ('name', 'number')
   */
  sortStudents(sortType = 'name') {
    let result;
    
    if (sortType === 'number') {
      result = this.studentManager.sortNumberBasedStudents();
    } else {
      result = this.studentManager.sortStudentsByName();
    }

    if (result.success) {
      this.updateStudentDisplay();
      this.showSuccess('학생 목록이 정렬되었습니다.');
    } else {
      this.showError(result.error);
    }
  }

  /**
   * 모든 학생 삭제
   */
  clearAllStudents() {
    const studentCount = this.studentManager.getStudentCount();
    
    if (studentCount === 0) {
      this.showError('삭제할 학생이 없습니다.');
      return;
    }

    if (confirm(`모든 학생(${studentCount}명)을 삭제하시겠습니까?`)) {
      const result = this.studentManager.clearAllStudents();
      
      if (result.success) {
        this.updateStudentDisplay();
        this.updateNextButton();
        this.updateSeatInfo();
        this.updateNextToLotteryButton();
        this.showSuccess('모든 학생이 삭제되었습니다.');
      } else {
        this.showError(result.error);
      }
    }
  }

  /**
   * 학생 목록 내보내기
   */
  exportStudentList() {
    const studentCount = this.studentManager.getStudentCount();
    
    if (studentCount === 0) {
      this.showError('내보낼 학생이 없습니다.');
      return;
    }

    const textData = this.studentManager.exportToText();
    
    // 클립보드에 복사
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textData).then(() => {
        this.showSuccess('학생 목록이 클립보드에 복사되었습니다.');
      }).catch(() => {
        this.showTextInModal(textData);
      });
    } else {
      this.showTextInModal(textData);
    }
  }

  /**
   * 텍스트를 모달로 표시
   * @param {string} text - 표시할 텍스트
   */
  showTextInModal(text, title = '학생 목록') {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h3>${title}</h3>
        <textarea readonly style="width: 100%; height: 300px; margin-top: 1rem; padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--border-radius);">${text}</textarea>
        <p style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem;">위 내용을 복사하여 사용하세요.</p>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.close-modal');
    const closeModal = () => document.body.removeChild(modal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    const textarea = modal.querySelector('textarea');
    textarea.focus();
    textarea.select();
  }

  /**
   * 좌석 배치 생성 처리
   */
  handleCreateLayout() {
    const rows = parseInt(this.elements.rowsInput.value);
    const cols = parseInt(this.elements.colsInput.value);
    
    if (!rows || !cols || rows <= 0 || cols <= 0) {
      this.showError('올바른 행과 열 수를 입력해주세요.');
      return;
    }

    if (rows > 10 || cols > 10) {
      this.showError('행과 열은 각각 최대 10까지 입력할 수 있습니다.');
      return;
    }

    const result = this.seatManager.createLayout(rows, cols);
    
    if (result.success) {
      this.updateSeatLayoutDisplay();
      this.updateSeatInfo();
      this.updateNextToLotteryButton();
      this.showSuccess(`${rows}행 ${cols}열 좌석 배치가 생성되었습니다.`);
    } else {
      this.showError(result.error);
    }
  }

  /**
   * 좌석 배치 입력 검증
   */
  validateLayoutInputs() {
    const rows = parseInt(this.elements.rowsInput.value);
    const cols = parseInt(this.elements.colsInput.value);
    
    const isValid = rows > 0 && cols > 0 && rows <= 10 && cols <= 10;
    this.elements.createLayoutBtn.disabled = !isValid;
    
    if (isValid) {
      const totalSeats = rows * cols;
      this.elements.createLayoutBtn.textContent = `배치 생성 (${totalSeats}개 좌석)`;
    } else {
      this.elements.createLayoutBtn.textContent = '배치 생성';
    }
  }

  /**
   * 좌석 배치 시각적 표시 업데이트
   */
  updateSeatLayoutDisplay() {
    const layout = this.seatManager.getSeatLayout();
    const dimensions = this.seatManager.getDimensions();
    
    // 좌석 배치 컨테이너 초기화
    this.elements.seatLayout.innerHTML = '';
    
    if (!this.seatManager.hasLayout()) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-layout-message';
      emptyMessage.innerHTML = `
        <p style="text-align: center; color: var(--text-secondary); padding: 2rem;">
          좌석 배치를 생성해주세요.<br>
          <small>행과 열 수를 입력한 후 '배치 생성' 버튼을 클릭하세요.</small>
        </p>
      `;
      this.elements.seatLayout.appendChild(emptyMessage);
      return;
    }

    // CSS Grid 설정
    this.elements.seatLayout.style.gridTemplateColumns = `repeat(${dimensions.cols}, 1fr)`;
    this.elements.seatLayout.style.gridTemplateRows = `repeat(${dimensions.rows}, 1fr)`;
    
    // 교실 앞쪽 표시
    const frontLabel = document.createElement('div');
    frontLabel.className = 'classroom-front';
    frontLabel.innerHTML = '칠판 / 교탁 (앞쪽)';
    frontLabel.style.cssText = `
      grid-column: 1 / ${dimensions.cols + 1};
      text-align: center;
      padding: 0.5rem;
      margin-bottom: 1rem;
      background: var(--border-color);
      border-radius: var(--border-radius);
      font-weight: 500;
      color: var(--text-secondary);
    `;
    this.elements.seatLayout.appendChild(frontLabel);

    // 좌석 생성
    for (let row = 0; row < dimensions.rows; row++) {
      for (let col = 0; col < dimensions.cols; col++) {
        const seat = layout[row][col];
        const seatElement = this.createSeatElement(seat, row, col);
        seatElement.style.gridColumn = col + 1;
        seatElement.style.gridRow = row + 2;
        this.elements.seatLayout.appendChild(seatElement);
      }
    }
    
    // 학생 수와 좌석 수 비교 표시 업데이트
    this.updateSeatInfo();
  }

  /**
   * 좌석 요소 생성
   * @param {Seat} seat - 좌석 객체
   * @param {number} row - 행 번호
   * @param {number} col - 열 번호
   * @returns {HTMLElement} 좌석 요소
   */
  createSeatElement(seat, row, col) {
    const seatElement = document.createElement('div');
    seatElement.className = 'seat';
    seatElement.dataset.row = row;
    seatElement.dataset.col = col;
    
    // 좌석 번호 표시 (1부터 시작)
    const seatNumber = `${row + 1}-${col + 1}`;
    
    // 좌석 상태에 따른 클래스 설정
    if (seat.isActive) {
      seatElement.classList.add('active');
      seatElement.title = `좌석 ${seatNumber} (활성화됨) - 클릭하여 비활성화`;
      
      // 좌석 번호 또는 빈 내용 표시 (항상 표시)
      if (seat.isEmpty()) {
        seatElement.textContent = seatNumber;
      }
    } else {
      seatElement.classList.add('inactive');
      seatElement.title = `좌석 ${seatNumber} (비활성화됨) - 클릭하여 활성화`;
      seatElement.textContent = '';
    }

    // 학생이 배정된 경우
    if (!seat.isEmpty()) {
      seatElement.classList.add('assigned');
      seatElement.textContent = seat.student.name;
      seatElement.title = `좌석 ${seatNumber} - ${seat.student.name}`;
    }

    // 클릭 이벤트 추가
    seatElement.addEventListener('click', () => this.handleSeatClick(row, col));

    return seatElement;
  }

  /**
   * 좌석 클릭 처리
   * @param {number} row - 행 번호
   * @param {number} col - 열 번호
   */
  handleSeatClick(row, col) {
    const result = this.seatManager.toggleSeat(row, col);
    
    if (result.success) {
      this.updateSeatLayoutDisplay();
      this.updateSeatInfo();
      this.updateNextToLotteryButton();
      
      const seatNumber = `${row + 1}-${col + 1}`;
      const status = result.seat.isActive ? '활성화' : '비활성화';
      this.showSuccess(`좌석 ${seatNumber}이 ${status}되었습니다.`);
    } else {
      this.showError(result.error);
    }
  }

  /**
   * 좌석 정보 업데이트
   */
  updateSeatInfo() {
    const availableCount = this.seatManager.getAvailableSeatCount();
    const studentCount = this.studentManager.getStudentCount();
    
    this.elements.availableSeats.textContent = availableCount;
    
    // 좌석 수와 학생 수 비교 표시
    const comparisonElement = this.elements.seatStudentComparison;

    if (!comparisonElement) return;
    
    if (studentCount === 0) {
      comparisonElement.innerHTML = '<span style="color: var(--text-secondary);">학생을 먼저 등록해주세요.</span>';
    } else if (availableCount === 0) {
      comparisonElement.innerHTML = '<span style="color: var(--error-color);">⚠️ 활성화된 좌석이 없습니다.</span>';
    } else if (availableCount < studentCount) {
      const shortage = studentCount - availableCount;
      comparisonElement.innerHTML = `<span style="color: var(--error-color);">⚠️ 좌석이 ${shortage}개 부족합니다. (학생 ${studentCount}명)</span>`;
    } else if (availableCount === studentCount) {
      comparisonElement.innerHTML = `<span style="color: var(--success-color);">✓ 좌석과 학생 수가 일치합니다. (${studentCount}명)</span>`;
    } else {
      const surplus = availableCount - studentCount;
      comparisonElement.innerHTML = `<span style="color: var(--primary-color);">✓ 좌석이 ${surplus}개 여유있습니다. (학생 ${studentCount}명)</span>`;
    }
    
    // 좌석 제어 버튼 상태 업데이트
    if (this.elements.activateAllBtn) {
      this.elements.activateAllBtn.disabled = !this.seatManager.hasLayout();
    }
    if (this.elements.deactivateAllBtn) {
      this.elements.deactivateAllBtn.disabled = !this.seatManager.hasLayout();
    }
    
  }

  /**
   * 다음 단계(자리 뽑기) 버튼 상태 업데이트
   */
  updateNextToLotteryButton() {
    const studentCount = this.studentManager.getStudentCount();
    const availableSeats = this.seatManager.getAvailableSeatCount();
    const hasLayout = this.seatManager.hasLayout();
    
    const canProceed = studentCount > 0 && hasLayout && availableSeats >= studentCount;
    
    if (this.elements.nextToLotteryBtn) {
      this.elements.nextToLotteryBtn.disabled = !canProceed;
      
      if (canProceed) {
        this.elements.nextToLotteryBtn.textContent = `다음: 자리 뽑기 (${studentCount}명)`;
      } else if (studentCount === 0) {
        this.elements.nextToLotteryBtn.textContent = '다음: 자리 뽑기 (학생 없음)';
      } else if (!hasLayout) {
        this.elements.nextToLotteryBtn.textContent = '다음: 자리 뽑기 (좌석 배치 필요)';
      } else if (availableSeats < studentCount) {
        this.elements.nextToLotteryBtn.textContent = '다음: 자리 뽑기 (좌석 부족)';
      } else {
        this.elements.nextToLotteryBtn.textContent = '다음: 자리 뽑기';
      }
    }
  }

  /**
   * 단계 이동
   * @param {number} step - 이동할 단계 번호
   */
  goToStep(step) {
    // 단계 검증
    if (step === 2 && this.studentManager.getStudentCount() === 0) {
      this.showError('학생을 먼저 등록해주세요.');
      return;
    }
    
    if (step === 3) {
      const studentCount = this.studentManager.getStudentCount();
      const availableSeats = this.seatManager.getAvailableSeatCount();
      const hasLayout = this.seatManager.hasLayout();
      
      if (studentCount === 0) {
        this.showError('학생을 먼저 등록해주세요.');
        return;
      }
      
      if (!hasLayout) {
        this.showError('좌석 배치를 먼저 생성해주세요.');
        return;
      }
      
      if (availableSeats < studentCount) {
        this.showError('활성화된 좌석이 학생 수보다 적습니다.');
        return;
      }
    }

    // 현재 단계 업데이트
    this.currentStep = step;
    
    // 단계 표시기 업데이트
    this.updateStepIndicator();
    
    // 섹션 표시/숨김
    this.updateSectionVisibility();
    
    // 단계별 초기화
    if (step === 2) {
      this.updateSeatInfo();
      this.updateNextToLotteryButton();
    } else if (step === 3) {
      this.elements.resultPlaceholder.classList.remove('hidden');
      this.elements.resultDisplay.classList.add('hidden');
      this.elements.startLotteryBtn.classList.remove('hidden');
      this.elements.restartLotteryBtn.classList.add('hidden');
      this.elements.resultActions.classList.add('hidden');
      this.elements.newAssignmentBtn.classList.add('hidden');
    }
  }

  /**
   * 단계 표시기 업데이트
   */
  updateStepIndicator() {
    const steps = document.querySelectorAll('.step');
    
    steps.forEach((stepElement, index) => {
      const stepNumber = index + 1;
      stepElement.classList.remove('active', 'completed');
      
      if (stepNumber < this.currentStep) {
        stepElement.classList.add('completed');
      } else if (stepNumber === this.currentStep) {
        stepElement.classList.add('active');
      }
    });
  }

  /**
   * 섹션 표시/숨김 업데이트
   */
  updateSectionVisibility() {
    const sections = document.querySelectorAll('.content-section');
    
    sections.forEach((section, index) => {
      const sectionNumber = index + 1;
      section.classList.remove('active');
      
      if (sectionNumber === this.currentStep) {
        section.classList.add('active');
      }
    });
  }

  /**
   * 자리 뽑기 시작 처리
   */
  handleStartLottery() {
    const students = this.studentManager.getStudents();
    const seatLayout = this.seatManager.getSeatLayout();

    const result = this.lotteryEngine.performLottery(students, seatLayout);

    if (result.success) {
      this.currentAssignment = result.assignment;
      this.storageManager.saveAssignment(this.currentAssignment);
      this.displayAssignmentResult(this.currentAssignment);
      this.showSuccess('자리 배정이 완료되었으며, 결과가 자동으로 저장되었습니다.');
      this.elements.startLotteryBtn.classList.add('hidden');
      this.elements.restartLotteryBtn.classList.remove('hidden');
      this.elements.resultActions.classList.remove('hidden');
      this.elements.newAssignmentBtn.classList.remove('hidden');
    } else {
      this.showError(result.error);
    }
  }

  /**
   * 배정 결과를 화면에 표시
   * @param {Assignment} assignment - 배정 결과 객체
   */
  displayAssignmentResult(assignment) {
    this.elements.resultPlaceholder.classList.add('hidden');
    this.elements.resultDisplay.classList.remove('hidden');
    this.elements.resultDisplay.innerHTML = '';
    
    // 결과 헤더 추가
    const resultHeader = document.createElement('div');
    resultHeader.className = 'result-header';
    resultHeader.innerHTML = `
      <h3>자리 배정 결과</h3>
      <p class="result-timestamp">배정 시간: ${new Date(assignment.timestamp).toLocaleString()}</p>
    `;
    this.elements.resultDisplay.appendChild(resultHeader);
    
    // 좌석 배치 컨테이너 생성
    const seatLayoutContainer = document.createElement('div');
    seatLayoutContainer.className = 'result-seat-layout';
    
    // 좌석 배치 그리드 스타일 설정
    const seatLayout = assignment.seatLayout;
    const dimensions = { rows: seatLayout.length, cols: seatLayout[0].length };
    seatLayoutContainer.style.gridTemplateColumns = `repeat(${dimensions.cols}, 1fr)`;
    
    // 좌석 요소 생성
    for (let row = 0; row < dimensions.rows; row++) {
      for (let col = 0; col < dimensions.cols; col++) {
        const seat = seatLayout[row][col];
        const seatElement = document.createElement('div');
        seatElement.className = 'result-seat';
        seatElement.dataset.row = row;
        seatElement.dataset.col = col;
        
        // 좌석 상태에 따른 클래스 및 내용 설정
        if (!seat.isActive) {
          seatElement.classList.add('inactive');
          seatElement.innerHTML = `<span class="seat-label">X</span>`;
          seatElement.title = `비활성화된 좌석 (${row + 1}행 ${col + 1}열)`;
        } else if (seat.student) {
          seatElement.classList.add('assigned');
          seatElement.innerHTML = `
            <span class="seat-position">${row + 1}-${col + 1}</span>
            <span class="student-name">${seat.student.name}</span>
          `;
          seatElement.title = `${seat.student.name} (${row + 1}행 ${col + 1}열)`;
        } else {
          seatElement.classList.add('empty');
          seatElement.innerHTML = `<span class="seat-position">${row + 1}-${col + 1}</span>`;
          seatElement.title = `빈 좌석 (${row + 1}행 ${col + 1}열)`;
        }
        
        seatLayoutContainer.appendChild(seatElement);
      }
    }
    
    this.elements.resultDisplay.appendChild(seatLayoutContainer);
    
    // 배정 통계 정보 추가
    const stats = assignment.getStatistics();
    const statsContainer = document.createElement('div');
    statsContainer.className = 'result-stats';
    statsContainer.innerHTML = `
      <div class="stats-item">
        <span class="stats-label">총 학생 수:</span>
        <span class="stats-value">${stats.totalStudents}명</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">배정된 좌석:</span>
        <span class="stats-value">${stats.assignedSeats}개</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">배정률:</span>
        <span class="stats-value">${stats.assignmentRate}%</span>
      </div>
    `;
    
    this.elements.resultDisplay.appendChild(statsContainer);
    
    // 피드백 메시지 추가
    const feedbackContainer = document.createElement('div');
    feedbackContainer.className = 'result-feedback';
    
    if (stats.assignmentRate === 100) {
      feedbackContainer.innerHTML = `
        <div class="feedback-success">
          <span class="feedback-icon">✓</span>
          <span class="feedback-message">모든 학생이 성공적으로 배정되었습니다!</span>
        </div>
      `;
    } else {
      feedbackContainer.innerHTML = `
        <div class="feedback-warning">
          <span class="feedback-icon">⚠️</span>
          <span class="feedback-message">일부 학생이 배정되지 않았습니다. 좌석 배치를 확인해주세요.</span>
        </div>
      `;
    }
    
    this.elements.resultDisplay.appendChild(feedbackContainer);
  }

  /**
   * 결과 저장 처리
   */
  handleSaveResult() {
    if (!this.currentAssignment) {
      this.showError('저장할 배정 결과가 없습니다.');
      return;
    }

    try {
      this.storageManager.saveAssignment(this.currentAssignment);
      this.showSuccess('현재 배정 결과가 저장되었습니다.');
    } catch (error) {
      this.showError(error.message);
    }
  }

  /**
   * 결과 내보내기 처리
   */
  handleExportResult() {
    if (!this.currentAssignment) {
      this.showError('내보낼 배정 결과가 없습니다.');
      return;
    }

    const textData = this.currentAssignment.toText();
    
    // 클립보드에 복사 시도
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textData)
        .then(() => {
          this.showSuccess('배정 결과가 클립보드에 복사되었습니다.');
          this.showTextInModal(textData, '배정 결과 (클립보드에 복사됨)');
        })
        .catch(() => {
          // 클립보드 복사 실패 시 모달로만 표시
          this.showTextInModal(textData, '배정 결과');
        });
    } else {
      // 클립보드 API를 지원하지 않는 경우 모달로만 표시
      this.showTextInModal(textData, '배정 결과');
    }
  }

  /**
   * 이전 기록 보기 처리
   */
  handleViewHistory() {
    const history = this.storageManager.getAssignmentHistory();

    if (history.length === 0) {
      this.showError('저장된 배정 기록이 없습니다.');
      return;
    }

    this.showHistoryModal(history);
  }

  /**
   * 인쇄 처리
   */
  handlePrintResult() {
    if (!this.currentAssignment) {
      this.showError('인쇄할 배정 결과가 없습니다.');
      return;
    }
    
    // 인쇄 전용 요소 생성
    this.preparePrintView();
    
    // 인쇄 다이얼로그 표시
    window.print();
  }
  
  /**
   * 인쇄 뷰 준비
   */
  preparePrintView() {
    // 기존 인쇄 뷰 제거
    const existingPrintView = document.getElementById('print-view');
    if (existingPrintView) {
      existingPrintView.remove();
    }
    
    // 인쇄 뷰 생성
    const printView = document.createElement('div');
    printView.id = 'print-view';
    printView.className = 'print-only';
    printView.style.display = 'none';
    
    // 제목 및 날짜 정보
    const header = document.createElement('div');
    header.className = 'print-header';
    
    const timestamp = new Date(this.currentAssignment.timestamp);
    const formattedDate = timestamp.toLocaleDateString();
    const formattedTime = timestamp.toLocaleTimeString();
    
    header.innerHTML = `
      <h1>학급 자리 배정 결과</h1>
      <p>배정 일시: ${formattedDate} ${formattedTime}</p>
    `;
    
    // 좌석 배치 시각화
    const seatLayout = document.createElement('div');
    seatLayout.className = 'seat-layout-print';
    
    // 좌석 배치 그리드 스타일 설정
    const dimensions = this.seatManager.getDimensions();
    seatLayout.style.gridTemplateColumns = `repeat(${dimensions.cols}, 1fr)`;
    seatLayout.style.gridTemplateRows = `repeat(${dimensions.rows}, 1fr)`;
    
    // 좌석 요소 생성
    for (let row = 0; row < dimensions.rows; row++) {
      for (let col = 0; col < dimensions.cols; col++) {
        const seat = this.currentAssignment.seatLayout[row][col];
        const seatElement = document.createElement('div');
        seatElement.className = 'seat-print';
        
        // 좌석 상태에 따른 클래스 설정
        if (!seat.isActive) {
          seatElement.classList.add('inactive');
          seatElement.textContent = 'X';
        } else if (seat.student) {
          seatElement.classList.add('assigned');
          seatElement.textContent = seat.student.name;
        } else {
          seatElement.textContent = `${row + 1}-${col + 1}`;
        }
        
        seatLayout.appendChild(seatElement);
      }
    }
    
    // 배정 목록 테이블
    const assignmentList = document.createElement('div');
    assignmentList.className = 'assignment-list-print';
    assignmentList.innerHTML = '<h3>학생 배정 목록</h3>';
    
    const assignmentTable = document.createElement('table');
    assignmentTable.innerHTML = `
      <thead>
        <tr>
          <th>번호</th>
          <th>학생 이름</th>
          <th>배정 좌석</th>
        </tr>
      </thead>
      <tbody>
        ${this.currentAssignment.assignments.map((assign, index) => {
          const student = this.currentAssignment.students.find(s => s.id === assign.studentId);
          const studentName = student ? student.name : '알 수 없음';
          const row = assign.seatPosition.row + 1;
          const col = assign.seatPosition.col + 1;
          
          return `
            <tr>
              <td>${index + 1}</td>
              <td>${studentName}</td>
              <td>${row}행 ${col}열</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    `;
    
    assignmentList.appendChild(assignmentTable);
    
    // 배정 정보
    const stats = this.currentAssignment.getStatistics();
    const assignmentInfo = document.createElement('div');
    assignmentInfo.className = 'assignment-info-print';
    assignmentInfo.innerHTML = `
      <p>총 학생 수: ${stats.totalStudents}명</p>
      <p>배정된 좌석: ${stats.assignedSeats}개</p>
      <p>배정률: ${stats.assignmentRate}%</p>
    `;
    
    // 인쇄 뷰에 요소 추가
    printView.appendChild(header);
    printView.appendChild(seatLayout);
    printView.appendChild(assignmentList);
    printView.appendChild(assignmentInfo);
    
    // 문서에 인쇄 뷰 추가
    document.body.appendChild(printView);
  }

  /**
   * 배정 기록 모달 표시
   * @param {Assignment[]} history - 배정 기록 배열
   */
  showHistoryModal(history) {
    const modal = this.elements.historyModal;
    const historyList = modal.querySelector('#history-list');
    historyList.innerHTML = '';
    
    // 기록 목록 헤더
    const headerDiv = document.createElement('div');
    headerDiv.className = 'history-header';
    headerDiv.innerHTML = `
      <p>총 ${history.length}개의 배정 기록이 있습니다.</p>
      <p class="help-text">배정 기록을 선택하여 관리할 수 있습니다.</p>
    `;
    historyList.appendChild(headerDiv);

    // 최신 기록부터 표시
    history.slice().reverse().forEach(assignmentData => {
      const assignment = Assignment.fromJSON(assignmentData);
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      
      // 배정 시간 포맷팅
      const timestamp = new Date(assignment.timestamp);
      const formattedDate = timestamp.toLocaleDateString();
      const formattedTime = timestamp.toLocaleTimeString();
      
      // 배정 통계 정보
      const stats = assignment.getStatistics();
      
      historyItem.innerHTML = `
        <div class="history-item-info">
          <strong>${formattedDate} ${formattedTime}</strong>
          <span>(학생 ${stats.totalStudents}명, 좌석 ${stats.totalSeats}개)</span>
        </div>
        <div class="history-item-actions">
          <button class="btn-small btn-secondary view-btn">상세 보기</button>
          <button class="btn-small btn-primary load-btn">불러오기</button>
          <button class="btn-small btn-secondary export-btn">내보내기</button>
          <button class="btn-small btn-secondary print-btn">인쇄</button>
        </div>
      `;

      // 버튼 이벤트 연결
      const viewBtn = historyItem.querySelector('.view-btn');
      const loadBtn = historyItem.querySelector('.load-btn');
      const exportBtn = historyItem.querySelector('.export-btn');
      const printBtn = historyItem.querySelector('.print-btn');
      
      viewBtn.addEventListener('click', () => {
        this.viewHistoryDetail(assignment);
      });
      
      loadBtn.addEventListener('click', () => {
        if (confirm('이 기록을 불러오면 현재 진행중인 내용이 사라집니다. 계속하시겠습니까?')) {
          this.loadAssignment(assignment);
          this.hideHistoryModal();
        }
      });
      
      exportBtn.addEventListener('click', () => {
        const textData = assignment.toText();
        
        // 클립보드에 복사 시도
        if (navigator.clipboard) {
          navigator.clipboard.writeText(textData)
            .then(() => {
              this.showSuccess('배정 결과가 클립보드에 복사되었습니다.');
            })
            .catch(() => {
              // 클립보드 복사 실패 시 모달로 표시
              this.showTextInModal(textData, '배정 결과');
            });
        } else {
          // 클립보드 API를 지원하지 않는 경우 모달로 표시
          this.showTextInModal(textData, '배정 결과');
        }
      });
      
      printBtn.addEventListener('click', () => {
        this.currentAssignment = assignment;
        this.hideHistoryModal();
        this.handlePrintResult();
      });

      historyList.appendChild(historyItem);
    });

    modal.classList.remove('hidden');
  }
  
  /**
   * 기록 상세 보기
   * @param {Assignment} assignment - 배정 결과 객체
   */
  viewHistoryDetail(assignment) {
    // 배정 결과 시각화
    const visualizedText = this.lotteryEngine.visualizeAssignment(assignment);
    this.showTextInModal(visualizedText, '배정 결과 상세');
  }
  
  /**
   * 히스토리 모달 숨기기
   */
  hideHistoryModal() {
    this.elements.historyModal.classList.add('hidden');
  }

  /**
   * 배정 기록 불러오기
   * @param {Assignment} assignment - 불러올 배정 객체
   */
  loadAssignment(assignment) {
    this.currentAssignment = assignment;
    this.studentManager.students = assignment.students.map(s => Student.fromJSON(s));
    this.seatManager.seatLayout = assignment.seatLayout.map(row => row.map(s => Seat.fromJSON(s)));

    this.updateStudentDisplay();
    this.updateSeatLayoutDisplay();
    this.updateSeatInfo();
    this.displayAssignmentResult(assignment);

    this.goToStep(3);
    this.showSuccess('배정 기록을 불러왔습니다.');
  }

  /**
   * 모든 좌석 활성화 처리
   */
  handleActivateAllSeats() {
    if (!this.seatManager.hasLayout()) {
      this.showError('좌석 배치가 생성되지 않았습니다.');
      return;
    }

    const result = this.seatManager.activateAllSeats();
    
    if (result.success) {
      this.updateSeatLayoutDisplay();
      this.updateSeatInfo();
      this.updateNextToLotteryButton();
      this.showSuccess('모든 좌석이 활성화되었습니다.');
    } else {
      this.showError(result.error);
    }
  }

  /**
   * 모든 좌석 비활성화 처리
   */
  handleDeactivateAllSeats() {
    if (!this.seatManager.hasLayout()) {
      this.showError('좌석 배치가 생성되지 않았습니다.');
      return;
    }

    const result = this.seatManager.deactivateAllSeats();
    
    if (result.success) {
      this.updateSeatLayoutDisplay();
      this.updateSeatInfo();
      this.updateNextToLotteryButton();
      this.showSuccess('모든 좌석이 비활성화되었습니다.');
    } else {
      this.showError(result.error);
    }
  }

  

  /**
   * 기록 모달 숨기기
   */
  hideHistoryModal() {
    this.elements.historyModal.classList.add('hidden');
  }
}

// 애니메이션 CSS 추가
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .student-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .student-number {
    font-weight: 600;
    color: var(--text-secondary);
    min-width: 30px;
  }

  .student-type {
    font-size: 0.8rem;
    color: var(--text-secondary);
    background: var(--background-color);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  .empty-message {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-style: italic;
  }

  .student-item:hover .student-actions {
    opacity: 1;
  }

  .student-actions {
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }

  .student-list {
    scrollbar-width: thin;
    scrollbar-color: var(--border-color) transparent;
  }

  .student-list::-webkit-scrollbar {
    width: 6px;
  }

  .student-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .student-list::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }

  .student-list::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }

  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background: var(--background-color);
    border-radius: var(--border-radius);
  }
`;
document.head.appendChild(style);

// DOM이 로드되면 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ClassroomLotteryApp();
});