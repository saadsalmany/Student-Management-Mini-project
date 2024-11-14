// Toast notification functionality
const toast = {
    element: document.getElementById('toast'),
    icon: document.getElementById('toastIcon'),
    message: document.getElementById('toastMessage'),
    show(type, msg) {
        const colors = {
            success: 'bg-green-100 text-green-800',
            error: 'bg-red-100 text-red-800',
            warning: 'bg-yellow-100 text-yellow-800'
        };
        const icons = {
            success: '<i class="fas fa-check-circle text-green-500"></i>',
            error: '<i class="fas fa-times-circle text-red-500"></i>',
            warning: '<i class="fas fa-exclamation-circle text-yellow-500"></i>'
        };
        
        this.element.className = `fixed top-4 right-4 z-50 transform transition-transform duration-300 ${colors[type]}`;
        this.icon.innerHTML = icons[type];
        this.message.textContent = msg;
        this.element.style.transform = 'translateX(0)';
        
        setTimeout(() => {
            this.element.style.transform = 'translateX(100%)';
        }, 3000);
    }
};

// Initialize localStorage with empty arrays if not exists
if (!localStorage.getItem('admins')) {
    localStorage.setItem('admins', JSON.stringify([]));
}
if (!localStorage.getItem('students')) {
    localStorage.setItem('students', JSON.stringify([]));
}

// Current admin session and pagination state
let currentAdmin = null;
let currentPage = 1;
const itemsPerPage = 10;
let filteredStudents = [];

// DOM Elements
const authContainer = document.getElementById('authContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignupBtn = document.getElementById('showSignup');
const showLoginBtn = document.getElementById('showLogin');
const studentForm = document.getElementById('studentForm');
const studentsTableBody = document.getElementById('studentsTableBody');
const logoutBtn = document.getElementById('logoutBtn');
const adminNameSpan = document.getElementById('adminName');
const clearBtn = document.getElementById('clearBtn');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const searchInput = document.getElementById('searchInput');
const filterDepartment = document.getElementById('filterDepartment');
const studentModal = document.getElementById('studentModal');
const deleteModal = document.getElementById('deleteModal');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete = document.getElementById('cancelDelete');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');

// Form validation
function validateForm() {
    const validations = {
        studentName: {
            validate: value => value.length >= 2,
            message: 'Name must be at least 2 characters long'
        },
        rollNumber: {
            validate: value => /^[A-Z0-9]{5,10}$/.test(value),
            message: 'Roll number must be 5-10 alphanumeric characters'
        },
        studentEmail: {
            validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Please enter a valid email address'
        },
        phoneNumber: {
            validate: value => /^\d{10}$/.test(value),
            message: 'Phone number must be 10 digits'
        },
        dateOfBirth: {
            validate: value => {
                const date = new Date(value);
                const now = new Date();
                const age = now.getFullYear() - date.getFullYear();
                return age >= 15 && age <= 30;
            },
            message: 'Student must be between 15 and 30 years old'
        }
    };
    let isValid = true;
    let firstInvalid = null;

    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    Object.keys(validations).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const value = field.value.trim();
        
        if (!value || !validations[fieldId].validate(value)) {
            field.classList.add('border-red-500');
            
            // Add error message below the field
            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-red-500 text-sm mt-1 error-message';
            errorDiv.textContent = validations[fieldId].message;
            field.parentNode.appendChild(errorDiv);
            
            if (!firstInvalid) firstInvalid = field;
            isValid = false;
        } else {
            field.classList.remove('border-red-500');
        }
    });

    if (!isValid) {
        firstInvalid.focus();
        toast.show('error', 'Please correct the highlighted fields');
    }

    return isValid;
}
    




// Show/Hide Forms with animation
showSignupBtn.addEventListener('click', () => {
    loginForm.classList.add('opacity-0');
    setTimeout(() => {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        setTimeout(() => signupForm.classList.remove('opacity-0'), 50);
    }, 300);
});

showLoginBtn.addEventListener('click', () => {
    signupForm.classList.add('opacity-0');
    setTimeout(() => {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        setTimeout(() => loginForm.classList.remove('opacity-0'), 50);
    }, 300);
});

// Signup Handler
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    const admins = JSON.parse(localStorage.getItem('admins'));
    
    if (admins.some(admin => admin.email === email)) {
        toast.show('error', 'Email already exists!');
        return;
    }

    admins.push({ name, email, password });
    localStorage.setItem('admins', JSON.stringify(admins));
    
    signupForm.reset();
    showLoginBtn.click();
    toast.show('success', 'Signup successful! Please login.');
});

// Login Handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const admins = JSON.parse(localStorage.getItem('admins'));
    const admin = admins.find(a => a.email === email && a.password === password);

    if (admin) {
        currentAdmin = admin;
        authContainer.classList.add('opacity-0');
        setTimeout(() => {
            authContainer.classList.add('hidden');
            dashboardContainer.classList.remove('hidden');
            setTimeout(() => dashboardContainer.classList.remove('opacity-0'), 50);
        }, 300);
        adminNameSpan.textContent = admin.name;
        loadStudents();
        updateStatistics();
        loginForm.reset();
        toast.show('success', 'Welcome back, ' + admin.name);
    } else {
        toast.show('error', 'Invalid credentials!');
    }
});

