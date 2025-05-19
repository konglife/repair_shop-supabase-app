import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  last_login: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

// interface AuthState ถูกลบออกเนื่องจากไม่ได้ใช้งาน

export function useAuth() {
  const router = useRouter();

  // สถานะการตรวจสอบสิทธิ์
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const isInitialized = ref<boolean>(false);

  // computed properties
  const isLoggedIn = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  /**
   * ตรวจสอบสถานะการเข้าสู่ระบบเมื่อเริ่มต้น
   */
  const initialize = async () => {
    if (isInitialized.value) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      // ดึงข้อมูล token จาก localStorage
      const savedToken = localStorage.getItem('auth_token');
      if (!savedToken) {
        return;
      }
      
      token.value = savedToken;
      
      // ดึงข้อมูลผู้ใช้จาก API หรือ localStorage
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        user.value = JSON.parse(savedUser);
      } else {
        // ถ้าไม่มีข้อมูลผู้ใช้ใน localStorage แต่มี token ให้ดึงข้อมูลผู้ใช้จาก API
        await fetchUserProfile();
      }
    } catch (err: any) {
      console.error('Failed to initialize auth:', err);
      error.value = 'ไม่สามารถดึงข้อมูลผู้ใช้ได้';
      logout();
    } finally {
      loading.value = false;
      isInitialized.value = true;
    }
  };

  /**
   * ดึงข้อมูลผู้ใช้จาก API
   */
  const fetchUserProfile = async () => {
    if (!token.value) {
      throw new Error('No auth token');
    }
    
    // ในสถานการณ์จริง คุณจะเรียก API เพื่อดึงข้อมูลผู้ใช้
    // ตัวอย่างเช่น:
    // const response = await fetch('/api/user/profile', {
    //   headers: {
    //     'Authorization': `Bearer ${token.value}`
    //   }
    // });
    // const data = await response.json();
    // user.value = data.user;
    
    // สำหรับตัวอย่างนี้ เราจะใช้ข้อมูลจำลอง
    user.value = {
      id: '1',
      email: 'user@example.com',
      name: 'ผู้ใช้งานตัวอย่าง',
      avatar_url: null,
      role: 'user',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    };
    
    // บันทึกข้อมูลผู้ใช้ลงใน localStorage
    localStorage.setItem('auth_user', JSON.stringify(user.value));
  };

  /**
   * เข้าสู่ระบบ
   * @param credentials ข้อมูลสำหรับเข้าสู่ระบบ (email, password)
   */
  const login = async (credentials: LoginCredentials) => {
    loading.value = true;
    error.value = null;
    
    try {
      // ในสถานการณ์จริง คุณจะเรียก API เพื่อเข้าสู่ระบบ
      // ตัวอย่างเช่น:
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(credentials)
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   throw new Error(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      // }
      // token.value = data.token;
      // user.value = data.user;
      
      // สำหรับตัวอย่างนี้ เราจะใช้ข้อมูลจำลอง
      // ตรวจสอบว่า email และ password ถูกต้องหรือไม่
      if (credentials.email !== 'user@example.com' || credentials.password !== 'password') {
        throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
      
      // สร้าง token จำลอง
      token.value = 'fake_jwt_token_' + Math.random().toString(36).substring(2);
      
      // บันทึก token ลงใน localStorage
      localStorage.setItem('auth_token', token.value);
      
      // ดึงข้อมูลผู้ใช้
      await fetchUserProfile();
      
      // นำทางไปยังหน้าหลัก
      router.push('/');
      
      return true;
    } catch (err: any) {
      console.error('Login failed:', err);
      error.value = err.message || 'เข้าสู่ระบบไม่สำเร็จ';
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * ลงทะเบียนผู้ใช้ใหม่
   * @param data ข้อมูลสำหรับลงทะเบียน (email, password, name)
   */
  const register = async (data: RegisterData) => {
    loading.value = true;
    error.value = null;
    
    try {
      // ในสถานการณ์จริง คุณจะเรียก API เพื่อลงทะเบียน
      // ตัวอย่างเช่น:
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(data)
      // });
      // const responseData = await response.json();
      // if (!response.ok) {
      //   throw new Error(responseData.message || 'ลงทะเบียนไม่สำเร็จ');
      // }
      
      // สำหรับตัวอย่างนี้ เราจะใช้ข้อมูลจำลอง
      // ตรวจสอบว่า email ซ้ำหรือไม่
      if (data.email === 'user@example.com') {
        throw new Error('อีเมลนี้ถูกใช้งานแล้ว');
      }
      
      // สร้าง token จำลอง
      token.value = 'fake_jwt_token_' + Math.random().toString(36).substring(2);
      
      // สร้างข้อมูลผู้ใช้
      user.value = {
        id: Math.random().toString(36).substring(2),
        email: data.email,
        name: data.name || null,
        avatar_url: null,
        role: 'user',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };
      
      // บันทึกข้อมูลลงใน localStorage
      localStorage.setItem('auth_token', token.value);
      localStorage.setItem('auth_user', JSON.stringify(user.value));
      
      // นำทางไปยังหน้าหลัก
      router.push('/');
      
      return true;
    } catch (err: any) {
      console.error('Registration failed:', err);
      error.value = err.message || 'ลงทะเบียนไม่สำเร็จ';
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * ออกจากระบบ
   */
  const logout = () => {
    // ลบข้อมูลผู้ใช้และ token
    user.value = null;
    token.value = null;
    
    // ลบข้อมูลจาก localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // นำทางไปยังหน้าเข้าสู่ระบบ
    router.push('/login');
  };

  /**
   * เปลี่ยนรหัสผ่าน
   * @param oldPassword รหัสผ่านเดิม
   * @param newPassword รหัสผ่านใหม่
   */
  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!isLoggedIn.value) {
      throw new Error('ไม่ได้เข้าสู่ระบบ');
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      // ในสถานการณ์จริง คุณจะเรียก API เพื่อเปลี่ยนรหัสผ่าน
      // ตัวอย่างเช่น:
      // const response = await fetch('/api/auth/change-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token.value}`
      //   },
      //   body: JSON.stringify({ oldPassword, newPassword })
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   throw new Error(data.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
      // }
      
      // สำหรับตัวอย่างนี้ เราจะใช้ข้อมูลจำลอง
      // ตรวจสอบว่ารหัสผ่านเดิมถูกต้องหรือไม่
      if (oldPassword !== 'password') {
        throw new Error('รหัสผ่านเดิมไม่ถูกต้อง');
      }
      
      // ตรวจสอบว่ารหัสผ่านใหม่ตรงตามเงื่อนไขหรือไม่
      if (newPassword.length < 8) {
        throw new Error('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      }
      
      return true;
    } catch (err: any) {
      console.error('Change password failed:', err);
      error.value = err.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ';
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * ตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงหน้านี้หรือไม่
   * @param requiredRole บทบาทที่ต้องการ (ถ้าไม่ระบุ จะตรวจสอบเฉพาะว่าเข้าสู่ระบบแล้วหรือไม่)
   */
  const checkAccess = (requiredRole?: string) => {
    if (!isLoggedIn.value) {
      return false;
    }
    
    if (requiredRole && user.value?.role !== requiredRole) {
      return false;
    }
    
    return true;
  };

  // เริ่มต้นตรวจสอบสถานะการเข้าสู่ระบบ
  initialize();

  return {
    // State
    user,
    token,
    loading,
    error,
    isLoggedIn,
    isAdmin,
    
    // Methods
    login,
    register,
    logout,
    changePassword,
    checkAccess,
    fetchUserProfile,
  };
}
