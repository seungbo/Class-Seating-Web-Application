/**
 * 학생 관리 클래스
 * 학생 추가, 삭제, 수정 및 검증 기능을 제공합니다.
 */
class StudentManager {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.nextId = 1;
    
    this.ERROR_MESSAGES = {
      EMPTY_NAME: '학생 이름을 입력해주세요.',
      DUPLICATE_NAME: '이미 존재하는 학생 이름입니다.',
      INVALID_COUNT: '올바른 학생 수를 입력해주세요.',
      STUDENT_NOT_FOUND: '해당 학생을 찾을 수 없습니다.',
      INVALID_STUDENT_ID: '유효하지 않은 학생 ID입니다.',
      SAVE_FAILED: '학생 데이터 저장에 실패했습니다.'
    };
    
    // 저장된 학생 데이터 로드
    this.loadStudents();
  }

  /**
   * 저장된 학생 데이터 로드
   */
  loadStudents() {
    try {
      const savedStudents = this.storageManager.loadStudents();
      if (savedStudents && Array.isArray(savedStudents)) {
        this.students = savedStudents.map(studentData => 
          Student.fromJSON(studentData)
        );
        // 다음 ID 설정 (기존 학생들의 ID 중 최대값 + 1)
        this.updateNextId();
      }
    } catch (error) {
      console.error('Failed to load students:', error);
      this.students = [];
    }
  }

  /**
   * 다음 ID 업데이트
   */
  updateNextId() {
    if (this.students.length === 0) {
      this.nextId = 1;
      return;
    }
    
    const maxId = Math.max(...this.students.map(student => {
      const idNumber = parseInt(student.id.replace('student_', ''));
      return isNaN(idNumber) ? 0 : idNumber;
    }));
    
    this.nextId = maxId + 1;
  }

  /**
   * 고유 ID 생성
   * @returns {string} 고유 ID
   */
  generateId() {
    return `student_${this.nextId++}`;
  }

  /**
   * 학생 이름 검증
   * @param {string} name - 검증할 이름
   * @param {string} excludeId - 제외할 학생 ID (수정 시 사용)
   * @returns {Object} 검증 결과 {isValid: boolean, error: string}
   */
  validateStudentName(name, excludeId = null) {
    // 빈 이름 검사
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return {
        isValid: false,
        error: this.ERROR_MESSAGES.EMPTY_NAME
      };
    }

    const trimmedName = name.trim();
    
    // 중복 이름 검사
    const isDuplicate = this.students.some(student => 
      student.name === trimmedName && student.id !== excludeId
    );
    
    if (isDuplicate) {
      return {
        isValid: false,
        error: this.ERROR_MESSAGES.DUPLICATE_NAME
      };
    }

    return {
      isValid: true,
      error: null
    };
  }

  /**
   * 학생 추가 (이름 직접 입력)
   * @param {string} name - 학생 이름
   * @returns {Object} 결과 {success: boolean, student: Student|null, error: string|null}
   */
  addStudent(name) {
    const validation = this.validateStudentName(name);
    if (!validation.isValid) {
      return {
        success: false,
        student: null,
        error: validation.error
      };
    }

    try {
      const student = new Student(
        this.generateId(),
        name.trim(),
        false // 직접 입력이므로 번호 기반이 아님
      );

      this.students.push(student);
      this.saveStudents();

      return {
        success: true,
        student: student,
        error: null
      };
    } catch (error) {
      console.error('Failed to add student:', error);
      return {
        success: false,
        student: null,
        error: this.ERROR_MESSAGES.SAVE_FAILED
      };
    }
  }

  /**
   * 번호 기반 학생 생성
   * @param {number} count - 생성할 학생 수
   * @returns {Object} 결과 {success: boolean, students: Student[], error: string|null}
   */
  generateStudentsByNumber(count) {
    if (!count || !Number.isInteger(count) || count <= 0 || count > 100) {
      return {
        success: false,
        students: [],
        error: this.ERROR_MESSAGES.INVALID_COUNT
      };
    }

    try {
      const newStudents = [];
      
      for (let i = 1; i <= count; i++) {
        const studentName = `${i}번`;
        
        // 중복 이름 검사 (기존 학생들과)
        const validation = this.validateStudentName(studentName);
        if (!validation.isValid) {
          // 중복이 있다면 번호를 조정
          let adjustedNumber = i;
          let adjustedName = `${adjustedNumber}번`;
          
          while (!this.validateStudentName(adjustedName).isValid && adjustedNumber <= count + 50) {
            adjustedNumber++;
            adjustedName = `${adjustedNumber}번`;
          }
          
          if (adjustedNumber > count + 50) {
            return {
              success: false,
              students: [],
              error: '번호 기반 학생 생성 중 중복 이름 문제가 발생했습니다.'
            };
          }
          
          studentName = adjustedName;
        }

        const student = new Student(
          this.generateId(),
          studentName,
          true // 번호 기반 생성
        );

        newStudents.push(student);
        this.students.push(student);
      }

      this.saveStudents();

      return {
        success: true,
        students: newStudents,
        error: null
      };
    } catch (error) {
      console.error('Failed to generate students by number:', error);
      return {
        success: false,
        students: [],
        error: this.ERROR_MESSAGES.SAVE_FAILED
      };
    }
  }

  /**
   * 학생 삭제
   * @param {string} studentId - 삭제할 학생 ID
   * @returns {Object} 결과 {success: boolean, error: string|null}
   */
  removeStudent(studentId) {
    if (!studentId || typeof studentId !== 'string') {
      return {
        success: false,
        error: this.ERROR_MESSAGES.INVALID_STUDENT_ID
      };
    }

    const studentIndex = this.students.findIndex(student => student.id === studentId);
    
    if (studentIndex === -1) {
      return {
        success: false,
        error: this.ERROR_MESSAGES.STUDENT_NOT_FOUND
      };
    }

    try {
      this.students.splice(studentIndex, 1);
      this.saveStudents();

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Failed to remove student:', error);
      return {
        success: false,
        error: this.ERROR_MESSAGES.SAVE_FAILED
      };
    }
  }

  /**
   * 학생 정보 수정
   * @param {string} studentId - 수정할 학생 ID
   * @param {string} newName - 새로운 이름
   * @returns {Object} 결과 {success: boolean, student: Student|null, error: string|null}
   */
  updateStudent(studentId, newName) {
    if (!studentId || typeof studentId !== 'string') {
      return {
        success: false,
        student: null,
        error: this.ERROR_MESSAGES.INVALID_STUDENT_ID
      };
    }

    const student = this.students.find(s => s.id === studentId);
    if (!student) {
      return {
        success: false,
        student: null,
        error: this.ERROR_MESSAGES.STUDENT_NOT_FOUND
      };
    }

    const validation = this.validateStudentName(newName, studentId);
    if (!validation.isValid) {
      return {
        success: false,
        student: null,
        error: validation.error
      };
    }

    try {
      student.name = newName.trim();
      this.saveStudents();

      return {
        success: true,
        student: student,
        error: null
      };
    } catch (error) {
      console.error('Failed to update student:', error);
      return {
        success: false,
        student: null,
        error: this.ERROR_MESSAGES.SAVE_FAILED
      };
    }
  }

  /**
   * 학생 목록 조회
   * @returns {Student[]} 학생 배열
   */
  getStudents() {
    return [...this.students]; // 복사본 반환
  }

  /**
   * 특정 학생 조회
   * @param {string} studentId - 학생 ID
   * @returns {Student|null} 학생 객체 또는 null
   */
  getStudent(studentId) {
    return this.students.find(student => student.id === studentId) || null;
  }

  /**
   * 학생 수 조회
   * @returns {number} 학생 수
   */
  getStudentCount() {
    return this.students.length;
  }

  /**
   * 모든 학생 삭제
   * @returns {Object} 결과 {success: boolean, error: string|null}
   */
  clearAllStudents() {
    try {
      this.students = [];
      this.nextId = 1;
      this.saveStudents();

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Failed to clear all students:', error);
      return {
        success: false,
        error: this.ERROR_MESSAGES.SAVE_FAILED
      };
    }
  }

  /**
   * 학생 데이터 저장
   */
  saveStudents() {
    try {
      this.storageManager.saveStudents(this.students);
    } catch (error) {
      console.error('Failed to save students:', error);
      throw error;
    }
  }

  /**
   * 학생 목록을 이름순으로 정렬
   * @param {boolean} ascending - 오름차순 여부 (기본값: true)
   * @returns {Object} 결과 {success: boolean, error: string|null}
   */
  sortStudentsByName(ascending = true) {
    try {
      this.students.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        
        if (ascending) {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });

      this.saveStudents();

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Failed to sort students:', error);
      return {
        success: false,
        error: this.ERROR_MESSAGES.SAVE_FAILED
      };
    }
  }

  /**
   * 번호 기반 학생들을 번호순으로 정렬
   * @returns {Object} 결과 {success: boolean, error: string|null}
   */
  sortNumberBasedStudents() {
    try {
      this.students.sort((a, b) => {
        // 번호 기반 학생들을 먼저 정렬
        if (a.isNumberBased && b.isNumberBased) {
          const numA = parseInt(a.name.replace('번', ''));
          const numB = parseInt(b.name.replace('번', ''));
          return numA - numB;
        }
        
        // 번호 기반이 아닌 학생들은 이름순
        if (!a.isNumberBased && !b.isNumberBased) {
          return a.name.localeCompare(b.name);
        }
        
        // 번호 기반 학생을 앞에 배치
        return a.isNumberBased ? -1 : 1;
      });

      this.saveStudents();

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Failed to sort number-based students:', error);
      return {
        success: false,
        error: this.ERROR_MESSAGES.SAVE_FAILED
      };
    }
  }

  /**
   * 학생 통계 정보 조회
   * @returns {Object} 통계 정보
   */
  getStatistics() {
    const total = this.students.length;
    const numberBased = this.students.filter(s => s.isNumberBased).length;
    const nameBased = total - numberBased;

    return {
      total: total,
      numberBased: numberBased,
      nameBased: nameBased,
      isEmpty: total === 0
    };
  }

  /**
   * 학생 목록을 텍스트로 내보내기
   * @returns {string} 텍스트 형태의 학생 목록
   */
  exportToText() {
    if (this.students.length === 0) {
      return '등록된 학생이 없습니다.';
    }

    let text = `학생 목록 (총 ${this.students.length}명)\n`;
    text += '='.repeat(30) + '\n\n';

    this.students.forEach((student, index) => {
      const type = student.isNumberBased ? '[번호]' : '[이름]';
      text += `${index + 1}. ${student.name} ${type}\n`;
    });

    const stats = this.getStatistics();
    text += '\n' + '-'.repeat(20) + '\n';
    text += `이름 입력: ${stats.nameBased}명\n`;
    text += `번호 생성: ${stats.numberBased}명\n`;

    return text;
  }
}

// 전역으로 클래스를 내보냄 (모듈 시스템 미사용 환경)
if (typeof window !== 'undefined') {
  window.StudentManager = StudentManager;
}