<template>
  <div>
    <h1>員工選單與座位表</h1>
    <div>
      <!-- 顯示選單 -->
      <h2>員工選單</h2>
      <label for="employeeSelect">Select an employee:</label>
      <select id="employeeSelect" v-model="selectedEmployee">
        <option v-for="employee in employees" :key="employee.EMP_ID" :value="employee.EMP_ID">
          {{ employee.NAME }} ({{ employee.EMP_ID }})
        </option>
      </select>

      <button @click="assignSeat">確認</button>
    </div>

  <!-- 顯示座位表 -->
    <div>
      <h2>座位表</h2>
      <div class="seating-chart">
        <!-- 座位表內容 -->
        <div v-for="floor in floorSeats" :key="floor.FLOOR_NO" class="floor-row">
          <div v-for="seat in floor.seats" 
            :key="`${floor.FLOOR_NO}-${seat.SEAT_NO}`" 
            @click="seatClicked(floor.FLOOR_NO, seat.SEAT_NO)"
            :class="{ 'selected-seat': isSelected(floor.FLOOR_NO, seat.SEAT_NO) }"
            :style="{ 'background-color': floor.floorSeatSeq && floor.floorSeatSeq.every(seq => seq !== '0') ? 'red' : 'selected-seat' }"
            class="floorAndSeat">
            <span v-if="floor.floorSeatSeq && floor.floorSeatSeq.every(seq => seq !== '0')">
              樓層{{ floor.FLOOR_NO }} 座號 {{ seat.SEAT_NO }} [員編: {{ floor.floorSeatSeq }}]
            </span>
            <span v-else>
              樓層{{ floor.FLOOR_NO }} 座號 {{ seat.SEAT_NO }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="frame">
    <div class="haveseat"></div><div>空位</div>
  </div>
  <div class="frame">
    <div class="noseat"></div><div>已佔用</div>
  </div>
  <div class="frame">
    <div class="choice"></div><div>請選擇</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      employees: [],
      seatingChart: [],
      selectedEmployee: null,
      selectedSeats: [],
    };
  },
  computed: {
    floorSeats() {
      const floorSeats = {};
      const floorSeatSeq = [];

      this.seatingChart.forEach((seat) => {
        if (!floorSeats[seat.FLOOR_NO]) {
          floorSeats[seat.FLOOR_NO] = { FLOOR_NO: seat.FLOOR_NO, seats: [] };
        }
        floorSeats[seat.FLOOR_NO].seats.push(seat);
        // 將 FLOOR_SEAT_SEQ 的資料存到 floorSeatSeq 中
        floorSeatSeq.push(seat.FLOOR_SEAT_SEQ);
      });

      // console.log(floorSeats);
      // console.log(floorSeatSeq);
      return Object.values(floorSeats);
    },
  },
  methods: {
    // 將員工資料表的資料匯入選單中
    async fetchEmployees() {
      try {
        const response = await axios.get('http://localhost:8080/api/employees');
        this.employees = response.data;
      } catch (error) {
        console.error('無法取得員工資料:', error);
      }
    },
    // 將座位資料表的資料匯入座位表中
    async fetchSeatingChart() {
      try {
        const response = await axios.get('http://localhost:8080/api/seats');
        this.seatingChart = response.data;
        // console.log(this.seatingChart);
      } catch (error) {
        console.error('無法取得座位表:', error);
      }
    },
    // 實現點擊按鈕後，可以同步更新後端資料庫中的資訊
    async assignSeat() {
      if (this.selectedEmployee) {
        try {
          const selectedSeat = this.getSelectedSeat();

          if (selectedSeat.EMP_ID === '0') {
            selectedSeat.EMP_ID = this.selectedEmployee;

            await axios.put(`/api/seats/${selectedSeat.EMP_ID}`, {
              FLOOR_NO: selectedSeat.FLOOR_NO,
              SEAT_NO: selectedSeat.SEAT_NO,
            });

            this.fetchSeatingChart();
          } else {
            alert('請選擇位置');
          }
        } catch (error) {
          console.error('Error assigning seat:', error);
        }
      } else {
        alert('請選先選擇想要填入的職員');
      }
    },

    // 會回傳使用者所選擇的那個位置
    getSelectedSeat() {
      const selectedFloorSeatSeq = this.selectedSeats[0];
      console.log(selectedFloorSeatSeq);
      return this.seatingChart.find(seat=>seat.FLOOR_SEAT_SEQ === selectedFloorSeatSeq);
    },

    // 讓被選擇的座位顏色變綠色
    isSelected(floorNo, seatNo){
      return this.selectedSeats.some(seat=>seat.floorNo===floorNo && seat.seatNo === seatNo);
    },
    //
    seatClicked(floorNo, seatNo) {
      const index = this.selectedSeats.findIndex(seat => seat.floorNo === floorNo && seat.seatNo === seatNo);
  
      // 檢查是否已經選擇座位
      if (this.selectedSeats.length > 0) {
        // 如果點擊的是已經選擇的座位，則取消選擇
        if (index !== -1) {
          this.selectedSeats.splice(index, 1);
        } else {
          alert('每人只能點擊一個座位');
        }
      } else {
        // 新的座位被選擇，添加到 selectedSeats 陣列中
        this.selectedSeats.push({ floorNo, seatNo });
      }
    },
  },
  // 開始將資料庫中的資料導入前端
  mounted() {
    this.fetchEmployees();
    this.fetchSeatingChart();
  },
};
</script>

<style scoped>
/* 可以在這裡添加一些局部樣式 */
.frame {
  display: flex;
}

.haveseat {
  background-color: rgb(209, 209, 209);
  width: 20px;
  height: 20px;
  position: relative;
  border-radius: 20%;
}

.noseat {
  background-color: rgb(211, 2, 2);
  width: 20px;
  height: 20px;
  position: relative;
  border-radius: 20%;
}

.choice {
  background-color: rgb(51, 255, 0);
  width: 20px;
  height: 20px;
  position: relative;
  border-radius: 20%;
}
.seating-chart {
  display: flex;
  flex-direction: column; /* 垂直排列 */
}

.floor-row {
  display: flex;
}

.floor-title, .floor-row div {
  flex: 1;
  text-align: center;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 5%;
  margin: 5px;
}

.floorAndSeat {
  background-color: #f0f0f0; /* 標題行背景色 */
}

.floor-row div {
  cursor: pointer;
}
.selected-seat {
  background-color: rgb(51, 255, 0);
}
</style>
