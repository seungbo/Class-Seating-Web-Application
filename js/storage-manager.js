/**
 * 로컬 스토리지 관리 클래스
 * 데이터 저장, 로드, 검증 기능을 제공합니다.
 */
class StorageManager {
  constructor() {
    this.STORAGE_KEYS = {
      STUDENTS: 'classroom_lottery_students',
      SEAT_LAYOUT: 'classroom_lottery_seat_layout',
      ASSIGNMENTS: 'classroom_lottery_assignments',
      ASSIGNMENT_HISTORY: 'classroom_lottery_assignment_history'
    };
    
    this.ERROR_MESSAGES = {
      STORAGE_NOT_AVAILABLE: '로컬 스토리지를 사용할 수 없습니다.',
      SAVE_FAILED: '데이터 저장에 실패했습니다.',
      LOAD_FAILED: '데이터 로드에 실패했습니다.',
      INVALID_DATA: '유효하지 않은 데이터입니다.',
      QUOTA_EXCEEDED: '저장 공간이 부족합니다.'
    };
  }

  /**
   * 로컬 스토리지 사용 가능 여부 확인
   * @returns {boolean} 사용 가능 여부
   */
  isStorageAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.error('Storage availability check failed:', error);
      return false;
    }
  }

  /**
   * 데이터 저장
   * @param {string} key - 저장할 키
   * @param {*} data - 저장할 데이터
   * @returns {boolean} 저장 성공 여부
   */
  saveData(key, data) {
    if (!this.isStorageAvailable()) {
      throw new Error(this.ERROR_MESSAGES.STORAGE_NOT_AVAILABLE);
    }

    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error(this.ERROR_MESSAGES.QUOTA_EXCEEDED);
      }
      console.error('Data save failed:', error);
      throw new Error(this.ERROR_MESSAGES.SAVE_FAILED);
    }
  }

  /**
   * 데이터 로드
   * @param {string} key - 로드할 키
   * @returns {*} 로드된 데이터 또는 null
   */
  loadData(key) {
    if (!this.isStorageAvailable()) {
      throw new Error(this.ERROR_MESSAGES.STORAGE_NOT_AVAILABLE);
    }

    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return null;
      }
      return JSON.parse(serializedData);
    } catch (error) {
      console.error('Data load failed:', error);
      throw new Error(this.ERROR_MESSAGES.LOAD_FAILED);
    }
  }

  /**
   * 학생 데이터 저장
   * @param {Student[]} students - 학생 배열
   * @returns {boolean} 저장 성공 여부
   */
  saveStudents(students) {
    if (!this.validateStudents(students)) {
      throw new Error(this.ERROR_MESSAGES.INVALID_DATA);
    }
    return this.saveData(this.STORAGE_KEYS.STUDENTS, students);
  }

  /**
   * 학생 데이터 로드
   * @returns {Student[]|null} 학생 배열 또는 null
   */
  loadStudents() {
    const students = this.loadData(this.STORAGE_KEYS.STUDENTS);
    if (students && !this.validateStudents(students)) {
      console.warn('Invalid student data found, returning empty array');
      return [];
    }
    return students || [];
  }

  /**
   * 좌석 배치 데이터 저장
   * @param {Seat[][]} seatLayout - 좌석 배치 2차원 배열
   * @returns {boolean} 저장 성공 여부
   */
  saveSeatLayout(seatLayout) {
    if (!this.validateSeatLayout(seatLayout)) {
      throw new Error(this.ERROR_MESSAGES.INVALID_DATA);
    }
    return this.saveData(this.STORAGE_KEYS.SEAT_LAYOUT, seatLayout);
  }

  /**
   * 좌석 배치 데이터 로드
   * @returns {Seat[][]|null} 좌석 배치 2차원 배열 또는 null
   */
  loadSeatLayout() {
    const seatLayout = this.loadData(this.STORAGE_KEYS.SEAT_LAYOUT);
    if (seatLayout && !this.validateSeatLayout(seatLayout)) {
      console.warn('Invalid seat layout data found, returning null');
      return null;
    }
    return seatLayout;
  }

  /**
   * 배정 결과 저장
   * @param {Assignment} assignment - 배정 결과
   * @returns {boolean} 저장 성공 여부
   */
  saveAssignment(assignment) {
    if (!this.validateAssignment(assignment)) {
      throw new Error(this.ERROR_MESSAGES.INVALID_DATA);
    }
    
    // 현재 배정 저장
    this.saveData(this.STORAGE_KEYS.ASSIGNMENTS, assignment);
    
    // 배정 기록에 추가
    const history = this.getAssignmentHistory();
    history.push(assignment);
    
    // 최대 10개의 기록만 유지
    if (history.length > 10) {
      history.shift();
    }
    
    return this.saveData(this.STORAGE_KEYS.ASSIGNMENT_HISTORY, history);
  }

  /**
   * 현재 배정 결과 로드
   * @returns {Assignment|null} 배정 결과 또는 null
   */
  loadCurrentAssignment() {
    const assignment = this.loadData(this.STORAGE_KEYS.ASSIGNMENTS);
    if (assignment && !this.validateAssignment(assignment)) {
      console.warn('Invalid assignment data found, returning null');
      return null;
    }
    return assignment;
  }

  /**
   * 배정 기록 조회
   * @returns {Assignment[]} 배정 기록 배열
   */
  getAssignmentHistory() {
    const history = this.loadData(this.STORAGE_KEYS.ASSIGNMENT_HISTORY);
    if (!Array.isArray(history)) {
      return [];
    }
    return history.filter(assignment => this.validateAssignment(assignment));
  }

  /**
   * 학생 데이터 검증
   * @param {*} students - 검증할 학생 데이터
   * @returns {boolean} 유효성 여부
   */
  validateStudents(students) {
    if (!Array.isArray(students)) {
      return false;
    }
    
    return students.every(student => 
      student &&
      typeof student.id === 'string' &&
      typeof student.name === 'string' &&
      student.name.trim().length > 0 &&
      typeof student.isNumberBased === 'boolean'
    );
  }

  /**
   * 좌석 배치 데이터 검증
   * @param {*} seatLayout - 검증할 좌석 배치 데이터
   * @returns {boolean} 유효성 여부
   */
  validateSeatLayout(seatLayout) {
    if (!Array.isArray(seatLayout) || seatLayout.length === 0) {
      return false;
    }
    
    return seatLayout.every(row => 
      Array.isArray(row) && 
      row.every(seat => 
        seat &&
        typeof seat.row === 'number' &&
        typeof seat.col === 'number' &&
        typeof seat.isActive === 'boolean' &&
        (seat.student === null || this.validateStudent(seat.student))
      )
    );
  }

  /**
   * 단일 학생 데이터 검증
   * @param {*} student - 검증할 학생 데이터
   * @returns {boolean} 유효성 여부
   */
  validateStudent(student) {
    return student &&
      typeof student.id === 'string' &&
      typeof student.name === 'string' &&
      student.name.trim().length > 0 &&
      typeof student.isNumberBased === 'boolean';
  }

  /**
   * 배정 결과 데이터 검증
   * @param {*} assignment - 검증할 배정 결과 데이터
   * @returns {boolean} 유효성 여부
   */
  validateAssignment(assignment) {
    if (!assignment || typeof assignment !== 'object') {
      return false;
    }
    
    return typeof assignment.id === 'string' &&
      assignment.timestamp instanceof Date ||
      (typeof assignment.timestamp === 'string' && !isNaN(Date.parse(assignment.timestamp))) &&
      this.validateStudents(assignment.students) &&
      this.validateSeatLayout(assignment.seatLayout) &&
      Array.isArray(assignment.assignments) &&
      assignment.assignments.every(assign => 
        assign &&
        typeof assign.studentId === 'string' &&
        assign.seatPosition &&
        typeof assign.seatPosition.row === 'number' &&
        typeof assign.seatPosition.col === 'number'
      );
  }

  /**
   * 모든 데이터 삭제
   * @returns {boolean} 삭제 성공 여부
   */
  clearAllData() {
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Clear all data failed:', error);
      return false;
    }
  }

  /**
   * 저장소 사용량 정보 조회 (근사치)
   * @returns {Object} 사용량 정보
   */
  getStorageInfo() {
    if (!this.isStorageAvailable()) {
      return { used: 0, available: 0, total: 0 };
    }

    let used = 0;
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      console.error('Storage info calculation failed:', error);
    }

    // 대략적인 총 용량 (브라우저마다 다름, 일반적으로 5-10MB)
    const approximateTotal = 5 * 1024 * 1024; // 5MB
    
    return {
      used: used,
      available: approximateTotal - used,
      total: approximateTotal,
      usedPercentage: Math.round((used / approximateTotal) * 100)
    };
  }
}

