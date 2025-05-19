import { ref, reactive } from 'vue';

interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  persistent?: boolean;
  width?: number | string;
}

interface ConfirmationState {
  show: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'info' | 'warning' | 'error' | 'success';
  persistent: boolean;
  width: number | string;
  resolvePromise: ((value: boolean) => void) | null;
}

// สร้าง state แบบ global เพื่อให้ทุก component ใช้ state เดียวกัน
const state = reactive<ConfirmationState>({
  show: false,
  title: 'ยืนยันการทำงาน',
  message: '',
  confirmText: 'ยืนยัน',
  cancelText: 'ยกเลิก',
  type: 'info',
  persistent: true,
  width: 400,
  resolvePromise: null,
});

// สถานะกำลังโหลดแบบ global
const loading = ref(false);

export function useConfirmation() {

  /**
   * แสดง confirmation dialog
   * @param options ตัวเลือกสำหรับ dialog
   * @returns Promise ที่จะ resolve เมื่อผู้ใช้ตอบ (true = ยืนยัน, false = ยกเลิก)
   */
  const confirm = (options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      // กำหนดค่า state จาก options
      state.title = options.title || 'ยืนยันการทำงาน';
      state.message = options.message;
      state.confirmText = options.confirmText || 'ยืนยัน';
      state.cancelText = options.cancelText || 'ยกเลิก';
      state.type = options.type || 'info';
      state.persistent = options.persistent !== undefined ? options.persistent : true;
      state.width = options.width || 400;
      state.resolvePromise = resolve;
      state.show = true;
    });
  };

  /**
   * ยืนยันการทำงาน
   */
  const handleConfirm = () => {
    if (state.resolvePromise) {
      state.resolvePromise(true);
      state.resolvePromise = null;
    }
    state.show = false;
  };

  /**
   * ยกเลิกการทำงาน
   */
  const handleCancel = () => {
    if (state.resolvePromise) {
      state.resolvePromise(false);
      state.resolvePromise = null;
    }
    state.show = false;
  };

  /**
   * แสดง confirmation dialog สำหรับการลบข้อมูล
   * @param itemName ชื่อรายการที่ต้องการลบ
   * @returns Promise ที่จะ resolve เมื่อผู้ใช้ตอบ (true = ยืนยัน, false = ยกเลิก)
   */
  const confirmDelete = (itemName: string = 'รายการนี้'): Promise<boolean> => {
    return confirm({
      title: 'ยืนยันการลบข้อมูล',
      message: `คุณต้องการลบ${itemName}ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      confirmText: 'ลบข้อมูล',
      cancelText: 'ยกเลิก',
      type: 'error',
    });
  };

  /**
   * แสดง confirmation dialog สำหรับการบันทึกข้อมูล
   * @param itemName ชื่อรายการที่ต้องการบันทึก
   * @returns Promise ที่จะ resolve เมื่อผู้ใช้ตอบ (true = ยืนยัน, false = ยกเลิก)
   */
  const confirmSave = (itemName: string = 'ข้อมูล'): Promise<boolean> => {
    return confirm({
      title: 'ยืนยันการบันทึกข้อมูล',
      message: `คุณต้องการบันทึก${itemName}ใช่หรือไม่?`,
      confirmText: 'บันทึก',
      cancelText: 'ยกเลิก',
      type: 'info',
    });
  };

  /**
   * แสดง confirmation dialog สำหรับการออกจากหน้าที่มีข้อมูลที่ยังไม่ได้บันทึก
   * @returns Promise ที่จะ resolve เมื่อผู้ใช้ตอบ (true = ยืนยัน, false = ยกเลิก)
   */
  const confirmLeave = (): Promise<boolean> => {
    return confirm({
      title: 'ยืนยันการออกจากหน้านี้',
      message: 'คุณมีข้อมูลที่ยังไม่ได้บันทึก คุณต้องการออกจากหน้านี้โดยไม่บันทึกข้อมูลใช่หรือไม่?',
      confirmText: 'ออกโดยไม่บันทึก',
      cancelText: 'ยกเลิก',
      type: 'warning',
    });
  };

  return {
    // State
    state,
    loading,

    // Methods
    confirm,
    confirmDelete,
    confirmSave,
    confirmLeave,
    handleConfirm,
    handleCancel,
  };
}