// Logout Handler
logoutBtn.addEventListener('click', () => {
    currentAdmin = null;
    dashboardContainer.classList.add('opacity-0');
    setTimeout(() => {
        dashboardContainer.classList.add('hidden');
        authContainer.classList.remove('hidden');
        setTimeout(() => authContainer.classList.remove('opacity-0'), 50);
    }, 300);
    toast.show('success', 'Logged out successfully');
});

// Clear Form Handler
clearBtn.addEventListener('click', () => {
    studentForm.reset();
    document.getElementById('studentId').value = '';
    formTitle.innerHTML = '<i class="fas fa-user-plus mr-2 text-blue-600"></i>Add New Student';
    submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Add Student';
    Array.from(studentForm.elements).forEach(element => {
        element.classList.remove('border-red-500');
    });
});

// Add/Edit Student Handler
studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const studentId = document.getElementById('studentId').value;
    const student = {
        id: studentId || Date.now().toString(),
        name: document.getElementById('studentName').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value,
        rollNumber: document.getElementById('rollNumber').value,
        department: document.getElementById('department').value,
        semester: document.getElementById('semester').value,
        email: document.getElementById('studentEmail').value,
        phone: document.getElementById('phoneNumber').value,
        address: document.getElementById('address').value,
        adminId: currentAdmin.email
    };

    let students = JSON.parse(localStorage.getItem('students'));

    if (studentId) {
        const index = students.findIndex(s => s.id === studentId);
        students[index] = student;
        toast.show('success', 'Student updated successfully');
    } else {
        students.push(student);
        toast.show('success', 'Student added successfully');
    }

    localStorage.setItem('students', JSON.stringify(students));
    loadStudents();
    updateStatistics();
    studentForm.reset();
    document.getElementById('studentId').value = '';
    formTitle.innerHTML = '<i class="fas fa-user-plus mr-2 text-blue-600"></i>Add New Student';
    submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Add Student';
});

// Export Students Data
exportBtn.addEventListener('click', () => {
    const students = JSON.parse(localStorage.getItem('students'))
        .filter(student => student.adminId === currentAdmin.email);
    
    const csv = [
        ['Name', 'Roll Number', 'Department', 'Semester', 'Email', 'Phone', 'Address'],
        ...students.map(student => [
            student.name,
            student.rollNumber,
            student.department,
            student.semester,
            student.email,
            student.phone,
            student.address
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'students.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.show('success', 'Students data exported successfully');
});

// Import Students Data
importBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const csv = event.target.result;
            const lines = csv.split('\n');
            const headers = lines[0].split(',');
            
            const students = JSON.parse(localStorage.getItem('students'));
            
            lines.slice(1).forEach(line => {
                const values = line.split(',');
                if (values.length === headers.length) {
                    const student = {
                        id: Date.now().toString(),
                        name: values[0],
                        rollNumber: values[1],
                        department: values[2],
                        semester: values[3],
                        email: values[4],
                        phone: values[5],
                        address: values[6],
                        adminId: currentAdmin.email
                    };
                    students.push(student);
                }
            });

            localStorage.setItem('students', JSON.stringify(students));
            loadStudents();
            updateStatistics();
            toast.show('success', 'Students data imported successfully');
        } catch (error) {
            toast.show('error', 'Error importing data. Please check the file format');
        }
    };

    reader.readAsText(file);
});

// Delete Student
let studentToDelete = null;

function showDeleteConfirmation(id) {
    studentToDelete = id;
    deleteModal.classList.remove('hidden');
    deleteModal.classList.add('flex');
}

confirmDelete.addEventListener('click', () => {
    if (studentToDelete) {
        let students = JSON.parse(localStorage.getItem('students'));
        students = students.filter(s => s.id !== studentToDelete);
        localStorage.setItem('students', JSON.stringify(students));
        loadStudents();
        updateStatistics();
        toast.show('success', 'Student deleted successfully');
    }
    deleteModal.classList.remove('flex');
    deleteModal.classList.add('hidden');
    studentToDelete = null;
});

cancelDelete.addEventListener('click', () => {
    deleteModal.classList.remove('flex');
    deleteModal.classList.add('hidden');
    studentToDelete = null;
});