// 데이터 모델 정의

/**
 * 학생 데이터 모델
 */
class Student {
  /**
   * @param {string} id - 고유 식별자
   * @param {string} name - 학생 이름 또는 번호
   * @param {boolean} isNumberBased - 번호 기반 생성 여부
   */
  constructor(id, name, isNumberBased = false) {
    this.id = id;
    this.name = name;
    this.isNumberBased = isNumberBased;
  }

  /**
   * 학생 객체를 JSON으로 변환
   * @returns {Object} JSON 객체
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      isNumberBased: this.isNumberBased
    };
  }

  /**
   * JSON에서 학생 객체 생성
   * @param {Object} json - JSON 객체
   * @returns {Student} 학생 객체
   */
  static fromJSON(json) {
    return new Student(json.id, json.name, json.isNumberBased);
  }
}

/**
 * 좌석 데이터 모델
 */
class Seat {
  /**
   * @param {number} row - 행 번호
   * @param {number} col - 열 번호
   * @param {boolean} isActive - 활성화 상태
   * @param {Student|null} student - 배정된 학생
   */
  constructor(row, col, isActive = true, student = null) {
    this.row = row;
    this.col = col;
    this.isActive = isActive;
    this.student = student;
  }

  /**
   * 좌석에 학생 배정
   * @param {Student} student - 배정할 학생
   */
  assignStudent(student) {
    if (!this.isActive) {
      throw new Error('비활성화된 좌석에는 학생을 배정할 수 없습니다.');
    }
    this.student = student;
  }

