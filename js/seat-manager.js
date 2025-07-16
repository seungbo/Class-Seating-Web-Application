/**
 * 좌석 관리 클래스
 * 좌석 배치 생성, 활성화/비활성화, 검증 기능을 제공합니다.
 */
class SeatManager {
  constructor(storageManager) {
    this.storageManager = storageManager;
    const loadedLayout = this.storageManager.loadSeatLayout();
    this.seatLayout = loadedLayout ? loadedLayout.map(row => row.map(s => Seat.fromJSON(s))) : [];
    this.rows = 0;
    this.cols = 0;
    
    this.ERROR_MESSAGES = {
      INVALID_DIMENSIONS: '올바른 행과 열 수를 입력해주세요.',
      INVALID_POSITION: '유효하지 않은 좌석 위치입니다.',
      LAYOUT_NOT_CREATED: '좌석 배치가 생성되지 않았습니다.',
      INSUFFICIENT_SEATS: '활성화된 좌석 수가 학생 수보다 적습니다.',
      SAVE_FAILED: '좌석 배치 저장에 실패했습니다.',
      LOAD_FAILED: '좌석 배치 로드에 실패했습니다.'
    };
    
    // 저장된 좌석 배치 로드
    this.loadSeatLayout();
  }

  /**
   * 저장된 좌석 배치 로드
   */
  loadSeatLayout() {
    try {
      const savedLayout = this.storageManager.loadSeatLayout();
      if (savedLayout && Array.isArray(savedLayout) && savedLayout.length > 0) {
        this.seatLayout = savedLayout.map(row => 
          row.map(seatData => Seat.fromJSON(seatData))
        );
        this.rows = this.seatLayout.length;
        this.cols = this.seatLayout[0].length;
      }
    } catch (error) {
      console.error('Failed to load seat layout:', error);
      this.seatLayout = [];
      this.rows = 0;
      this.cols = 0;
    }
  }

  /**
   * 좌석 배치 생성
   * @param {number} rows - 행 수
   * @param {number} cols - 열 수
   * @returns {Object} 결과 {success: boolean, layout: Seat[][]|null, error: string|null}
   */
  createLayout(rows, cols) {
    // 입력 검증
    if (!this.validateDimensions(rows, cols)) {
      return {
        success: false,
        layout: null,
        error: this.ERROR_MESSAGES.INVALID_DIMENSIONS
      };
    }

    try {
      // 새로운 좌석 배치 생성
      const newLayout = [];
      
      for (let row = 0; row < rows; row++) {
        const seatRow = [];
        for (let col = 0; col < cols; col++) {
          const seat = new Seat(row, col, true, null);
          seatRow.push(seat);
        }
        newLayout.push(seatRow);
      }

      // 상태 업데이트
      this.seatLayout = newLayout;
      this.rows = rows;
      this.cols = cols;

      // 저장
      this.saveSeatLayout();

      return {
        success: true,
        layout: this.getSeatLayout(),
        error: null
      };
    } catch (error) {
      console.error('Failed to create seat layout:', error);
      return {
        success: false,
        layout: null,
        error: this.ERROR_MESSAGES.SAVE_FAILED
      };
    }
  }

  /**
   * 좌석 활성화/비활성화 토글
   * @param {number} row - 행 번호 (0부터 시작)
   * @param {number} col - 열 번호 (0부터 시작)
   * @returns {Object} 결과 {success: boolean, seat: Seat|null, error: string|null}
   */
  toggleSeat(row, col) {
    if (!this.validatePosition(row, col)) {
      return {
        success: false,
        seat: null,
        error: this.ERROR_MESSAGES.INVALID_POSITION
      };
    }

    if (!this.hasLayout()) {
      return {
        success: false,
        seat: null,
        error: this.ERROR_MESSAGES.LAYOUT_NOT_CREATED
      };
    }

    try {
      const seat = this.seatLayout[row][col];
      seat.setActive(!seat.isActive);
      
      // 저장
      this.saveSeatLayout();

      return {
        success: true,
        seat: seat,
        error: null
      };
    } catch (error) {
      console.error('Failed to toggle seat:', error);
      return {
        success: false,
        seat: null,
        error: this.ERROR_MESSAGES.SAVE_FAILED
      };
    }
  }

