import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/auth';
import App from './App.vue';

// Import Vuetify
import vuetify from './plugins/vuetify';

// Import CSS
import './style.css';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(vuetify);

// Initialize auth store to check for existing session
const authStore = useAuthStore();
authStore.initializeAuth();

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./components/Dashboard.vue'), // Placeholder for Home page
      meta: { requiresAuth: true }, // Add meta field to require authentication
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('./views/Login.vue'),
    },
    {
      path: '/customers',
      name: 'CustomerList',
      component: () => import('./views/CustomerList.vue'),
      meta: { requiresAuth: true }, // This page requires authentication
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('./views/Signup.vue'),
    },
    {
      path: '/customers/new',
      name: 'AddCustomer',
      component: () => import('./views/CustomerForm.vue'),
      meta: { requiresAuth: true }, // Adding/editing customers requires authentication
    },
    {
      path: '/customers/:id/edit',
      name: 'EditCustomer',
      component: () => import('./views/CustomerForm.vue'),
      meta: { requiresAuth: true }, // Adding/editing customers requires authentication
    },
    {
      path: '/repairs',
      name: 'Repairs',
      component: () => import('./components/Dashboard.vue'), // ใช้ Dashboard แทน HelloWorld
      meta: { requiresAuth: true },
    },
    {
      path: '/products',
      name: 'ProductList',
      component: () => import('./views/ProductList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/products/new',
      name: 'AddProduct',
      component: () => import('./views/ProductForm.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/products/:id/edit',
      name: 'EditProduct',
      component: () => import('./views/ProductForm.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reports',
      name: 'Reports',
      component: () => import('./components/Dashboard.vue'), // ใช้ Dashboard แทน HelloWorld
      meta: { requiresAuth: true },
    },
    {
      path: '/categories',
      name: 'CategoryList',
      component: () => import('./views/CategoryList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/units',
      name: 'UnitList',
      component: () => import('./views/UnitList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('./components/Dashboard.vue'), // ใช้ Dashboard แทน HelloWorld
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('./components/Dashboard.vue'), // Placeholder for Profile page
      meta: { requiresAuth: true },
    },
    // Supplier routes
    {
      path: '/suppliers',
      name: 'SupplierList',
      component: () => import('./views/SupplierList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/suppliers/new',
      name: 'AddSupplier',
      component: () => import('./views/SupplierForm.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/suppliers/:id/edit',
      name: 'EditSupplier',
      component: () => import('./views/SupplierForm.vue'),
      meta: { requiresAuth: true },
    },
    // Purchase routes
    {
      path: '/purchases',
      name: 'PurchaseList',
      component: () => import('./views/PurchaseList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/stocks',
      name: 'StockList',
      component: () => import('./views/StockList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/purchases/new',
      name: 'PurchaseNew',
      component: () => import('./views/PurchaseForm.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/purchases/:id',
      name: 'PurchaseForm',
      component: () => import('./views/PurchaseForm.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
    // Add other routes here
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('./views/NotFound.vue'),
    },
  ],
});

// Navigation guard to check authentication
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // Diagnostic: Wait for auth state to be loaded
  while (authStore.loading) {
    await new Promise(resolve => setTimeout(resolve, 50)); // Wait briefly
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isLoggedIn = authStore.isLoggedIn;

  if (requiresAuth && !isLoggedIn) {
    next('/login');
  } else if (to.path === '/login' && isLoggedIn) {
    next('/');
  } else {
    next();
  }
});

app.use(router);

// Wait for auth to initialize and router to be ready before mounting
authStore.initializeAuth().then(() => {
  router.isReady().then(() => {
    app.mount('#app');
  });
});
