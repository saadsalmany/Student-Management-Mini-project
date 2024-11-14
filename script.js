// Initialize data storage
let students = JSON.parse(localStorage.getItem('students')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let currentPage = 1;
const itemsPerPage = 5;
let currentStudentId = null;

// DOM Elements
const authContainer = document.getElementById('authContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const studentForm = document.getElementById('studentForm');
const studentsTableBody = document.getElementById('studentsTableBody');
const adminName = document.getElementById('adminName');
const searchInput = document.getElementById('searchInput');
const filterDepartment = document.getElementById('filterDepartment');
const studentModal = document.getElementById('studentModal');
const deleteModal = document.getElementById('deleteModal');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');

// Toggle Forms
document.getElementById('showSignup').addEventListener('click', () => {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
});

document.getElementById('showLogin').addEventListener('click', () => {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// Auth Functions
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Simple authentication (in real app, this would connect to a backend)
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showDashboard();
        showToast('success', 'Login successful!');
    } else {
        showToast('error', 'Invalid credentials!');
    }
});

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.some(u => u.email === email)) {
        showToast('error', 'Email already exists!');
        return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showToast('success', 'Account created successfully!');
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// Dashboard Functions
function showDashboard() {
    authContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    adminName.textContent = currentUser.name;
    updateDashboardStats();
    renderStudents();
}

function updateDashboardStats() {
    document.getElementById('totalStudents').textContent = students.length;
    const departments = new Set(students.map(s => s.department));
    document.getElementById('totalDepartments').textContent = departments.size;
    document.getElementById('totalClasses').textContent = Math.ceil(students.length / 30); // Assuming 30 students per class
}

// Student Management Functions
studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const studentData = {
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
        // Update existing student
        const index = students.findIndex(s => s.id === currentStudentId);
        students[index] = studentData;
        showToast('success', 'Student updated successfully!');
    } else {
        // Add new student
        students.push(studentData);
        showToast('success', 'Student added successfully!');
    }

    localStorage.setItem('students', JSON.stringify(students));
    resetForm();
    updateDashboardStats();
    renderStudents();
});

function resetForm() {
    currentStudentId = null;
    studentForm.reset();
    formTitle.innerHTML = '<i class="fas fa-user-plus mr-2 text-blue-600"></i>Add New Student';
    submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i> Add Student';
}

document.getElementById('clearBtn').addEventListener('click', resetForm);

// Student List Management
function renderStudents() {
    let filteredStudents = students;

    // Apply search filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredStudents = filteredStudents.filter(student => 
            student.name.toLowerCase().includes(searchTerm) ||
            student.rollNumber.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm)
        );
    }

    // Apply department filter
    const departmentFilter = filterDepartment.value;
    if (departmentFilter) {
        filteredStudents = filteredStudents.filter(student => 
            student.department === departmentFilter
        );
    }

    // Pagination
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedStudents = filteredStudents.slice(start, end);

    // Update table
    studentsTableBody.innerHTML = paginatedStudents.map(student => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4">${student.name}</td>
            <td class="px-6 py-4">${student.rollNumber}</td>
            <td class="px-6 py-4">${student.department}</td>
            <td class="px-6 py-4">${student.semester}</td>
            <td class="px-6 py-4">${student.email}</td>
            <td class="px-6 py-4">${student.phone}</td>
            <td class="px-6 py-4">
                <button onclick="viewStudent('${student.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="editStudent('${student.id}')" class="text-green-600 hover:text-green-800 mr-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="showDeleteConfirmation('${student.id}')" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Update pagination info
    document.getElementById('startCount').textContent = start + 1;
    document.getElementById('endCount').textContent = Math.min(end, filteredStudents.length);
    document.getElementById('totalCount').textContent = filteredStudents.length;

    // Update pagination buttons
    updatePagination(totalPages);
}

function updatePagination(totalPages) {
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = `px-3 py-1 border rounded-lg ${currentPage === i ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`;
        button.textContent = i;
        button.onclick = () => {
            currentPage = i;
            renderStudents();
        };
        pageNumbers.appendChild(button);
    }

    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// Student Actions
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
        
        studentModal.classList.remove('hidden');
        studentModal.classList.add('flex');
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

        formTitle.innerHTML = '<i class="fas fa-edit mr-2 text-blue-600"></i>Edit Student';
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i> Update Student';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function showDeleteConfirmation(id) {
    currentStudentId = id;
    deleteModal.classList.remove('hidden');
    deleteModal.classList.add('flex');
}

// Toast Notification
function showToast(type, message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    const toastContainer = document.getElementById('toastContainer');

    // Set toast style based on type
    let bgColor, iconHtml;
    switch (type) {
        case 'success':
            bgColor = 'bg-green-500';
            iconHtml = '<i class="fas fa-check-circle text-white"></i>';
            break;
        case 'error':
            bgColor = 'bg-red-500';
            iconHtml = '<i class="fas fa-exclamation-circle text-white"></i>';
            break;
        default:
            bgColor = 'bg-blue-500';
            iconHtml = '<i class="fas fa-info-circle text-white"></i>';
    }

    toastContainer.className = `flex items-center p-4 rounded-lg shadow-lg ${bgColor} text-white`;
    toastIcon.innerHTML = iconHtml;
    toastMessage.textContent = message;

    // Show toast
    toast.classList.remove('translate-x-full');

    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        
        // Remove toast after animation completes
        setTimeout(() => {
            // Optional: reset toast position
        }, 300); // matches transition duration
    }, 3000);
}

// Event Listeners
searchInput.addEventListener('input', () => {
    currentPage = 1;
    renderStudents();
});

filterDepartment.addEventListener('change', () => {
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
    dashboardContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
    showToast('success', 'Logged out successfully!');
});

document.getElementById('closeModal').addEventListener('click', () => {
    studentModal.classList.add('hidden');
    studentModal.classList.remove('flex');
});

document.getElementById('confirmDelete').addEventListener('click', () => {
    if (currentStudentId) {
        students = students.filter(s => s.id !== currentStudentId);
        localStorage.setItem('students', JSON.stringify(students));
        deleteModal.classList.add('hidden');
        deleteModal.classList.remove('flex');
        currentStudentId = null;
        showToast('success', 'Student deleted successfully!');
        updateDashboardStats();
        renderStudents();
    }
});

document.getElementById('cancelDelete').addEventListener('click', () => {
    deleteModal.classList.add('hidden');
    deleteModal.classList.remove('flex');
    currentStudentId = null;
});

// Initialize
if (currentUser) {
    showDashboard();
}