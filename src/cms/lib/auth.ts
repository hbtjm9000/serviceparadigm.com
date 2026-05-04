/**
 * Simple authentication middleware for admin routes
 * Uses localStorage token + password hash verification
 * 
 * Usage: Include this script in admin pages, call checkAuth() on page load
 */

// Default password (change in production!)
const ADMIN_PASSWORD_HASH = 'paradigm2026'; // In production, use a real hash

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('admin_auth_token');
  return token === ADMIN_PASSWORD_HASH;
}

// Authenticate user with password
export function authenticate(password: string): boolean {
  if (password === ADMIN_PASSWORD_HASH) {
    localStorage.setItem('admin_auth_token', ADMIN_PASSWORD_HASH);
    return true;
  }
  return false;
}

// Logout user
export function logout(): void {
  localStorage.removeItem('admin_auth_token');
}

// Check auth and redirect to login if not authenticated
export function requireAuth(): boolean {
  if (typeof window === 'undefined') return true;
  
  if (!isAuthenticated()) {
    window.location.href = '/admin/login';
    return false;
  }
  return true;
}

// Create login page HTML
export function createLoginPage(error?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login - Paradigm CMS</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-md w-full">
    <div class="bg-white rounded-lg shadow-lg p-8">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Admin Login</h1>
        <p class="text-sm text-gray-500 mt-2">Enter password to access CMS admin</p>
      </div>
      
      ${error ? `
        <div class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-700">${error}</p>
        </div>
      ` : ''}
      
      <form id="login-form" class="space-y-6">
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter admin password"
            autofocus
          />
        </div>
        
        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Login
        </button>
      </form>
      
      <div class="mt-6 text-center">
        <a href="/" class="text-sm text-gray-500 hover:text-gray-700">
          ← Back to site
        </a>
      </div>
    </div>
  </div>
  
  <script>
    document.getElementById('login-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const password = document.getElementById('password').value;
      
      // Store token in localStorage
      localStorage.setItem('admin_auth_token', password);
      
      // Redirect to admin dashboard
      window.location.href = '/admin/experiments';
    });
  <\/script>
</body>
</html>`;
}