  /**
   * 좌석에서 학생 제거
   */
  removeStudent() {
    this.student = null;
  }

  /**
   * 좌석 활성화/비활성화
   * @param {boolean} active - 활성화 상태
   */
  setActive(active) {
    this.isActive = active;
    if (!active) {
      this.removeStudent();
    }
  }

  /**
   * 좌석이 비어있는지 확인
   * @returns {boolean} 비어있는지 여부
   */
  isEmpty() {
    return this.student === null;
  }

  /**
   * 좌석 객체를 JSON으로 변환
   * @returns {Object} JSON 객체
   */
  toJSON() {
    return {
      row: this.row,
      col: this.col,
      isActive: this.isActive,
      student: this.student ? this.student.toJSON() : null
    };
  }

  /**
   * JSON에서 좌석 객체 생성
   * @param {Object} json - JSON 객체
   * @returns {Seat} 좌석 객체
   */
  static fromJSON(json) {
    const student = json.student ? Student.fromJSON(json.student) : null;
    return new Seat(json.row, json.col, json.isActive, student);
  }
}

/**
 * 배정 결과 데이터 모델
 */
class Assignment {
  /**
   * @param {string} id - 배정 고유 식별자
   * @param {Date} timestamp - 배정 시간
   * @param {Student[]} students - 학생 목록
   * @param {Seat[][]} seatLayout - 좌석 배치
   * @param {Array} assignments - 배정 결과
   */
  constructor(id, timestamp, students, seatLayout, assignments) {
    this.id = id;
    this.timestamp = timestamp;
    this.students = students;
    this.seatLayout = seatLayout;
    this.assignments = assignments;
  }

