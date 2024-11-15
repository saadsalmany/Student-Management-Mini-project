let students = JSON.parse(localStorage.getItem('students')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let currentPage = 1;
let currentStudentId = null;
const itemsPerPage = 5;

const adminCredentials = [
  { userId: 'admin', password: 'admin' },
];

const elements = {
  auth: document.getElementById('authContainer'),
  dashboard: document.getElementById('dashboardContainer'),
  loginForm: document.getElementById('loginForm'),
  signupForm: document.getElementById('signupForm'),
  studentForm: document.getElementById('studentForm'),
  tableBody: document.getElementById('studentsTableBody'),
  adminName: document.getElementById('adminName'),
  search: document.getElementById('searchInput'),
  department: document.getElementById('filterDepartment'),
  studentModal: document.getElementById('studentModal'),
  deleteModal: document.getElementById('deleteModal'),
  formTitle: document.getElementById('formTitle'),
  submitBtn: document.getElementById('submitBtn')
};

if (currentUser) {
  showDashboard();
}

function handleLogin(e) {
  e.preventDefault();
  const userId = document.getElementById('loginUserId').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!userId || !password) {
    showToast('error', 'Please enter both username and password!');
    return;
  }

  const isAdmin = adminCredentials.find((cred) => cred.userId === userId && cred.password === password);

  if (isAdmin) {
    currentUser = { userId, isAdmin: true, name: 'Admin' };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showDashboard();
    showToast('success', 'Admin login successful!');
  } else {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find((u) => u.userId === userId && u.password === password);
  
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      showDashboard();
      showToast('success', 'Login successful!');
    } else {
      showToast('error', 'Invalid credentials!');
    }
  }
}

elements.loginForm.addEventListener('submit', handleLogin);

function showDashboard() {
  elements.auth.classList.add('hidden');
  elements.dashboard.classList.remove('hidden');
  elements.adminName.textContent = currentUser.name;
  updateStats();
  renderStudents();
}

function updateStats() {
  document.getElementById('totalStudents').textContent = students.length;
  const depts = new Set(students.map(s => s.department));
  document.getElementById('totalDepartments').textContent = depts.size;
  const courses = new Set(students.map(s => `${s.department}-${s.semester}`));
  document.getElementById('activeCourses').textContent = courses.size;
}

setInterval(updateStats, 5000);

function handleStudentForm(e) {
  e.preventDefault();
  
  const student = {
    id: currentStudentId || Date.now().toString(),
    name: document.getElementById('studentName').value,
    dateOfBirth: document.getElementById('dateOfBirth').value,
    gender: document.getElementById('gender').value,
    rollNumber: document.getElementById('rollNumber').value,
    department: document.getElementById('department').value,
    semester: document.getElementById('semester').value,
    email: document.getElementById('studentEmail').value,
    phone: document.getElementById('phoneNumber').value,
    address: document.getElementById('address').value
  };

  if (currentStudentId) {
    const idx = students.findIndex(s => s.id === currentStudentId);
    students[idx] = student;
    showToast('success', 'Student updated successfully!');
  } else {
    students.push(student);
    showToast('success', 'Student added successfully!');
  }

  localStorage.setItem('students', JSON.stringify(students));
  resetForm();
  updateStats();
  renderStudents();
}

elements.studentForm.addEventListener('submit', handleStudentForm);

function resetForm() {
  currentStudentId = null;
  elements.studentForm.reset();
  elements.formTitle.innerHTML = '<i class="fas fa-user-plus mr-2 text-blue-600"></i>Add New Student';
  elements.submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i> Add Student';
}

document.getElementById('clearBtn').addEventListener('click', resetForm);

