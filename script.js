let students = JSON.parse(localStorage.getItem('students')) || [];
var currentUser = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('currentUser'));
let currentPage = 1;
const itemsPerPage = 5;
let currentStudentId = null;

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

if (currentUser) {
    showDashboard();
}
const adminCredentials = [
    { userId: 'admin', password: 'admin' },
  ];
  
  loginForm.addEventListener('submit', (e) => {
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
  });


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
  
    const activeCourses = new Set(students.map(s => `${s.department}-${s.semester}`));
    document.getElementById('activeCourses').textContent = activeCourses.size;
  }
  
  setInterval(updateDashboardStats, 5000);

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
        const index = students.findIndex(s => s.id === currentStudentId);
        students[index] = studentData;
        showToast('success', 'Student updated successfully!');
    } else {
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

function renderStudents() {
    let filteredStudents = students;

    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredStudents = filteredStudents.filter(student => 
            student.name.toLowerCase().includes(searchTerm) ||
            student.rollNumber.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm)
        );
    }

    const departmentFilter = filterDepartment.value;
    if (departmentFilter) {
        filteredStudents = filteredStudents.filter(student => 
            student.department === departmentFilter
        );
    }

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedStudents = filteredStudents.slice(start, end);

    studentsTableBody.innerHTML = paginatedStudents.map(student => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-600">${student.name.charAt(0)}</span>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${student.name}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.rollNumber}</td>
            <td class="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.department}</td>
            <td class="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.semester}</td>
            <td class="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.email}</td>
            <td class="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.phone}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-3">
                    <button onclick="viewStudent('${student.id}')" 
                            class="text-blue-600 hover:text-blue-800 transition-colors">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editStudent('${student.id}')" 
                            class="text-green-600 hover:text-green-800 transition-colors">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="showDeleteConfirmation('${student.id}')" 
                            class="text-red-600 hover:text-red-800 transition-colors">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Update pagination info
    document.getElementById('startCount').textContent = filteredStudents.length ? start + 1 : 0;
    document.getElementById('endCount').textContent = Math.min(end, filteredStudents.length);
    document.getElementById('totalCount').textContent = filteredStudents.length;

    // Update pagination controls
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = `px-3 py-1 border rounded-lg transition-colors ${
            currentPage === i 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'hover:bg-gray-50 text-gray-700 border-gray-200'
        }`;
        button.textContent = i;
        button.onclick = () => {
            currentPage = i;
            renderStudents();
        };
        pageNumbers.appendChild(button);
    }

    // Update navigation buttons
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
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

function showToast(type, message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    const toastContainer = document.getElementById('toastContainer');

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

    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
        
        setTimeout(() => {
        }, 300); 
    }, 2000);
}

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


signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  
  loginForm.parentElement.classList.remove('hidden');
  signupFormContainer.classList.add('hidden');
  
  showToast('success', 'Account created successfully!');
});

if (currentUser) {
    showDashboard();
}


// CSV Import/Export Functions
function exportToCSV() {
    if (students.length === 0) {
        showToast('error', 'No students to export!');
        return;
    }

    // Define CSV headers
    const headers = [
        'Name',
        'Date of Birth',
        'Gender',
        'Roll Number',
        'Department',
        'Semester',
        'Email',
        'Phone',
        'Address'
    ];

    // Convert students data to CSV format
    const csvData = students.map(student => [
        student.name,
        student.dateOfBirth,
        student.gender,
        student.rollNumber,
        student.department,
        student.semester,
        student.email,
        student.phone,
        student.address
    ]);

    // Combine headers and data
    const csvContent = [
        headers,
        ...csvData
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Students data exported successfully!');
}

function importFromCSV(file) {
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const csvData = event.target.result;
            const rows = csvData.split('\n');
            
            // Remove header row and empty rows
            const dataRows = rows.slice(1).filter(row => row.trim());
            
            const importedStudents = dataRows.map(row => {
                // Handle quoted values properly
                const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
                    .map(val => val.replace(/^"(.*)"$/, '$1'));
                
                return {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
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

            // Validate imported data
            const invalidEntries = importedStudents.filter(student => 
                !student.name || !student.rollNumber || !student.email
            );

            if (invalidEntries.length > 0) {
                showToast('error', 'Invalid data format in CSV file!');
                return;
            }

            // Add imported students to existing list
            students = [...students, ...importedStudents];
            localStorage.setItem('students', JSON.stringify(students));
            updateDashboardStats();
            renderStudents();
            showToast('success', `${importedStudents.length} students imported successfully!`);
            
        } catch (error) {
            console.error('Error importing CSV:', error);
            showToast('error', 'Error importing CSV file. Please check the format.');
        }
    };

    reader.onerror = function() {
        showToast('error', 'Error reading the file');
    };

    reader.readAsText(file);
}

// Handle file input change
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.type !== 'text/csv') {
            showToast('error', 'Please select a CSV file');
            return;
        }
        importFromCSV(file);
    }
}

