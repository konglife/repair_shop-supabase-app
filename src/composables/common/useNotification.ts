import { ref, reactive } from 'vue';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationOptions {
  message: string;
  type?: NotificationType;
  timeout?: number;
  position?: 'top' | 'bottom';
  closable?: boolean;
}

interface NotificationState {
  show: boolean;
  message: string;
  type: NotificationType;
  timeout: number;
  position: 'top' | 'bottom';
  closable: boolean;
}

// สร้าง singleton state สำหรับใช้ทั่วทั้งแอปพลิเคชัน
const state = reactive<NotificationState>({
  show: false,
  message: '',
  type: 'info',
  timeout: 3000,
  position: 'top',
  closable: true,
});

// จำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
const unreadCount = ref<number>(0);

/**
 * Composable สำหรับจัดการการแสดงการแจ้งเตือน
 */
export function useNotification() {
  /**
   * แสดงการแจ้งเตือน
   * @param options ตัวเลือกสำหรับการแจ้งเตือน
   */
  const notify = (options: NotificationOptions | string) => {
    // ถ้าเป็น string ให้แปลงเป็น options object
    const opts = typeof options === 'string' 
      ? { message: options } 
      : options;
    
    // อัปเดต state
    state.show = true;
    state.message = opts.message;
    state.type = opts.type || 'info';
    state.timeout = opts.timeout !== undefined ? opts.timeout : 3000;
    state.position = opts.position || 'top';
    state.closable = opts.closable !== undefined ? opts.closable : true;
    
    // ถ้า timeout > 0 ให้ซ่อนการแจ้งเตือนหลังจากเวลาที่กำหนด
    if (state.timeout > 0) {
      setTimeout(() => {
        state.show = false;
      }, state.timeout);
    }
  };
  
  /**
   * แสดงการแจ้งเตือนประเภท success
   * @param message ข้อความที่ต้องการแสดง
   * @param options ตัวเลือกเพิ่มเติม
   */
  const success = (message: string, options: Partial<NotificationOptions> = {}) => {
    notify({ ...options, message, type: 'success' });
  };
  
  /**
   * แสดงการแจ้งเตือนประเภท error
   * @param message ข้อความที่ต้องการแสดง
   * @param options ตัวเลือกเพิ่มเติม
   */
  const error = (message: string, options: Partial<NotificationOptions> = {}) => {
    notify({ ...options, message, type: 'error' });
  };
  
  /**
   * แสดงการแจ้งเตือนประเภท info
   * @param message ข้อความที่ต้องการแสดง
   * @param options ตัวเลือกเพิ่มเติม
   */
  const info = (message: string, options: Partial<NotificationOptions> = {}) => {
    notify({ ...options, message, type: 'info' });
  };
  
  /**
   * แสดงการแจ้งเตือนประเภท warning
   * @param message ข้อความที่ต้องการแสดง
   * @param options ตัวเลือกเพิ่มเติม
   */
  const warning = (message: string, options: Partial<NotificationOptions> = {}) => {
    notify({ ...options, message, type: 'warning' });
  };
  
  /**
   * ปิดการแจ้งเตือน
   */
  const close = () => {
    state.show = false;
  };
  
  /**
   * เพิ่มจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
   * @param count จำนวนที่ต้องการเพิ่ม (default: 1)
   */
  const increaseUnreadCount = (count: number = 1) => {
    unreadCount.value += count;
  };
  
  /**
   * ลดจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
   * @param count จำนวนที่ต้องการลด (default: 1)
   */
  const decreaseUnreadCount = (count: number = 1) => {
    unreadCount.value = Math.max(0, unreadCount.value - count);
  };
  
  /**
   * รีเซ็ตจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
   */
  const resetUnreadCount = () => {
    unreadCount.value = 0;
  };
  
  return {
    // State
    state,
    unreadCount,
    
    // Methods
    notify,
    success,
    error,
    info,
    warning,
    close,
    increaseUnreadCount,
    decreaseUnreadCount,
    resetUnreadCount,
  };
}