function renderStudents() {
  let filtered = students;

  const searchTerm = elements.search.value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(searchTerm) ||
      s.rollNumber.toLowerCase().includes(searchTerm) ||
      s.email.toLowerCase().includes(searchTerm)
    );
  }

  const deptFilter = elements.department.value;
  if (deptFilter) {
    filtered = filtered.filter(s => s.department === deptFilter);
  }

  const pages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const currentStudents = filtered.slice(start, end);

  elements.tableBody.innerHTML = currentStudents.map(s => `
    <tr class="hover:bg-gray-50 transition-colors">
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <div class="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span class="text-sm font-medium text-gray-600">${s.name.charAt(0)}</span>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-900">${s.name}</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${s.rollNumber}</td>
      <td class="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">${s.department}</td>
      <td class="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">${s.semester}</td>
      <td class="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">${s.email}</td>
      <td class="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">${s.phone}</td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div class="flex justify-end space-x-3">
          <button onclick="viewStudent('${s.id}')" class="text-blue-600 hover:text-blue-800 transition-colors">
            <i class="fas fa-eye"></i>
          </button>
          <button onclick="editStudent('${s.id}')" class="text-green-600 hover:text-green-800 transition-colors">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="showDeleteConfirmation('${s.id}')" class="text-red-600 hover:text-red-800 transition-colors">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  document.getElementById('startCount').textContent = filtered.length ? start + 1 : 0;
  document.getElementById('endCount').textContent = Math.min(end, filtered.length);
  document.getElementById('totalCount').textContent = filtered.length;

  updatePageButtons(pages);
}

function updatePageButtons(totalPages) {
  const pageNumbers = document.getElementById('pageNumbers');
  pageNumbers.innerHTML = '';
  
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `px-3 py-1 border rounded-lg transition-colors ${
      currentPage === i ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50 text-gray-700 border-gray-200'
    }`;
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      renderStudents();
    };
    pageNumbers.appendChild(btn);
  }

  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage === totalPages;
}

function viewStudent(id) {
  const student = students.find(s => s.id === id);
  if (student) {
    document.getElementById('modalName').textContent = student.name;
    document.getElementById('modalDob').textContent = student.dateOfBirth;
    document.getElementById('modalGender').textContent = student.gender;
    document.getElementById('modalRoll').textContent = student.rollNumber;
    document.getElementById('modalDepartment').textContent = student.department;
    document.getElementById('modalSemester').textContent = student.semester;
    document.getElementById('modalEmail').textContent = student.email;
    document.getElementById('modalPhone').textContent = student.phone;
    document.getElementById('modalAddress').textContent = student.address;
    
    elements.studentModal.classList.remove('hidden');
    elements.studentModal.classList.add('flex');
  }
}

function editStudent(id) {
  const student = students.find(s => s.id === id);
  if (student) {
    currentStudentId = id;
    document.getElementById('studentName').value = student.name;
    document.getElementById('dateOfBirth').value = student.dateOfBirth;
    document.getElementById('gender').value = student.gender;
    document.getElementById('rollNumber').value = student.rollNumber;
    document.getElementById('department').value = student.department;
    document.getElementById('semester').value = student.semester;
    document.getElementById('studentEmail').value = student.email;
    document.getElementById('phoneNumber').value = student.phone;
    document.getElementById('address').value = student.address;

    elements.formTitle.innerHTML = '<i class="fas fa-edit mr-2 text-blue-600"></i>Edit Student';
    elements.submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i> Update Student';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function showDeleteConfirmation(id) {
  currentStudentId = id;
  elements.deleteModal.classList.remove('hidden');
  elements.deleteModal.classList.add('flex');
}

function showToast(type, message) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toastMessage');
  const icon = document.getElementById('toastIcon');
  const container = document.getElementById('toastContainer');

  let style = type === 'success' 
    ? ['bg-green-500', '<i class="fas fa-check-circle text-white"></i>']
    : ['bg-red-500', '<i class="fas fa-exclamation-circle text-white"></i>'];

  container.className = `flex items-center p-4 rounded-lg shadow-lg ${style[0]} text-white`;
  icon.innerHTML = style[1];
  msg.textContent = message;

  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2000);
}

elements.search.addEventListener('input', () => {
  currentPage = 1;
  renderStudents();
});

elements.department.addEventListener('change', () => {
  currentPage = 1;
  renderStudents();
});

document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderStudents();
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  const totalPages = Math.ceil(students.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderStudents();
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('currentUser');
  currentUser = null;
  elements.dashboard.classList.add('hidden');
  elements.auth.classList.remove('hidden');
  showToast('success', 'Logged out successfully!');
});

document.getElementById('closeModal').addEventListener('click', () => {
  elements.studentModal.classList.add('hidden');
  elements.studentModal.classList.remove('flex');
});

document.getElementById('confirmDelete').addEventListener('click', () => {
  if (currentStudentId) {
    students = students.filter(s => s.id !== currentStudentId);
    localStorage.setItem('students', JSON.stringify(students));
    elements.deleteModal.classList.add('hidden');
    elements.deleteModal.classList.remove('flex');
    currentStudentId = null;
    showToast('success', 'Student deleted successfully!');
    updateStats();
    renderStudents();
  }
});

document.getElementById('cancelDelete').addEventListener('click', () => {
  elements.deleteModal.classList.add('hidden');
  elements.deleteModal.classList.remove('flex');
  currentStudentId = null;
});

elements.signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loginForm.parentElement.classList.remove('hidden');
  signupFormContainer.classList.add('hidden');
  showToast('success', 'Account created successfully!');
});

function exportToCSV() {
  if (!students.length) {
    showToast('error', 'No students to export!');
    return;
  }

  const headers = ['Name', 'Date of Birth', 'Gender', 'Roll Number', 'Department', 'Semester', 'Email', 'Phone', 'Address'];
  const csvData = students.map(s => [
    s.name, s.dateOfBirth, s.gender, s.rollNumber, s.department,
    s.semester, s.email, s.phone, s.address
  ]);

  const csvContent = [headers, ...csvData]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('success', 'Students data exported successfully!');
}

function importFromCSV(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const rows = e.target.result.split('\n');
      const dataRows = rows.slice(1).filter(row => row.trim());
      
      const newStudents = dataRows.map(row => {
        const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
          .map(val => val.replace(/^"(.*)"$/, '$1'));
        
        return {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
          name: values[0],
          dateOfBirth: values[1],
          gender: values[2],
          rollNumber: values[3],
          department: values[4],
          semester: values[5],
          email: values[6],
          phone: values[7],
          address: values[8]
        };
      });

      const badData = newStudents.filter(s => !s.name || !s.rollNumber || !s.email);

      if (badData.length) {
        showToast('error', 'CSV file has invalid data!');
        return;
      }

      students = [...students, ...newStudents];
      localStorage.setItem('students', JSON.stringify(students));
      updateStats();
      renderStudents();
      showToast('success', `Added ${newStudents.length} new students!`);
      
    } catch (err) {
      console.error('CSV import failed:', err);
      showToast('error', 'Please check your CSV file format');
    }
  };

  reader.onerror = function() {
    showToast('error', 'Failed to read file');
  };

  reader.readAsText(file);
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  if (file.type !== 'text/csv') {
    showToast('error', 'Please upload a CSV file');
    return;
  }
  
  importFromCSV(file);
}

const utils = {
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  validatePhone: (phone) => {
    const re = /^\d{10}$/;
    return re.test(phone);
  },

  formatDate: (date) => {
    return new Date(date).toLocaleDateString();
  },

  generateId: () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (currentUser) {
    showDashboard();
  }

  const csvInput = document.getElementById('csvFileInput');
  if (csvInput) {
    csvInput.addEventListener('change', handleFileSelect);
  }
});

let searchTimeout;
elements.search.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage = 1;
    renderStudents();
  }, 300);
});

function initializeEventListeners() {
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('.modal');
      modals.forEach(modal => {
        if (!modal.classList.contains('hidden')) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      });
    }
  });
}

function handleStudentFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const studentData = Object.fromEntries(formData.entries());
  
  if (!utils.validateEmail(studentData.email)) {
    showToast('error', 'Please enter a valid email address');
    return;
  }

  if (!utils.validatePhone(studentData.phone)) {
    showToast('error', 'Please enter a valid 10-digit phone number');
    return;
  }

  submitStudentData(studentData);
}

function submitStudentData(data) {
  const student = {
    ...data,
    id: currentStudentId || utils.generateId()
  };

  if (currentStudentId) {
    const index = students.findIndex(s => s.id === currentStudentId);
    students[index] = student;
    showToast('success', 'Student info updated!');
  } else {
    students.push(student);
    showToast('success', 'New student added!');
  }

  localStorage.setItem('students', JSON.stringify(students));
  resetForm();
  updateStats();
  renderStudents();
}

elements.studentForm.removeEventListener('submit', handleStudentForm);
elements.studentForm.addEventListener('submit', handleStudentFormSubmit);

initializeEventListeners();

window.addEventListener('beforeunload', () => {
  localStorage.setItem('students', JSON.stringify(students));
});

let lastSaveTime = Date.now();
const autoSaveInterval = setInterval(() => {
  if (Date.now() - lastSaveTime >= 30000) {
    localStorage.setItem('students', JSON.stringify(students));
    lastSaveTime = Date.now();
  }
}, 30000);