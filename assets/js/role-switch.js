// Role Switching Functionality

// Show the role selection modal
function showRoleModal() {
    const modal = document.getElementById('role-modal');
    if (modal) {
      modal.classList.add('show');
    } else {
      // Create modal if it doesn't exist
      createRoleModal();
    }
  }
  
  // Hide the role selection modal
  function hideRoleModal() {
    const modal = document.getElementById('role-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  }
  
  // Create role modal dynamically if needed
  function createRoleModal() {
    const modal = document.createElement('div');
    modal.id = 'role-modal';
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
      <div class="modal-content">
        <h1>Welcome to Metanoia: Transforming Plastic into Potential</h1>
        <p>A journey of transformation for plastic waste education.</p>
        
        <div class="role-buttons">
          <button id="student-btn" class="role-btn student-btn">
            <img src="/assets/images/icons/student.svg" alt="">
            I'm a Student
          </button>
          <button id="teacher-btn" class="role-btn teacher-btn">
            <img src="/assets/images/icons/teacher.svg" alt="">
            I'm a Teacher
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('student-btn').addEventListener('click', () => {
      setRole('student');
    });
    
    document.getElementById('teacher-btn').addEventListener('click', () => {
      setRole('teacher');
    });
    
    // Show modal with animation
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }
  
  // Set user role and redirect
  function setRole(role) {
    localStorage.setItem('role', role);
    redirectToDashboard();
  }
  
  // Redirect to appropriate dashboard
  function redirectToDashboard() {
    const role = localStorage.getItem('role');
    if (role === 'student') {
      window.location.href = '/student/index.html';
    } else if (role === 'teacher') {
      window.location.href = '/teacher/index.html';
    } else {
      // If no role is set, show the modal
      showRoleModal();
    }
  }
  
  // Check if role exists and redirect if needed
  function checkRole() {
    const role = localStorage.getItem('role');
    const currentPath = window.location.pathname;
    
    // If on landing page and role exists, redirect
    if (currentPath === '/' || currentPath === '/index.html') {
      if (role) {
        redirectToDashboard();
        return;
      }
    }
    
    // If on a student page but role is teacher, redirect
    if (currentPath.includes('/student/') && role === 'teacher') {
      window.location.href = '/teacher/index.html';
      return;
    }
    
    // If on a teacher page but role is student, redirect
    if (currentPath.includes('/teacher/') && role === 'student') {
      window.location.href = '/student/index.html';
      return;
    }
    
    // If on any page but landing and no role exists, show modal
    if (!role && currentPath !== '/' && currentPath !== '/index.html') {
      showRoleModal();
    }
  }
  
  // Add event listener for role badge to allow switching
  document.addEventListener('DOMContentLoaded', () => {
    const roleBadge = document.getElementById('role-badge');
    if (roleBadge) {
      roleBadge.addEventListener('click', showRoleModal);
    }
    
    // Add event listeners to buttons if on landing page
    const studentBtn = document.getElementById('student-btn');
    const teacherBtn = document.getElementById('teacher-btn');
    
    if (studentBtn) {
      studentBtn.addEventListener('click', () => {
        setRole('student');
      });
    }
    
    if (teacherBtn) {
      teacherBtn.addEventListener('click', () => {
        setRole('teacher');
      });
    }
  });