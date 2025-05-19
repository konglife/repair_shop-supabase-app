<script setup lang="ts">
import { ref } from 'vue';

// สถิติต่างๆ สำหรับแดชบอร์ด (ใช้ข้อมูลจำลองก่อน)
const stats = ref([
  { title: 'ลูกค้าทั้งหมด', value: 142, icon: 'mdi-account-group', color: 'primary' },
  { title: 'งานซ่อมวันนี้', value: 24, icon: 'mdi-wrench', color: 'success' },
  { title: 'รอดำเนินการ', value: 18, icon: 'mdi-clock-outline', color: 'warning' },
  { title: 'รายได้เดือนนี้', value: '฿168,420', icon: 'mdi-currency-usd', color: 'info' },
]);

// ข้อมูลงานล่าสุด (ใช้ข้อมูลจำลอง)
const recentRepairs = ref([
  { id: 'R001', customer: 'คุณสมชาย จริงใจ', device: 'iPhone 13 Pro', status: 'เสร็จสิ้น', date: '15/05/2025' },
  { id: 'R002', customer: 'คุณสมหญิง ใจดี', device: 'MacBook Air M1', status: 'กำลังซ่อม', date: '14/05/2025' },
  { id: 'R003', customer: 'คุณประเสริฐ มีชัย', device: 'Samsung Galaxy S22', status: 'รอชิ้นส่วน', date: '13/05/2025' },
  { id: 'R004', customer: 'คุณนิภา รักสงบ', device: 'iPad Mini 6', status: 'รอดำเนินการ', date: '12/05/2025' },
  { id: 'R005', customer: 'คุณวิชัย ใจเย็น', device: 'Asus ROG', status: 'เสร็จสิ้น', date: '11/05/2025' },
]);

// กราฟข้อมูล (ในเวอร์ชันจริงอาจใช้ chart.js หรือไลบรารีอื่นๆ)
const chartTitle = ref('สถิติรายได้ประจำเดือน');

// สถานะของงานซ่อม
const repairStatusCounts = ref([
  { status: 'เสร็จสิ้น', count: 65, color: 'success' },
  { status: 'กำลังซ่อม', count: 24, color: 'info' },
  { status: 'รอชิ้นส่วน', count: 12, color: 'warning' },
  { status: 'รอดำเนินการ', count: 18, color: 'error' },
]);

// คำนวณเปอร์เซ็นต์สำหรับแสดงในกราฟวงกลม
const calculatePercentage = (count: number) => {
  const total = repairStatusCounts.value.reduce((acc, item) => acc + item.count, 0);
  return Math.round((count / total) * 100);
};
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">แดชบอร์ด</h1>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row>
      <v-col v-for="(stat, index) in stats" :key="index" cols="12" sm="6" md="3">
        <v-card :color="stat.color" theme="dark" class="mb-4">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-overline mb-1">{{ stat.title }}</div>
                <div class="text-h4">{{ stat.value }}</div>
              </div>
              <v-icon size="x-large">{{ stat.icon }}</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Recent Repairs Table -->
      <v-col cols="12" lg="8">
        <v-card class="mb-4">
          <v-card-title class="text-h6">
            งานซ่อมล่าสุด
            <v-spacer></v-spacer>
            <v-btn variant="text" color="primary" size="small">
              ดูทั้งหมด
              <v-icon end>mdi-chevron-right</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>รหัส</th>
                  <th>ลูกค้า</th>
                  <th>อุปกรณ์</th>
                  <th>สถานะ</th>
                  <th>วันที่</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="repair in recentRepairs" :key="repair.id">
                  <td>{{ repair.id }}</td>
                  <td>{{ repair.customer }}</td>
                  <td>{{ repair.device }}</td>
                  <td>
                    <v-chip 
                      :color="repair.status === 'เสร็จสิ้น' ? 'success' : 
                              repair.status === 'กำลังซ่อม' ? 'info' : 
                              repair.status === 'รอชิ้นส่วน' ? 'warning' : 'error'"
                      size="small"
                      variant="outlined"
                    >
                      {{ repair.status }}
                    </v-chip>
                  </td>
                  <td>{{ repair.date }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Status Distribution -->
      <v-col cols="12" lg="4">
        <v-card class="mb-4" height="100%">
          <v-card-title class="text-h6">สถานะงานซ่อม</v-card-title>
          <v-card-text>
            <div class="text-center mb-4">
              <!-- เมื่อมีการใช้งานจริงอาจใช้ chart.js หรือไลบรารีอื่นๆ -->
              <v-avatar size="200" color="grey-lighten-3" class="mb-4">
                <v-icon size="100" color="grey">mdi-chart-pie</v-icon>
              </v-avatar>
            </div>

            <v-list density="compact">
              <v-list-item v-for="item in repairStatusCounts" :key="item.status">
                <template v-slot:prepend>
                  <v-icon :color="item.color">mdi-checkbox-blank-circle</v-icon>
                </template>
                <v-list-item-title>{{ item.status }}</v-list-item-title>
                <template v-slot:append>
                  <span class="text-body-2">{{ item.count }} ({{ calculatePercentage(item.count) }}%)</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Revenue Chart -->
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h6">
            {{ chartTitle }}
            <v-spacer></v-spacer>
            <v-btn-toggle 
              density="comfortable" 
              variant="outlined"
              rounded
              mandatory
              color="primary"
            >
              <v-btn value="day">วัน</v-btn>
              <v-btn value="week">สัปดาห์</v-btn>
              <v-btn value="month">เดือน</v-btn>
              <v-btn value="year">ปี</v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text style="height: 300px" class="d-flex justify-center align-center">
            <!-- ตรงนี้จะเป็นที่สำหรับแสดงกราฟในเวอร์ชันจริง -->
            <v-icon size="100" color="grey-lighten-2">mdi-chart-line</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
/* ไม่จำเป็นต้องใช้ CSS เพิ่มเติมเนื่องจาก Vuetify จัดการสไตล์ให้หมดแล้ว */
</style>