  /**
   * 특정 학생의 좌석 위치 조회
   * @param {string} studentId - 학생 ID
   * @returns {Object|null} 좌석 위치 또는 null
   */
  getStudentSeat(studentId) {
    const assignment = this.assignments.find(assign => assign.studentId === studentId);
    return assignment ? assignment.seatPosition : null;
  }

  /**
   * 특정 좌석의 학생 조회
   * @param {number} row - 행 번호
   * @param {number} col - 열 번호
   * @returns {string|null} 학생 ID 또는 null
   */
  getSeatStudent(row, col) {
    const assignment = this.assignments.find(assign => 
      assign.seatPosition.row === row && assign.seatPosition.col === col
    );
    return assignment ? assignment.studentId : null;
  }

  /**
   * 배정 통계 정보 조회
   * @returns {Object} 통계 정보
   */
  getStatistics() {
    const totalSeats = this.seatLayout.flat().filter(seat => seat.isActive).length;
    const assignedSeats = this.assignments.length;
    const unassignedSeats = totalSeats - assignedSeats;

    return {
      totalStudents: this.students.length,
      totalSeats: totalSeats,
      assignedSeats: assignedSeats,
      unassignedSeats: unassignedSeats,
      assignmentRate: Math.round((assignedSeats / this.students.length) * 100)
    };
  }

  /**
   * 배정 결과를 텍스트로 변환
   * @returns {string} 텍스트 형태의 배정 결과
   */
  toText() {
    let text = `자리 배정 결과 (${this.timestamp.toLocaleString()})\n`;
    text += '='.repeat(50) + '\n\n';

    this.assignments.forEach((assignment, index) => {
      const student = this.students.find(s => s.id === assignment.studentId);
      const studentName = student ? student.name : '알 수 없음';
      const row = assignment.seatPosition.row + 1; // 1부터 시작하도록 표시
      const col = assignment.seatPosition.col + 1;
      
      text += `${index + 1}. ${studentName} → ${row}행 ${col}열\n`;
    });

    const stats = this.getStatistics();
    text += '\n' + '-'.repeat(30) + '\n';
    text += `총 학생 수: ${stats.totalStudents}명\n`;
    text += `배정된 좌석: ${stats.assignedSeats}개\n`;
    text += `배정률: ${stats.assignmentRate}%\n`;

    return text;
  }

  /**
   * 배정 결과 객체를 JSON으로 변환
   * @returns {Object} JSON 객체
   */
  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp.toISOString(),
      students: this.students.map(student => student.toJSON()),
      seatLayout: this.seatLayout.map(row => row.map(seat => seat.toJSON())),
      assignments: this.assignments
    };
  }

  /**
   * JSON에서 배정 결과 객체 생성
   * @param {Object} json - JSON 객체
   * @returns {Assignment} 배정 결과 객체
   */
  static fromJSON(json) {
    const students = json.students.map(studentJson => Student.fromJSON(studentJson));
    const seatLayout = json.seatLayout.map(row => 
      row.map(seatJson => Seat.fromJSON(seatJson))
    );
    
    return new Assignment(
      json.id,
      new Date(json.timestamp),
      students,
      seatLayout,
      json.assignments
    );
  }

  /**
   * 새로운 배정 결과 생성
   * @param {Student[]} students - 학생 목록
   * @param {Seat[][]} seatLayout - 좌석 배치
   * @param {Array} assignments - 배정 결과
   * @returns {Assignment} 새로운 배정 결과 객체
   */
  static create(students, seatLayout, assignments) {
    const id = 'assignment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const timestamp = new Date();
    
    return new Assignment(id, timestamp, students, seatLayout, assignments);
  }
}

// 전역으로 클래스들을 내보냄 (모듈 시스템 미사용 환경)
if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
  window.Student = Student;
  window.Seat = Seat;
  window.Assignment = Assignment;
}