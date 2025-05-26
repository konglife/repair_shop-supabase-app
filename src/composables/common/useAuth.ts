import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/supabaseClient'; // Import Supabase client

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: string; // Assuming 'role' is part of user metadata or a separate table
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

// Singleton state variables defined at the module scope
const user = ref<User | null>(null);
const token = ref<string | null>(null); // Supabase handles token internally, but keep for consistency if needed
const loading = ref<boolean>(false);
const error = ref<string | null>(null);
const isInitialized = ref<boolean>(false);

export function useAuth() {
  const router = useRouter();

  // computed properties (now use module-scoped state)
  const isLoggedIn = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin'); // Assuming role is available on user object
  const isLoading = computed(() => loading.value);

  /**
   * ตรวจสอบสถานะการเข้าสู่ระบบเมื่อเริ่มต้นและฟังการเปลี่ยนแปลงสถานะ
   */
  const initialize = async () => {
    console.log('[useAuth] initialize: Starting.');
    if (isInitialized.value) {
      console.log('[useAuth] initialize: Already initialized, returning.');
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        user.value = { // Map Supabase user to our User interface
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || null,
          avatar_url: session.user.user_metadata?.avatar_url || null,
          role: session.user.user_metadata?.role || 'user', // Default role
          created_at: session.user.created_at,
          last_login: session.user.last_sign_in_at || null,
        };
        token.value = session.access_token;
        console.log('[useAuth] initialize: Session found, user set:', user.value);
      } else {
        user.value = null;
        token.value = null;
        console.log('[useAuth] initialize: No active session found.');
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((event, session) => {
        console.log(`[useAuth] Auth state change: ${event}`, session);
        if (event === 'SIGNED_IN' && session) {
          user.value = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            role: session.user.user_metadata?.role || 'user',
            created_at: session.user.created_at,
            last_login: session.user.last_sign_in_at || null,
          };
          token.value = session.access_token;
        } else if (event === 'SIGNED_OUT') {
          user.value = null;
          token.value = null;
          router.push('/login'); // Redirect to login page on sign out
        }
      });

    } catch (err: any) {
      console.error('[useAuth] initialize: Error during initialization:', err);
      error.value = 'ไม่สามารถดึงข้อมูลผู้ใช้ได้: ' + (err.message || 'Unknown error');
      user.value = null;
      token.value = null;
    } finally {
      loading.value = false;
      isInitialized.value = true;
      console.log('[useAuth] initialize: Finished. loading:', loading.value, 'isInitialized:', isInitialized.value, 'user:', user.value);
    }
  };

  /**
   * เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน
   * @param credentials ข้อมูลสำหรับเข้าสู่ระบบ (email, password)
   */
  const login = async (credentials: LoginCredentials) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        throw authError;
      }

      if (data.session) {
        user.value = {
          id: data.user?.id || '',
          email: data.user?.email || '',
          name: data.user?.user_metadata?.full_name || null,
          avatar_url: data.user?.user_metadata?.avatar_url || null,
          role: data.user?.user_metadata?.role || 'user',
          created_at: data.user?.created_at || '',
          last_login: data.user?.last_sign_in_at || null,
        };
        token.value = data.session.access_token;
        router.push('/'); // Redirect to home page on successful login
        return true;
      }
      return false;
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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name || '',
            role: 'user', // Default role for new registrations
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        user.value = {
          id: authData.user.id,
          email: authData.user.email || '',
          name: authData.user.user_metadata?.full_name || null,
          avatar_url: authData.user.user_metadata?.avatar_url || null,
          role: authData.user.user_metadata?.role || 'user',
          created_at: authData.user.created_at,
          last_login: authData.user.last_sign_in_at || null,
        };
        token.value = authData.session?.access_token || null;
        // Optionally redirect to a verification page or home
        // router.push('/verify-email');
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Registration failed:', err);
      error.value = err.message || 'การลงทะเบียนไม่สำเร็จ';
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * ออกจากระบบ
   */
  const logout = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { error: authError } = await supabase.auth.signOut();
      if (authError) {
        throw authError;
      }
      user.value = null;
      token.value = null;
      router.push('/login'); // Redirect to login page
      return true;
    } catch (err: any) {
      console.error('Logout failed:', err);
      error.value = err.message || 'ออกจากระบบไม่สำเร็จ';
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * เปลี่ยนรหัสผ่าน (สำหรับผู้ใช้ที่ล็อกอินอยู่)
   * @param newPassword รหัสผ่านใหม่
   */
  const changePassword = async (newPassword: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) {
        throw authError;
      }
      alert('เปลี่ยนรหัสผ่านสำเร็จ');
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
   * ตรวจสอบสิทธิ์การเข้าถึงตามบทบาท
   * @param requiredRole บทบาทที่ต้องการ (เช่น 'admin', 'user')
   */
  const checkAccess = (requiredRole?: string) => {
    if (!user.value) {
      return false; // Not logged in
    }
    if (!requiredRole) {
      return true; // No specific role required
    }
    return user.value.role === requiredRole;
  };

  // Initial call to initialize auth state
  initialize();

  // Return the reactive state and methods
  return {
    // Reactive State (already module-scoped, but returned for convenience)
    user,
    token,
    loading,
    error,
    isInitialized,
    // Computed Properties
    isLoggedIn,
    isAdmin,
    isLoading,
    // Methods
    initialize,
    login,
    register,
    logout,
    changePassword,
    fetchUserProfile: async () => { /* No longer needed, user is set by auth state changes */ }, // Keep for compatibility if used elsewhere
    checkAccess,
  };
}