// Print Student Details
function printStudentDetails(id) {
    const students = JSON.parse(localStorage.getItem('students'));
    const student = students.find(s => s.id === id);
    
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Student Details - ${student.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .details { margin-bottom: 20px; }
                    .label { font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Student Details</h1>
                </div>
                <div class="details">
                    <p><span class="label">Name:</span> ${student.name}</p>
                    <p><span class="label">Roll Number:</span> ${student.rollNumber}</p>
                    <p><span class="label">Department:</span> ${student.department}</p>
                    <p><span class="label">Semester:</span> ${student.semester}</p>
                    <p><span class="label">Email:</span> ${student.email}</p>
                    <p><span class="label">Phone:</span> ${student.phone}</p>
                    <p><span class="label">Address:</span> ${student.address}</p>
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Add scroll behavior
window.scrollTo({ 
    top: 0, 
    behavior: 'smooth' 
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check for existing session
    const savedAdmin = localStorage.getItem('currentAdmin');
    if (savedAdmin) {
        currentAdmin = JSON.parse(savedAdmin);
        authContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        adminNameSpan.textContent = currentAdmin.name;
        loadStudents();
        updateStatistics();
    }

    // Set up event listeners for modals
    window.addEventListener('click', (e) => {
        if (e.target === studentModal) {
            studentModal.classList.remove('flex');
            studentModal.classList.add('hidden');
        }
        if (e.target === deleteModal) {
            deleteModal.classList.remove('flex');
            deleteModal.classList.add('hidden');
            studentToDelete = null;
        }
    });

    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'absolute bg-gray-800 text-white text-sm px-2 py-1 rounded -mt-8 -ml-1';
            tooltip.textContent = e.target.dataset.tooltip;
            e.target.appendChild(tooltip);
        });
        element.addEventListener('mouseleave', (e) => {
            const tooltip = e.target.querySelector('div');
            if (tooltip) tooltip.remove();
        });
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'n':
                e.preventDefault();
                clearBtn.click();
                document.getElementById('studentName').focus();
                break;
            case 'f':
                e.preventDefault();
                searchInput.focus();
                break;
            case 's':
                e.preventDefault();
                if (studentForm.contains(document.activeElement)) {
                    studentForm.dispatchEvent(new Event('submit'));
                }
                break;
        }
    }
});

// Search and Filter Functionality
searchInput.addEventListener('input', loadStudents);
filterDepartment.addEventListener('change', loadStudents);

// Load Students with Search, Filter, and Pagination
function loadStudents() {
    const searchTerm = searchInput.value.toLowerCase();
    const departmentFilter = filterDepartment.value;
    
    let students = JSON.parse(localStorage.getItem('students'))
        .filter(student => student.adminId === currentAdmin.email);

    // Apply filters
    filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm) ||
                            student.rollNumber.toLowerCase().includes(searchTerm) ||
                            student.email.toLowerCase().includes(searchTerm);
        const matchesDepartment = !departmentFilter || student.department === departmentFilter;
        return matchesSearch && matchesDepartment;
    });

    // Update pagination
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = 1;
    
    // Update page numbers
    updatePagination(totalPages);
    
    // Get current page items
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredStudents.slice(startIndex, endIndex);

    // Update table
    studentsTableBody.innerHTML = currentItems.map(student => `
        <tr class="border-t hover:bg-gray-50 transition duration-150">
            <td class="px-6 py-4 whitespace-nowrap">${student.name}</td>
            <td class="px-6 py-4 whitespace-nowrap">${student.rollNumber}</td>
            <td class="px-6 py-4 whitespace-nowrap">${student.department}</td>
            <td class="px-6 py-4 whitespace-nowrap">${student.semester}</td>
            <td class="px-6 py-4 whitespace-nowrap">${student.email}</td>
            <td class="px-6 py-4 whitespace-nowrap">${student.phone}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button onclick="viewStudent('${student.id}')" class="text-blue-600 hover:text-blue-700 mr-2">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="editStudent('${student.id}')" class="text-green-600 hover:text-green-700 mr-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="showDeleteConfirmation('${student.id}')" class="text-red-600 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Update counts
    document.getElementById('startCount').textContent = filteredStudents.length ? startIndex + 1 : 0;
    document.getElementById('endCount').textContent = Math.min(endIndex, filteredStudents.length);
    document.getElementById('totalCount').textContent = filteredStudents.length;
}

// Update Statistics
function updateStatistics() {
    const students = JSON.parse(localStorage.getItem('students'))
        .filter(student => student.adminId === currentAdmin.email);
    
    document.getElementById('totalStudents').textContent = students.length;
    
    const departments = new Set(students.map(s => s.department));
    document.getElementById('totalDepartments').textContent = departments.size;

    const classes = new Set(students.map(s => s.semester));
    document.getElementById('totalClasses').textContent = classes.size;
}

// Pagination Functions
function updatePagination(totalPages) {
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    pageNumbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = `px-3 py-1 border rounded-lg ${currentPage === i ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`;
        button.textContent = i;
        button.onclick = () => {
            currentPage = i;
            loadStudents();
        };
        pageNumbers.appendChild(button);
    }

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadStudents();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        loadStudents();
    }
});

// Student Details Modal Functions
function viewStudent(id) {
    const students = JSON.parse(localStorage.getItem('students'));
    const student = students.find(s => s.id === id);
    
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

document.getElementById('closeModal').addEventListener('click', () => {
    studentModal.classList.remove('flex');
    studentModal.classList.add('hidden');
});

// Edit Student
function editStudent(id) {
    const students = JSON.parse(localStorage.getItem('students'));
    const student = students.find(s => s.id === id);
    
    document.getElementById('studentId').value = student.id;
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
    submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Update Student';
    
    // window.scrollTo({ top: 0,
}