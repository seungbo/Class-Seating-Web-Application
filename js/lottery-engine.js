/**
 * 자리 뽑기 엔진 클래스
 * Fisher-Yates 셔플 알고리즘을 사용하여 학생-좌석 무작위 배정을 수행합니다.
 */
class LotteryEngine {
  constructor() {
    this.ERROR_MESSAGES = {
      NO_STUDENTS: '배정할 학생이 없습니다.',
      NO_SEATS: '사용 가능한 좌석이 없습니다.',
      INSUFFICIENT_SEATS: '좌석 수가 학생 수보다 적습니다.',
      INVALID_STUDENTS: '유효하지 않은 학생 데이터입니다.',
      INVALID_SEATS: '유효하지 않은 좌석 데이터입니다.',
      ASSIGNMENT_FAILED: '자리 배정에 실패했습니다.'
    };
  }

  /**
   * Fisher-Yates 셔플 알고리즘 구현
   * 배열을 무작위로 섞습니다.
   * @param {Array} array - 섞을 배열 (원본은 변경되지 않음)
   * @returns {Array} 섞인 배열의 복사본
   */
  shuffleArray(array) {
    if (!Array.isArray(array)) {
      throw new Error('배열이 아닌 데이터입니다.');
    }

    // 원본 배열을 변경하지 않기 위해 복사본 생성
    const shuffled = [...array];
    
    // Fisher-Yates 셔플 알고리즘
    for (let i = shuffled.length - 1; i > 0; i--) {
      // 0부터 i까지의 무작위 인덱스 생성
      const randomIndex = Math.floor(Math.random() * (i + 1));
      
      // 현재 요소와 무작위 요소 교환
      [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }
    
    return shuffled;
  }

  /**
   * 학생 데이터 검증
   * @param {Array} students - 검증할 학생 배열
   * @returns {Object} 검증 결과 {isValid: boolean, error: string|null}
   */
  validateStudents(students) {
    if (!Array.isArray(students)) {
      return {
        isValid: false,
        error: this.ERROR_MESSAGES.INVALID_STUDENTS
      };
    }

    if (students.length === 0) {
      return {
        isValid: false,
        error: this.ERROR_MESSAGES.NO_STUDENTS
      };
    }

    // 각 학생 객체 검증
    for (const student of students) {
      if (!student || 
          typeof student.id !== 'string' || 
          typeof student.name !== 'string' || 
          student.name.trim().length === 0) {
        return {
          isValid: false,
          error: this.ERROR_MESSAGES.INVALID_STUDENTS
        };
      }
    }

    return {
      isValid: true,
      error: null
    };
  }

  /**
   * 좌석 데이터 검증
   * @param {Array} seats - 검증할 좌석 배열
   * @returns {Object} 검증 결과 {isValid: boolean, error: string|null}
   */
  validateSeats(seats) {
    if (!Array.isArray(seats)) {
      return {
        isValid: false,
        error: this.ERROR_MESSAGES.INVALID_SEATS
      };
    }

    if (seats.length === 0) {
      return {
        isValid: false,
        error: this.ERROR_MESSAGES.NO_SEATS
      };
    }

    // 각 좌석 객체 검증
    for (const seat of seats) {
      if (!seat || 
          typeof seat.row !== 'number' || 
          typeof seat.col !== 'number' || 
          typeof seat.isActive !== 'boolean' ||
          !seat.isActive) { // 활성화된 좌석만 유효
        return {
          isValid: false,
          error: this.ERROR_MESSAGES.INVALID_SEATS
        };
      }
    }

    return {
      isValid: true,
      error: null
    };
  }

  /**
   * 배정 가능성 검증
   * @param {Array} students - 학생 배열
   * @param {Array} availableSeats - 사용 가능한 좌석 배열
   * @returns {Object} 검증 결과 {canAssign: boolean, error: string|null}
   */
  validateAssignmentPossibility(students, availableSeats) {
    const studentValidation = this.validateStudents(students);
    if (!studentValidation.isValid) {
      return {
        canAssign: false,
        error: studentValidation.error
      };
    }

    const seatValidation = this.validateSeats(availableSeats);
    if (!seatValidation.isValid) {
      return {
        canAssign: false,
        error: seatValidation.error
      };
    }

    if (availableSeats.length < students.length) {
      return {
        canAssign: false,
        error: this.ERROR_MESSAGES.INSUFFICIENT_SEATS
      };
    }

    return {
      canAssign: true,
      error: null
    };
  }

  /**
   * 학생-좌석 무작위 배정 실행
   * @param {Array} students - 학생 배열
   * @param {Array} availableSeats - 사용 가능한 좌석 배열
   * @returns {Object} 배정 결과 {success: boolean, assignments: Array|null, error: string|null}
   */
  assignSeats(students, availableSeats) {
    try {
      // 배정 가능성 검증
      const validation = this.validateAssignmentPossibility(students, availableSeats);
      if (!validation.canAssign) {
        return {
          success: false,
          assignments: null,
          error: validation.error
        };
      }

      // 학생 배열과 좌석 배열을 각각 셔플
      const shuffledStudents = this.shuffleArray(students);
      const shuffledSeats = this.shuffleArray(availableSeats);

      // 배정 결과 생성
      const assignments = [];
      
      for (let i = 0; i < shuffledStudents.length; i++) {
        const student = shuffledStudents[i];
        const seat = shuffledSeats[i];
        
        assignments.push({
          studentId: student.id,
          studentName: student.name,
          seatPosition: {
            row: seat.row,
            col: seat.col
          }
        });
      }

      return {
        success: true,
        assignments: assignments,
        error: null
      };
    } catch (error) {
      console.error('Seat assignment failed:', error);
      return {
        success: false,
        assignments: null,
        error: this.ERROR_MESSAGES.ASSIGNMENT_FAILED
      };
    }
  }

  /**
   * 배정 결과 데이터 구조 생성
   * @param {Array} students - 학생 배열
   * @param {Array} seatLayout - 좌석 배치 2차원 배열
   * @param {Array} assignments - 배정 결과 배열
   * @returns {Assignment} 완전한 배정 결과 객체
   */
  generateAssignment(students, seatLayout, assignments) {
    try {
      // 좌석 배치에 학생 배정 정보 적용
      const updatedSeatLayout = seatLayout.map(row => 
        row.map(seat => {
          // 기존 좌석 정보 복사
          const newSeat = new Seat(seat.row, seat.col, seat.isActive, null);
          
          // 해당 좌석에 배정된 학생 찾기
          const assignment = assignments.find(assign => 
            assign.seatPosition.row === seat.row && 
            assign.seatPosition.col === seat.col
          );
          
          if (assignment) {
            // 학생 객체 찾기
            const student = students.find(s => s.id === assignment.studentId);
            if (student) {
              newSeat.assignStudent(student);
            }
          }
          
          return newSeat;
        })
      );

      // Assignment 객체 생성
      const assignmentObj = Assignment.create(students, updatedSeatLayout, assignments);
      
      return assignmentObj;
    } catch (error) {
      console.error('Failed to generate assignment:', error);
      throw new Error(this.ERROR_MESSAGES.ASSIGNMENT_FAILED);
    }
  }

  /**
   * 완전한 자리 뽑기 프로세스 실행
   * @param {Array} students - 학생 배열
   * @param {Array} seatLayout - 좌석 배치 2차원 배열
   * @returns {Object} 결과 {success: boolean, assignment: Assignment|null, error: string|null}
   */
  performLottery(students, seatLayout) {
    try {
      // 사용 가능한 좌석 추출
      const availableSeats = [];
      
      for (let row = 0; row < seatLayout.length; row++) {
        for (let col = 0; col < seatLayout[row].length; col++) {
          const seat = seatLayout[row][col];
          if (seat.isActive) {
            availableSeats.push(seat);
          }
        }
      }

      // 자리 배정 실행
      const assignmentResult = this.assignSeats(students, availableSeats);
      
      if (!assignmentResult.success) {
        return {
          success: false,
          assignment: null,
          error: assignmentResult.error
        };
      }

      // 완전한 배정 결과 객체 생성
      const assignment = this.generateAssignment(
        students, 
        seatLayout, 
        assignmentResult.assignments
      );

      return {
        success: true,
        assignment: assignment,
        error: null
      };
    } catch (error) {
      console.error('Lottery process failed:', error);
      return {
        success: false,
        assignment: null,
        error: this.ERROR_MESSAGES.ASSIGNMENT_FAILED
      };
    }
  }

  /**
   * 배정 결과 통계 생성
   * @param {Assignment} assignment - 배정 결과 객체
   * @returns {Object} 통계 정보
   */
  generateStatistics(assignment) {
    if (!assignment) {
      return {
        totalStudents: 0,
        assignedStudents: 0,
        unassignedStudents: 0,
        totalSeats: 0,
        occupiedSeats: 0,
        emptySeats: 0,
        assignmentRate: 0
      };
    }

    const stats = assignment.getStatistics();
    
    return {
      totalStudents: stats.totalStudents,
      assignedStudents: stats.assignedSeats,
      unassignedStudents: stats.totalStudents - stats.assignedSeats,
      totalSeats: stats.totalSeats,
      occupiedSeats: stats.assignedSeats,
      emptySeats: stats.unassignedSeats,
      assignmentRate: stats.assignmentRate
    };
  }

  /**
   * 배정 결과 검증
   * @param {Assignment} assignment - 검증할 배정 결과
   * @returns {Object} 검증 결과 {isValid: boolean, issues: Array}
   */
  validateAssignmentResult(assignment) {
    const issues = [];
    
    if (!assignment) {
      issues.push('배정 결과가 존재하지 않습니다.');
      return { isValid: false, issues };
    }

    // 중복 배정 검사
    const assignedPositions = new Set();
    const assignedStudents = new Set();
    
    for (const assign of assignment.assignments) {
      const positionKey = `${assign.seatPosition.row}-${assign.seatPosition.col}`;
      
      if (assignedPositions.has(positionKey)) {
        issues.push(`좌석 (${assign.seatPosition.row + 1}, ${assign.seatPosition.col + 1})에 중복 배정이 있습니다.`);
      }
      assignedPositions.add(positionKey);
      
      if (assignedStudents.has(assign.studentId)) {
        issues.push(`학생 ${assign.studentName}이 중복 배정되었습니다.`);
      }
      assignedStudents.add(assign.studentId);
    }

    // 비활성화된 좌석에 배정 검사
    for (const assign of assignment.assignments) {
      const seat = assignment.seatLayout[assign.seatPosition.row][assign.seatPosition.col];
      if (!seat.isActive) {
        issues.push(`비활성화된 좌석 (${assign.seatPosition.row + 1}, ${assign.seatPosition.col + 1})에 배정이 있습니다.`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues: issues
    };
  }

  /**
   * 배정 결과를 시각적 텍스트로 변환
   * @param {Assignment} assignment - 배정 결과
   * @returns {string} 시각적 배정 결과 텍스트
   */
  visualizeAssignment(assignment) {
    if (!assignment) {
      return '배정 결과가 없습니다.';
    }

    let text = `자리 배정 결과 시각화\n`;
    text += '='.repeat(40) + '\n\n';

    const seatLayout = assignment.seatLayout;
    
    // 열 번호 헤더
    text += '   ';
    for (let col = 0; col < seatLayout[0].length; col++) {
      text += `${(col + 1).toString().padStart(3)} `;
    }
    text += '\n';

    // 각 행 표시
    for (let row = 0; row < seatLayout.length; row++) {
      text += `${(row + 1).toString().padStart(2)} `;
      
      for (let col = 0; col < seatLayout[row].length; col++) {
        const seat = seatLayout[row][col];
        
        if (!seat.isActive) {
          text += ' × '; // 비활성화된 좌석
        } else if (seat.student) {
          // 학생 이름의 첫 글자 또는 번호 표시
          const displayName = seat.student.name.length > 2 ? 
            seat.student.name.substring(0, 2) : seat.student.name;
          text += displayName.padStart(3);
        } else {
          text += ' ○ '; // 빈 좌석
        }
        text += ' ';
      }
      text += '\n';
    }

    text += '\n범례: ○ = 빈 좌석, × = 비활성화, 이름/번호 = 배정된 학생\n';

    return text;
  }
}

// 전역으로 클래스를 내보냄 (모듈 시스템 미사용 환경)
if (typeof window !== 'undefined') {
  window.LotteryEngine = LotteryEngine;
}