  /**
   * 좌석 활성화 상태 설정
   * @param {number} row - 행 번호
   * @param {number} col - 열 번호
   * @param {boolean} isActive - 활성화 상태
   * @returns {Object} 결과 {success: boolean, seat: Seat|null, error: string|null}
   */
  setSeatActive(row, col, isActive) {
    if (!this.validatePosition(row, col)) {
      return {
        success: false,
        seat: null,
        error: this.ERROR_MESSAGES.INVALID_POSITION
      };
    }

    if (!this.hasLayout()) {
      return {
        success: false,
        seat: null,
        error: this.ERROR_MESSAGES.LAYOUT_NOT_CREATED
      };
    }

    try {
      const seat = this.seatLayout[row][col];
      seat.setActive(isActive);
      
      // 저장
      this.saveSeatLayout();

      return {
        success: true,
        seat: seat,
        error: null
      };
    } catch (error) {
      console.error('Failed to set seat active state:', error);
      return {
        success: false,
        seat: null,
        error: this.ERROR_MESSAGES.SAVE_FAILED
      };
    }
  }

  /**
   * 사용 가능한 좌석 목록 조회
   * @returns {Seat[]} 활성화된 좌석 배열
   */
  getAvailableSeats() {
    if (!this.hasLayout()) {
      return [];
    }

    const availableSeats = [];
    
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const seat = this.seatLayout[row][col];
        if (seat.isActive) {
          availableSeats.push(seat);
        }
      }
    }

    return availableSeats;
  }

  /**
   * 사용 가능한 좌석 수 계산
   * @returns {number} 활성화된 좌석 수
   */
  getAvailableSeatCount() {
    return this.getAvailableSeats().length;
  }

  /**
   * 전체 좌석 수 조회
   * @returns {number} 전체 좌석 수
   */
  getTotalSeatCount() {
    return this.rows * this.cols;
  }

  /**
   * 좌석 배치 검증 (학생 수와 비교)
   * @param {number} studentCount - 학생 수
   * @returns {Object} 검증 결과 {isValid: boolean, availableSeats: number, error: string|null}
   */
  validateLayout(studentCount) {
    if (!this.hasLayout()) {
      return {
        isValid: false,
        availableSeats: 0,
        error: this.ERROR_MESSAGES.LAYOUT_NOT_CREATED
      };
    }

    const availableSeatCount = this.getAvailableSeatCount();
    
    if (availableSeatCount < studentCount) {
      return {
        isValid: false,
        availableSeats: availableSeatCount,
        error: this.ERROR_MESSAGES.INSUFFICIENT_SEATS
      };
    }

    return {
      isValid: true,
      availableSeats: availableSeatCount,
      error: null
    };
  }

  /**
   * 좌석 배치가 존재하는지 확인
   * @returns {boolean} 배치 존재 여부
   */
  hasLayout() {
    return this.seatLayout.length > 0 && this.rows > 0 && this.cols > 0;
  }

  /**
   * 현재 좌석 배치 조회 (복사본)
   * @returns {Seat[][]} 좌석 배치 2차원 배열
   */
  getSeatLayout() {
    if (!this.hasLayout()) {
      return [];
    }

    // 깊은 복사본 반환
    return this.seatLayout.map(row => 
      row.map(seat => new Seat(seat.row, seat.col, seat.isActive, seat.student))
    );
  }

  /**
   * 특정 좌석 조회
   * @param {number} row - 행 번호
   * @param {number} col - 열 번호
   * @returns {Seat|null} 좌석 객체 또는 null
   */
  getSeat(row, col) {
    if (!this.validatePosition(row, col) || !this.hasLayout()) {
      return null;
    }

    return this.seatLayout[row][col];
  }

  /**
   * 좌석 배치 차원 정보 조회
   * @returns {Object} 차원 정보 {rows: number, cols: number, total: number}
   */
  getDimensions() {
    return {
      rows: this.rows,
      cols: this.cols,
      total: this.getTotalSeatCount()
    };
  }

  /**
   * 좌석 배치 통계 정보 조회
   * @returns {Object} 통계 정보
   */
  getStatistics() {
    if (!this.hasLayout()) {
      return {
        totalSeats: 0,
        activeSeats: 0,
        inactiveSeats: 0,
        occupiedSeats: 0,
        emptySeats: 0,
        activationRate: 0,
        occupancyRate: 0
      };
    }

    const totalSeats = this.getTotalSeatCount();
    const activeSeats = this.getAvailableSeatCount();
    const inactiveSeats = totalSeats - activeSeats;
    
    let occupiedSeats = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const seat = this.seatLayout[row][col];
        if (seat.isActive && !seat.isEmpty()) {
          occupiedSeats++;
        }
      }
    }
    
    const emptySeats = activeSeats - occupiedSeats;

    return {
      totalSeats: totalSeats,
      activeSeats: activeSeats,
      inactiveSeats: inactiveSeats,
      occupiedSeats: occupiedSeats,
      emptySeats: emptySeats,
      activationRate: totalSeats > 0 ? Math.round((activeSeats / totalSeats) * 100) : 0,
      occupancyRate: activeSeats > 0 ? Math.round((occupiedSeats / activeSeats) * 100) : 0
    };
  }

  /**
   * 모든 좌석 활성화
   * @returns {Object} 결과 {success: boolean, error: string|null}
   */
  activateAllSeats() {
    if (!this.hasLayout()) {
      return {
        success: false,
        error: this.ERROR_MESSAGES.LAYOUT_NOT_CREATED
      };
    }

    try {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          this.seatLayout[row][col].setActive(true);
        }
      }

      this.saveSeatLayout();

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Failed to activate all seats:', error);
      return {
        success: false,
        error: this.ERROR_MESSAGES.SAVE_FAILED
      };
    }
  }

  /**
   * 모든 좌석 비활성화
   * @returns {Object} 결과 {success: boolean, error: string|null}
   */
  deactivateAllSeats() {
    if (!this.hasLayout()) {
      return {
        success: false,
        error: this.ERROR_MESSAGES.LAYOUT_NOT_CREATED
      };
    }

    try {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          this.seatLayout[row][col].setActive(false);
        }
      }

      this.saveSeatLayout();

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Failed to deactivate all seats:', error);
      return {
        success: false,
        error: this.ERROR_MESSAGES.SAVE_FAILED
      };
    }
  }

  /**
   * 좌석 배치 초기화
   * @returns {Object} 결과 {success: boolean, error: string|null}
   */
  clearLayout() {
    try {
      this.seatLayout = [];
      this.rows = 0;
      this.cols = 0;
      
      // 저장소에서도 제거
      this.storageManager.saveData(this.storageManager.STORAGE_KEYS.SEAT_LAYOUT, null);

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Failed to clear seat layout:', error);
      return {
        success: false,
        error: this.ERROR_MESSAGES.SAVE_FAILED
      };
    }
  }

  /**
   * 차원 검증
   * @param {number} rows - 행 수
   * @param {number} cols - 열 수
   * @returns {boolean} 유효성 여부
   */
  validateDimensions(rows, cols) {
    return Number.isInteger(rows) && 
           Number.isInteger(cols) && 
           rows > 0 && 
           cols > 0 && 
           rows <= 20 && 
           cols <= 20; // 최대 20x20 제한
  }

  /**
   * 좌석 위치 검증
   * @param {number} row - 행 번호
   * @param {number} col - 열 번호
   * @returns {boolean} 유효성 여부
   */
  validatePosition(row, col) {
    return Number.isInteger(row) && 
           Number.isInteger(col) && 
           row >= 0 && 
           col >= 0 && 
           row < this.rows && 
           col < this.cols;
  }

  /**
   * 좌석 배치 데이터 저장
   */
  saveSeatLayout() {
    try {
      if (this.hasLayout()) {
        this.storageManager.saveSeatLayout(this.seatLayout);
      }
    } catch (error) {
      console.error('Failed to save seat layout:', error);
      throw error;
    }
  }

  /**
   * 좌석 배치를 텍스트로 내보내기
   * @returns {string} 텍스트 형태의 좌석 배치
   */
  exportToText() {
    if (!this.hasLayout()) {
      return '좌석 배치가 생성되지 않았습니다.';
    }

    const stats = this.getStatistics();
    let text = `좌석 배치 (${this.rows}행 × ${this.cols}열)\n`;
    text += '='.repeat(40) + '\n\n';

    // 좌석 배치 시각화
    for (let row = 0; row < this.rows; row++) {
      let rowText = `${row + 1}행: `;
      for (let col = 0; col < this.cols; col++) {
        const seat = this.seatLayout[row][col];
        if (seat.isActive) {
          rowText += seat.isEmpty() ? '○ ' : '● ';
        } else {
          rowText += '× ';
        }
      }
      text += rowText + '\n';
    }

    text += '\n범례: ○ = 활성화된 빈 좌석, ● = 학생이 배정된 좌석, × = 비활성화된 좌석\n\n';
    text += '-'.repeat(30) + '\n';
    text += `전체 좌석: ${stats.totalSeats}개\n`;
    text += `활성화된 좌석: ${stats.activeSeats}개\n`;
    text += `비활성화된 좌석: ${stats.inactiveSeats}개\n`;
    text += `활성화율: ${stats.activationRate}%\n`;

    return text;
  }
}

// 전역으로 클래스를 내보냄 (모듈 시스템 미사용 환경)
if (typeof window !== 'undefined') {
  window.SeatManager = SeatManager;
}